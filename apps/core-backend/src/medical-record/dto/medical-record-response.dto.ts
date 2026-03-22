import { ApiProperty } from '@nestjs/swagger';
import { CreateMedicalRecordResponseDto } from './create-medical-record-response.dto';

export class MedicalRecordListResponseDto {
  @ApiProperty({ type: [CreateMedicalRecordResponseDto] })
  records: CreateMedicalRecordResponseDto[];
}

export class MedicalRecordResponseDto extends CreateMedicalRecordResponseDto {}
