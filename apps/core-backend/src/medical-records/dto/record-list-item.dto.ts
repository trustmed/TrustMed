import { ApiProperty } from '@nestjs/swagger';

/** DTO returned when listing medical records — keys and S3 URIs are NEVER exposed. */
export class RecordListItemDto {
  @ApiProperty({
    description: 'UUID of the medical record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'blood-test-report.pdf',
  })
  originalFileName: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 204800,
  })
  fileSize: number;

  @ApiProperty({
    description:
      'SHA-256 hex digest of the raw file (for integrity verification)',
    example: 'e3b0c44298fc1c149afbf4c8996fb924...',
  })
  documentHash: string;

  @ApiProperty({
    description: 'UUID of the patient this record belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  patientId: string;

  @ApiProperty({
    description: 'When the record was uploaded',
    example: '2026-03-18T14:30:00.000Z',
  })
  createdAt: Date;
}
