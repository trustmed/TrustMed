import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Person } from '../entities/person.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async create(createDto: CreateAppointmentDto): Promise<Appointment> {
    const patient = await this.personRepository.findOne({
      where: { authUserId: createDto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    const appointment = this.appointmentRepository.create({
      ...createDto,
      date: new Date(createDto.date),
      patient,
    });
    return this.appointmentRepository.save(appointment);
  }

  async findAllByAuthUserId(
    authUserId: string,
  ): Promise<AppointmentResponseDto[]> {
    const person = await this.personRepository.findOne({
      where: { authUserId },
    });
    if (!person) return [];
    const appointments = await this.appointmentRepository.find({
      where: { patient: { id: person.id } },
      relations: ['patient'],
    });
    return appointments.map((a) => ({
      id: a.id,
      appointmentNo: a['appointmentNo'] || '',
      appointmentType: a['type'] || '',
      doctorName: a['doctor'] || '',
      date: a.date instanceof Date ? a.date.toISOString().slice(0, 10) : a.date,
      hospitalLocation: a['location'] || '',
      status: a.status,
      address: a['address'] || '',
      phone: a['phone'] || '',
      email: a['email'] || '',
    }));
  }
  async findOneById(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return {
      id: appointment.id,
      appointmentNo: appointment['appointmentNo'] || '',
      appointmentType: appointment['type'] || '',
      doctorName: appointment['doctor'] || '',
      date:
        appointment.date instanceof Date
          ? appointment.date.toISOString().slice(0, 10)
          : appointment.date,
      hospitalLocation: appointment['location'] || '',
      status: appointment.status,
      address: appointment['address'] || '',
      phone: appointment['phone'] || '',
      email: appointment['email'] || '',
    };
  }

  async edit(
    dto: { id: string } & Partial<CreateAppointmentDto>,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: dto.id },
      relations: ['patient'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    // Update fields if provided
    if (dto.date) appointment.date = new Date(dto.date);
    if (dto.doctor) appointment.doctor = dto.doctor;
    if (dto.type) appointment.type = dto.type;
    if (dto.location) appointment.location = dto.location;
    if (dto.status) appointment.status = dto.status;
    if (dto.address) appointment['address'] = dto.address;
    if (dto.phone) appointment['phone'] = dto.phone;
    if (dto.email) appointment['email'] = dto.email;
    // patientId update is not allowed here for safety
    const updated = await this.appointmentRepository.save(appointment);
    return {
      id: updated.id,
      appointmentNo: updated['appointmentNo'] || '',
      appointmentType: updated['type'] || '',
      doctorName: updated['doctor'] || '',
      date:
        updated.date instanceof Date
          ? updated.date.toISOString().slice(0, 10)
          : updated.date,
      hospitalLocation: updated['location'] || '',
      status: updated.status,
      address: updated['address'] || '',
      phone: updated['phone'] || '',
      email: updated['email'] || '',
    };
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Appointment not found');
    return { success: true };
  }
}
