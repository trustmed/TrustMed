import { ApiProperty } from '@nestjs/swagger';
// TODO: Move RecordCategory to a shared types package if needed

export enum RecordCategory {
  LAB_REPORT = 'lab_report',
  PRESCRIPTION = 'prescription',
  IMAGING = 'imaging',
  DISCHARGE_SUMMARY = 'discharge_summary',
  VACCINATION = 'vaccination',
  OTHER = 'other',
}

export class UpdateMedicalRecordRequestDto {
  @ApiProperty({ enum: RecordCategory, required: false })
  category?: RecordCategory;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  doctorName?: string;

  @ApiProperty({ required: false })
  hospitalName?: string;

  @ApiProperty({ required: false })
  recordDate?: string;
}
