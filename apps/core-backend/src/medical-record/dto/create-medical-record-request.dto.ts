import { ApiProperty } from '@nestjs/swagger';
import type { UploadedFileDto } from './uploaded-file.dto';

export class CreateMedicalRecordRequestDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: UploadedFileDto;

  @ApiProperty()
  personId: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  doctorName?: string;

  @ApiProperty({ required: false })
  hospitalName?: string;

  @ApiProperty({ required: false })
  recordDate?: string;
}
