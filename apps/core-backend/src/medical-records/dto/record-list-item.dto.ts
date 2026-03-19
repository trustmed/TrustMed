import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordCategory } from '../../entities/medical-record.entity';

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
    description: 'Category of the medical record',
    enum: RecordCategory,
    example: RecordCategory.LAB_REPORT,
  })
  category: RecordCategory;

  @ApiPropertyOptional({
    description: 'Optional notes about the record',
    example: 'Patient showed high glucose levels',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Name of the doctor who issued the record',
    example: 'Dr. Smith',
  })
  doctorName?: string;

  @ApiPropertyOptional({
    description: 'Name of the hospital/clinic',
    example: 'City General Hospital',
  })
  hospitalName?: string;

  @ApiPropertyOptional({
    description: 'Date when the record was issued',
    example: '2026-03-15',
  })
  recordDate?: Date;

  @ApiProperty({
    description: 'When the record was uploaded',
    example: '2026-03-18T14:30:00.000Z',
  })
  createdAt: Date;
}

