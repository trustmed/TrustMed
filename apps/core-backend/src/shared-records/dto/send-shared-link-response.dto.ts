import { ApiProperty } from '@nestjs/swagger';

export class SendSharedLinkResponseDto {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty({ example: 'Shared link sent successfully' })
  message: string;
}
