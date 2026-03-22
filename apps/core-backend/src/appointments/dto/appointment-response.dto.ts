import { ApiProperty } from '@nestjs/swagger';
import type { AppointmentStatus } from '../../entities/appointment.entity';

export class AppointmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  appointmentNo: string;

  @ApiProperty()
  appointmentType: string;

  @ApiProperty()
  doctorName: string;

  @ApiProperty({ description: 'ISO date string YYYY-MM-DD' })
  date: string;

  @ApiProperty()
  hospitalLocation: string;

  @ApiProperty({ enum: ['accepted', 'cancelled', 'pending'] })
  status: AppointmentStatus;

  @ApiProperty()
  address: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;
}
