import { ApiProperty } from '@nestjs/swagger';

export class AuthMessageDto {
  @ApiProperty({ example: 'Login successful' })
  message!: string;
}
