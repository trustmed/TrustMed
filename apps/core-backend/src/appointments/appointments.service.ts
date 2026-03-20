import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Person } from '../entities/person.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(AuthUser)
    private readonly authUserRepository: Repository<AuthUser>,
  ) {}

  private async getOrCreatePersonForClerkUser(
    clerkUserId: string,
  ): Promise<Person> {
    const authUser = await this.authUserRepository.findOne({
      where: { clerkUserId },
    });

    if (!authUser) {
      throw new NotFoundException('Auth user not found');
    }

    let person = await this.personRepository.findOne({
      where: { authUserId: authUser.id },
    });

    if (!person) {
      person = this.personRepository.create({
        authUserId: authUser.id,
        email: authUser.email,
      });
      await this.personRepository.save(person);
    }

    return person;
  }

  async createForUser(
    clerkUserId: string,
    dto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const person = await this.getOrCreatePersonForClerkUser(clerkUserId);

    // Generate the next numeric appointment number for this user.
    // Ignore non-numeric legacy values (e.g. "D001") to avoid collisions.
    const recent = await this.appointmentsRepository.find({
      where: { person: { id: person.id } },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const maxNumeric = recent.reduce((max, appt) => {
      const raw = appt.appointmentNo;
      if (!raw) return max;
      if (!/^\d+$/.test(raw)) return max;
      const n = parseInt(raw, 10);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);

    const nextNumber = (maxNumeric + 1).toString().padStart(4, '0');

    const entity = this.appointmentsRepository.create({
      person,
      appointmentNo: nextNumber,
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

  async findAllForUser(clerkUserId: string): Promise<Appointment[]> {
    const person = await this.getOrCreatePersonForClerkUser(clerkUserId);
    return this.appointmentsRepository.find({
      where: { person: { id: person.id } },
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Appointment | null> {
    return this.appointmentsRepository.findOne({ where: { id } });
  }

  async findOneForUser(clerkUserId: string, id: string): Promise<Appointment> {
    const person = await this.getOrCreatePersonForClerkUser(clerkUserId);
    const appt = await this.appointmentsRepository.findOne({
      where: { id, person: { id: person.id } },
    });
    if (!appt) {
      throw new NotFoundException('Appointment not found');
    }
    return appt;
  }

  async updateForUser(
    clerkUserId: string,
    id: string,
    dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const person = await this.getOrCreatePersonForClerkUser(clerkUserId);
    const existing = await this.appointmentsRepository.findOne({
      where: { id, person: { id: person.id } },
    });
    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (dto.date !== undefined) {
      existing.date = dto.date ? new Date(dto.date) : null;
    }

    Object.assign(existing, {
      // appointmentNo is intentionally immutable
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

  async removeForUser(clerkUserId: string, id: string): Promise<void> {
    // First ensure ownership (throws if not found for this user),
    // then soft-delete by id.
    await this.findOneForUser(clerkUserId, id);
    await this.appointmentsRepository.softDelete(id);
  }
}
