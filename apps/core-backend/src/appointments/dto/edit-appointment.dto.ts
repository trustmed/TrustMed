import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsUUID } from 'class-validator';

export class EditAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsUUID()
  id: string;
}
