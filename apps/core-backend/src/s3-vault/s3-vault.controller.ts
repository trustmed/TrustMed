import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    UploadedFile,
    UseInterceptors,
    ParseUUIDPipe,
    Param,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { S3VaultService } from './s3-vault.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { DownloadUrlResponseDto } from './dto/download-url-response.dto';
import { FileValidationPipe } from './file-validation.pipe';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { AuthUser } from '../entities/auth-user.entity';
import { RecordCategory } from '../entities/medical-record.entity';

@ApiTags('s3-vault')
@Controller('s3-vault')
export class S3VaultController {
    constructor(
        private readonly s3VaultService: S3VaultService,
        @InjectRepository(AuthUser)
        private readonly authUserRepo: Repository<AuthUser>,
    ) { }

    /**
     * Resolves Clerk user ID → AuthUser.id (UUID).
     */
    private async resolveAuthUserId(clerkUserId: string): Promise<string> {
        const authUser = await this.authUserRepo.findOne({
            where: { clerkUserId },
        });
        if (!authUser) {
            throw new NotFoundException('Auth user not found');
        }
        return authUser.id;
    }

    /**
     * Accepts a multipart/form-data upload, hashes the raw file (SHA-256),
     * encrypts it (AES-256-GCM), envelope-encrypts the AES key,
     * uploads to S3, and persists a MedicalRecord.
     *
     * `uploaderId` is derived from the JWT — never from the request body.
     * `patientId` is a body param because a doctor may upload for a patient.
     */
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
        }),
    )
    @ApiOperation({
        summary: 'Upload, hash, encrypt, and store a medical record file',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Medical record file to encrypt and upload',
                },
                patientId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID of the patient this record belongs to',
                },
                category: {
                    type: 'string',
                    enum: Object.values(RecordCategory),
                    description: 'Category of the medical record',
                },
                notes: {
                    type: 'string',
                    description: 'Optional notes about the record',
                },
                doctorName: {
                    type: 'string',
                    description: 'Name of the doctor who issued the record',
                },
                hospitalName: {
                    type: 'string',
                    description: 'Name of the hospital/clinic',
                },
                recordDate: {
                    type: 'string',
                    format: 'date',
                    description: 'Date when the record was issued',
                },
            },
            required: ['file', 'patientId'],
        },
    })
    async uploadFile(
        @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
        @Body('patientId', new ParseUUIDPipe({ version: '4' }))
        patientId: string,
        @CurrentUser() user: JwtPayload,
        @Req() req: Request,
        @Body('category') category?: RecordCategory,
        @Body('notes') notes?: string,
        @Body('doctorName') doctorName?: string,
        @Body('hospitalName') hospitalName?: string,
        @Body('recordDate') recordDateStr?: string,
    ): Promise<UploadResponseDto> {
        const uploaderId = await this.resolveAuthUserId(user.sub);

        const recordDate = recordDateStr ? new Date(recordDateStr) : undefined;

        const result = await this.s3VaultService.uploadEncryptedFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            patientId,
            uploaderId,
            {
                category,
                notes,
                doctorName,
                hospitalName,
                recordDate,
            },
            req.ip,
        );

        return {
            objectKey: result.objectKey,
            s3Uri: result.s3Uri,
            documentHash: result.documentHash,
            medicalRecordId: result.medicalRecordId,
            message: 'File encrypted and uploaded successfully',
            downloadUrl: `/api/medical-records/${result.medicalRecordId}/download`,
            fileUrl: `/api/medical-records/${result.medicalRecordId}/download`,
        };
    }

    /**
     * Generates a presigned URL for downloading an encrypted medical record.
     */
    @Get('download/:recordId')
    @ApiOperation({
        summary: 'Generate a presigned S3 URL for record download',
    })
    @ApiResponse({ status: 200, type: DownloadUrlResponseDto })
    async getDownloadUrl(
        @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<DownloadUrlResponseDto> {
        const userId = await this.resolveAuthUserId(user.sub);

        const url = await this.s3VaultService.getPresignedDownloadUrl(
            recordId,
            userId,
        );

        return {
            url,
            downloadUrl: `/api/medical-records/${recordId}/download`,
            objectKey: '', // Handled by recordId
            expiresInSeconds: this.s3VaultService.isLocalStorageMode() ? 0 : 300,
        };
    }
}
