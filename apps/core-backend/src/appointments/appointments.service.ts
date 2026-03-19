import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const entity = this.appointmentsRepository.create({
      appointmentNo: dto.appointmentNo,
      patientName: dto.patientName,
      doctorName: dto.doctorName,
      appointmentType: dto.appointmentType,
      hospitalLocation: dto.hospitalLocation,
      date: dto.date ? new Date(dto.date) : null,
      address: dto.address,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      status: dto.status,
    });
    return this.appointmentsRepository.save(entity);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find();
  }

  async findOne(id: string): Promise<Appointment | null> {
    return this.appointmentsRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const existing = await this.appointmentsRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (dto.date !== undefined) {
      existing.date = dto.date ? new Date(dto.date) : null;
      delete (dto as any).date;
    }

    Object.assign(existing, {
      appointmentNo: dto.appointmentNo ?? existing.appointmentNo,
      patientName: dto.patientName ?? existing.patientName,
      doctorName: dto.doctorName ?? existing.doctorName,
      appointmentType: dto.appointmentType ?? existing.appointmentType,
      hospitalLocation: dto.hospitalLocation ?? existing.hospitalLocation,
      address: dto.address ?? existing.address,
      phoneNumber: dto.phoneNumber ?? existing.phoneNumber,
      email: dto.email ?? existing.email,
      status: dto.status ?? existing.status,
    });

    return this.appointmentsRepository.save(existing);
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentsRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException('Appointment not found');
    }
  }
}

