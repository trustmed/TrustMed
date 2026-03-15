import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { RecordCategory } from '../../entities/medical-record.entity';

export class UploadMedicalRecordDto {
  @ApiProperty({ enum: RecordCategory })
  @IsEnum(RecordCategory)
  category: RecordCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  recordDate?: string;
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  recordDate?: string;
}