import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptConsentDto {
  @ApiProperty({
    description: 'The duration for which access is granted',
    enum: ['15m', '1h', '4h', '8h'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['15m', '1h', '4h', '8h'])
  duration: string;
}
