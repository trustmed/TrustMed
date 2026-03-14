import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;
}
