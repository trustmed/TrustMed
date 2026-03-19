import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { AppointmentStatus } from '../../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiPropertyOptional({ description: 'Appointment reference number', example: 'D001' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  appointmentNo?: string;

  @ApiPropertyOptional({ description: 'Patient display name', example: 'Kate Wanigaratne' })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  patientName?: string;

  @ApiPropertyOptional({ description: 'Doctor full name', example: 'Dr. S. Sumanaweera' })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  doctorName?: string;

  @ApiPropertyOptional({ description: 'Type of appointment', example: 'Psychiatric' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  appointmentType?: string;

  @ApiPropertyOptional({ description: 'Hospital or clinic location', example: 'Maharagama' })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  hospitalLocation?: string;

  @ApiPropertyOptional({ description: 'Appointment date (YYYY-MM-DD)', example: '2026-01-04' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Patient address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, default: AppointmentStatus.PENDING })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}

