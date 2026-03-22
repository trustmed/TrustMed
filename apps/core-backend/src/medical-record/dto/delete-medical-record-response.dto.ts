import { ApiProperty } from '@nestjs/swagger';

export class DeleteMedicalRecordResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}
