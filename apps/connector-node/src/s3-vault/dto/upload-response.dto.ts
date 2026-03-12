import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
    @ApiProperty({
        description: 'S3 object key where the encrypted file is stored',
        example: 'encrypted/550e8400-e29b-41d4-a716-446655440000-report.pdf',
    })
    objectKey: string;

    @ApiProperty({
        description: 'Hex-encoded AES-256-GCM encryption key. Store this securely — it is required to decrypt the file.',
        example: 'a1b2c3d4e5f6...',
    })
    encryptionKey: string;

    @ApiProperty({
        description: 'Human-readable status message',
        example: 'File encrypted and uploaded successfully',
    })
    message: string;
}
