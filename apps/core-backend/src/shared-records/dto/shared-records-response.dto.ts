import { ApiProperty } from '@nestjs/swagger';

export class SharedRecordItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  recipient: string;

  @ApiProperty()
  date: string;

  @ApiProperty({ enum: ['active', 'expired', 'deactivated'] })
  status: 'active' | 'expired' | 'deactivated';
}

export class ShareMedicalRecordItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientName: string;

  @ApiProperty()
  recordType: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  doctor: string;
}

export class SharedRecordsResponseDto {
  @ApiProperty({ type: [SharedRecordItemDto] })
  sharedRecords: SharedRecordItemDto[];

  @ApiProperty({ type: [ShareMedicalRecordItemDto] })
  medicalRecords: ShareMedicalRecordItemDto[];
}
