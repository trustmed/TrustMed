import { ApiProperty } from '@nestjs/swagger';

export class AuthMessageDto {
  @ApiProperty()
  message: string;
}
