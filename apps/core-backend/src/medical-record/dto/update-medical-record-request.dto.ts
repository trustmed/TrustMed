import { ApiProperty } from '@nestjs/swagger';
import { RecordCategory } from '../../entities/medical-record.entity';


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
