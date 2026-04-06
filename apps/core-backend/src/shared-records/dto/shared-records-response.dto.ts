import { ApiProperty } from '@nestjs/swagger';

export class SharedRecordItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  recipient: string;

  @ApiProperty()
  date: string;

  @ApiProperty({ enum: ['active', 'expired', 'deactive'] })
  status: 'active' | 'expired' | 'deactive';
}

export class ShareMedicalRecordItemDto {
  @ApiProperty()
  id: number;

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
