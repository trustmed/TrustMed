import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccessRequestDto {
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  hospitalId!: string;

  @IsString()
  @IsNotEmpty()
  purpose!: string;
}
