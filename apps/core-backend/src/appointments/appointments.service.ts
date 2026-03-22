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
}
