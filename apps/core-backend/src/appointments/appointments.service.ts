import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Person } from '../entities/person.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { AuditService, AuditEventType } from '../audit/audit.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly auditService: AuditService,
  ) { }

  private toResponseDto(a: Appointment): AppointmentResponseDto {
    return {
      id: a.id,
      appointmentNo: a.id.slice(0, 8),
      appointmentType: a.type || '',
      doctorName: a.doctor || '',
      date: a.date instanceof Date ? a.date.toISOString().slice(0, 10) : a.date,
      hospitalLocation: a.location || '',
      status: a.status,
      address: a.address || '',
      phone: a.phone || '',
      email: a.email || '',
    };
  }

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
    const saved = await this.appointmentRepository.save(appointment);
    await this.auditService.log({
      eventType: AuditEventType.APPOINTMENT_CREATED,
      actorId: patient.id,
      targetResource: saved.id,
    });
    return saved;
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
    return appointments.map((a) => this.toResponseDto(a));
  }
  async findOneById(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return this.toResponseDto(appointment);
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
    if (dto.address !== undefined) appointment.address = dto.address;
    if (dto.phone !== undefined) appointment.phone = dto.phone;
    if (dto.email !== undefined) appointment.email = dto.email;
    // patientId update is not allowed here for safety
    const updated = await this.appointmentRepository.save(appointment);
    return this.toResponseDto(updated);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Appointment not found');
    return { success: true };
  }
}
