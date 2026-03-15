import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
//import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RecordCategory } from '../../entities/medical-record.entity';

export class UploadMedicalRecordDto {
  @ApiProperty({ enum: RecordCategory })
  @IsEnum(RecordCategory)
  category: RecordCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMedicalRecordDto {
  @ApiPropertyOptional({ enum: RecordCategory })
  @IsOptional()
  @IsEnum(RecordCategory)
  category?: RecordCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
