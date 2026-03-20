import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Res,
  Body,
  UploadedFile,
  UseInterceptors,
  Delete,
  Patch,
  ParseUUIDPipe,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { MedicalRecordsService } from './medical-records.service';
import { RecordListItemDto } from './dto/record-list-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../entities/auth-user.entity';
import { S3VaultService } from '../s3-vault/s3-vault.service';
import { FileValidationPipe } from '../s3-vault/file-validation.pipe';
import {
  RecordCategory,
  MedicalRecord,
} from '../entities/medical-record.entity';

@ApiTags('medical-records')
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly s3VaultService: S3VaultService,
    @InjectRepository(AuthUser)
    private readonly authUserRepo: Repository<AuthUser>,
  ) {}

  /**
   * Resolves the Clerk user ID from the JWT payload to the internal
   * `AuthUser.id` UUID used throughout the data model.
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
   * List all medical records belonging to the authenticated user.
   * Returns metadata only — keys and S3 URIs are never exposed.
   */
  @Get('me')
  @ApiOperation({ summary: 'List my medical records (metadata only)' })
  async listMyRecords(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<RecordListItemDto[]> {
    const authUserId = await this.resolveAuthUserId(user.sub);
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    return this.medicalRecordsService.listMyRecords(
      authUserId,
      req.ip,
      baseUrl,
    );
  }

  /**
   * List all medical records for a specific person ID.
   * Path param `id` is the personId.
   */
  @Get(':id')
  @ApiOperation({ summary: 'List medical records for a person' })
  async listRecordsByPerson(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: Request,
  ): Promise<RecordListItemDto[]> {
    // Note: In a real system, we'd check if the CurrentUser has permission to view this person's records.
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    return this.medicalRecordsService.listMyRecords(id, req.ip, baseUrl);
  }

  /**
   * Decrypt and download a medical record.
   * Verifies consent (owner / authorized party) before streaming.
   */
  @Get(':id/download')
  @ApiOperation({
    summary: 'Download a decrypted medical record (consent required)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the medical record',
  })
  async downloadRecord(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const authUserId = await this.resolveAuthUserId(user.sub);

    const { buffer, originalFileName, mimeType } =
      await this.medicalRecordsService.downloadRecord(id, authUserId, req.ip);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(originalFileName)}"`,
      'Content-Length': buffer.length.toString(),
    });

    return new StreamableFile(buffer);
  }

  /**
   * Accepts a multipart/form-data upload for a specific patient.
   * Path param `id` is the patientId.
   */
  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    }),
  )
  @ApiOperation({
    summary: 'Upload, encrypt, and store a medical record for a patient',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Medical record file (e.g. PDF, JPG)',
        },
        category: {
          type: 'string',
          enum: Object.values(RecordCategory),
          description: 'Category of the medical record',
        },
        notes: {
          type: 'string',
          description: 'Optional notes',
        },
        doctorName: {
          type: 'string',
          description: 'Issuing doctor',
        },
        hospitalName: {
          type: 'string',
          description: 'Issuing hospital',
        },
        recordDate: {
          type: 'string',
          format: 'date',
          description: 'Date of the record',
        },
      },
      required: ['file'],
    },
  })
  async uploadFile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) patientId: string,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Body('category') category?: RecordCategory,
    @Body('notes') notes?: string,
    @Body('doctorName') doctorName?: string,
    @Body('hospitalName') hospitalName?: string,
    @Body('recordDate') recordDateStr?: string,
  ): Promise<RecordListItemDto & { message: string }> {
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
      ...result.savedRecord,
      fileName: result.savedRecord.originalFileName,
      fileType: result.savedRecord.mimeType,
      personId: result.savedRecord.patientId,
      fileUrl: `${req.protocol}://${req.get(
        'host',
      )}/api/medical-records/${result.medicalRecordId}/download`,
      message: 'Medical record uploaded and encrypted successfully',
    } as unknown as RecordListItemDto & { message: string };
  }

  /**
   * Update medical record metadata.
   */
  @Patch(':id/records/:recordId')
  @ApiOperation({ summary: 'Update medical record metadata' })
  async updateRecord(
    @Param('id', new ParseUUIDPipe({ version: '4' })) personId: string,
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @Body() updates: Partial<MedicalRecord>,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<RecordListItemDto> {
    const authUserId = await this.resolveAuthUserId(user.sub);
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    return this.medicalRecordsService.updateRecord(
      recordId,
      authUserId,
      updates,
      req.ip,
      baseUrl,
    );
  }

  /**
   * Delete a medical record.
   */
  @Delete(':id/records/:recordId')
  @ApiOperation({ summary: 'Delete a medical record' })
  async deleteRecord(
    @Param('id', new ParseUUIDPipe({ version: '4' })) personId: string,
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<void> {
    const authUserId = await this.resolveAuthUserId(user.sub);
    await this.medicalRecordsService.deleteRecord(recordId, authUserId, req.ip);
  }

  /**
   * Get download URL for a record.
   */
  @Get(':id/records/:recordId/url')
  @ApiOperation({ summary: 'Get a direct download URL for a record' })
  async getDownloadUrl(
    @Param('id', new ParseUUIDPipe({ version: '4' })) personId: string,
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @Req() req: Request,
  ): Promise<{ url: string }> {
    const protocol = req.protocol;
    const host = req.get('host');
    return {
      url: `${protocol}://${host}/api/medical-records/${recordId}/download`,
    };
  }
}
