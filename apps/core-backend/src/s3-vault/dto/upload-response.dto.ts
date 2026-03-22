import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
    @ApiProperty({
        description: 'S3 object key where the encrypted file is stored',
        example: 'encrypted/550e8400-e29b-41d4-a716-446655440000-report.pdf',
    })
    objectKey: string;

    @ApiProperty({
        description: 'Full S3 URI for the encrypted file',
        example: 's3://trustmed-vault/encrypted/550e8400-report.pdf',
    })
    s3Uri: string;

    @ApiProperty({
        description: 'SHA-256 hex digest of the raw (unencrypted) file',
        example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    })
    documentHash: string;

    @ApiProperty({
        description: 'UUID of the persisted MedicalRecord row',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    medicalRecordId: string;

    @ApiProperty({
        description: 'Human-readable status message',
        example: 'File encrypted and uploaded successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Direct backend URL to download the decrypted file',
        example: '/api/medical-records/550e8400-e29b-41d4-a716-446655440000/download',
    })
    downloadUrl: string;

    @ApiProperty({
        description: 'Compatibility field for fileUrl',
        example: '/api/medical-records/550e8400-e29b-41d4-a716-446655440000/download',
    })
    fileUrl: string;
}
