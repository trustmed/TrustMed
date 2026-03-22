import { IsString, IsEnum, IsDateString, IsUUID } from 'class-validator';
import type { AppointmentStatus } from '../../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsDateString()
  date: string;

  @IsString()
  doctor: string;

  @IsString()
  type: string;

  @IsString()
  location: string;

  @IsEnum(['pending', 'accepted', 'cancelled'])
  status: AppointmentStatus;

  @IsUUID()
  patientId: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;
}
