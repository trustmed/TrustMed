import { IsUUID } from 'class-validator';

export class DeleteAppointmentDto {
  @IsUUID()
  id: string;
}
