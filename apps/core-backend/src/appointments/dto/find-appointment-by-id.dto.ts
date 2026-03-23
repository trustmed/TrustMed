import { IsUUID } from 'class-validator';

export class FindAppointmentByIdDto {
  @IsUUID()
  id: string;
}
