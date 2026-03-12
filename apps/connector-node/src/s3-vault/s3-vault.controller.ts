import {
    Controller,
    Post,
    Get,
    Param,
    Query,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { S3VaultService } from './s3-vault.service.js';
import { UploadResponseDto } from './dto/upload-response.dto.js';
import { DownloadUrlResponseDto } from './dto/download-url-response.dto.js';
import { memoryStorage } from 'multer';

@ApiTags('s3-vault')
@Controller()
export class S3VaultController {
    constructor(private readonly s3VaultService: S3VaultService) { }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
        }),
    )
    @ApiOperation({ summary: 'Upload and encrypt a file to S3-compatible storage' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to encrypt and upload',
                },
            },
            required: ['file'],
        },
    })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('No file provided. Use form field "file".');
        }

        const result = await this.s3VaultService.uploadEncryptedFile(
            file.buffer,
            file.originalname,
        );

        return {
            objectKey: result.objectKey,
            encryptionKey: result.encryptionKey,
            message: 'File encrypted and uploaded successfully',
        };
    }

    @Get('download-url/*key')
    @ApiOperation({ summary: 'Generate a presigned download URL for an encrypted file' })
    @ApiParam({
        name: 'key',
        description: 'S3 object key (e.g., encrypted/uuid-filename.pdf)',
        example: 'encrypted/550e8400-e29b-41d4-a716-446655440000-report.pdf',
    })
    @ApiQuery({
        name: 'expiresIn',
        required: false,
        description: 'URL expiry in seconds (default 300 = 5 minutes)',
        example: 300,
    })
    async getDownloadUrl(
        @Param('key') key: string | string[],
        @Query('expiresIn', new ParseIntPipe({ optional: true })) expiresIn?: number,
    ): Promise<DownloadUrlResponseDto> {
        const expiresInSeconds = expiresIn ?? 300;

        // In NestJS 11 (path-to-regexp v8), wildcard parameters are captured as arrays
        const objectKey = Array.isArray(key) ? key.join('/') : key;

        const url = await this.s3VaultService.generatePresignedDownloadUrl(
            objectKey,
            expiresInSeconds,
        );

        return {
            url,
            objectKey,
            expiresInSeconds,
        };
    }
}
