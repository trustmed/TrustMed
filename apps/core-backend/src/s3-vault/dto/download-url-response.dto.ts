import { ApiProperty } from '@nestjs/swagger';

export class DownloadUrlResponseDto {
  @ApiProperty({
    description:
      'Presigned URL that grants temporary download access to the encrypted file',
    example:
      'https://s3.example.com/trustmed-vault/encrypted/uuid-file.pdf?X-Amz-...',
  })
  url: string;

  @ApiProperty({
    description: 'S3 object key for the requested file',
    example: 'encrypted/550e8400-e29b-41d4-a716-446655440000-report.pdf',
  })
  objectKey: string;

  @ApiProperty({
    description: 'Number of seconds until the presigned URL expires',
    example: 300,
  })
  expiresInSeconds: number;
}
