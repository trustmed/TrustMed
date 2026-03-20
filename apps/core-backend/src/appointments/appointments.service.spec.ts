import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { Appointment } from '../entities/appointment.entity';
import { Person } from '../entities/person.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

type MockRepo<T> = Partial<Record<keyof Repository<T>, jest.Mock>> & {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  softDelete: jest.Mock;
};

function createMockRepo<T>(): MockRepo<T> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
  };
}

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let appointmentRepo: MockRepo<Appointment>;
  let personRepo: MockRepo<Person>;
  let authUserRepo: MockRepo<AuthUser>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: createMockRepo<Appointment>(),
        },
        {
          provide: getRepositoryToken(Person),
          useValue: createMockRepo<Person>(),
        },
        {
          provide: getRepositoryToken(AuthUser),
          useValue: createMockRepo<AuthUser>(),
        },
      ],
    }).compile();

    service = moduleRef.get(AppointmentsService);
    appointmentRepo = moduleRef.get(getRepositoryToken(Appointment));
    personRepo = moduleRef.get(getRepositoryToken(Person));
    authUserRepo = moduleRef.get(getRepositoryToken(AuthUser));
  });

  describe('createForUser', () => {
    it('creates an appointment linked to the current user person', async () => {
      const clerkUserId = 'clerk_123';
      const authUser: Partial<AuthUser> = {
        id: 'auth_1',
        email: 'user@example.com',
      };
      const person: Partial<Person> = {
        id: 'person_1',
        email: 'user@example.com',
      };
      const dto: CreateAppointmentDto = {
        patientName: 'Kate',
        doctorName: 'Dr. Smith',
        appointmentType: 'General',
        hospitalLocation: 'City Hospital',
        date: '2026-01-01',
      };

      authUserRepo.findOne.mockResolvedValue(authUser);
      personRepo.findOne.mockResolvedValue(person);
      appointmentRepo.findOne.mockResolvedValue(null);
      const created = {
        id: 'appt_1',
        appointmentNo: '0001',
        ...dto,
      } as unknown as Appointment;
      appointmentRepo.create.mockReturnValue(created);
      appointmentRepo.save.mockResolvedValue(created);

      const result = await service.createForUser(clerkUserId, dto);

      expect(authUserRepo.findOne).toHaveBeenCalledWith({
        where: { clerkUserId },
      });
      expect(personRepo.findOne).toHaveBeenCalledWith({
        where: { authUserId: authUser.id },
      });
      expect(appointmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentNo: '0001',
          patientName: 'Kate',
          doctorName: 'Dr. Smith',
        }),
      );
      expect(result).toEqual(created);
    });
  });

  describe('findAllForUser', () => {
    it('returns appointments only for the current user person', async () => {
      const clerkUserId = 'clerk_123';
      const authUser: Partial<AuthUser> = {
        id: 'auth_1',
        email: 'user@example.com',
      };
      const person: Partial<Person> = {
        id: 'person_1',
        email: 'user@example.com',
      };
      const rows: Appointment[] = [{ id: 'appt_1' } as Appointment];

      authUserRepo.findOne.mockResolvedValue(authUser);
      personRepo.findOne.mockResolvedValue(person);
      appointmentRepo.find.mockResolvedValue(rows);

      const result = await service.findAllForUser(clerkUserId);

      expect(appointmentRepo.find).toHaveBeenCalledWith({
        where: { person: { id: person.id } },
        order: { date: 'ASC' },
      });
      expect(result).toBe(rows);
    });
  });
});
