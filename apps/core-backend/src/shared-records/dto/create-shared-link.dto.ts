import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';

export class CreateSharedLinkDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  recipientName: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  medicalRecordIds: string[];
}
