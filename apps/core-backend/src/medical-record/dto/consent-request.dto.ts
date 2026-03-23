import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptConsentDto {
  @ApiProperty({
    description: 'The duration for which access is granted',
    enum: ['30m', '1h', '2h', '4h', '24h'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['30m', '1h', '2h', '4h', '24h'])
  duration: string;
}
