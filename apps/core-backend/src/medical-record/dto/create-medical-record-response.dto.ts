import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecordResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  personId: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  fileType: string;

  @ApiProperty()
  fileSize: number;

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

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
