import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

export enum AppointmentStatus {
  ACCEPTED = 'ACCEPTED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
}

@Entity('appointments')
export class Appointment extends BaseEntity {
  @ManyToOne(() => Person, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'person_id' })
  person: Person | null;

  @Column({ name: 'appointment_no', type: 'varchar', length: 20, nullable: true })
  appointmentNo: string | null;

  @Column({ name: 'patient_name', type: 'varchar', length: 150, nullable: true })
  patientName: string | null;

  @Column({ name: 'doctor_name', type: 'varchar', length: 150, nullable: true })
  doctorName: string | null;

  @Column({ name: 'appointment_type', type: 'varchar', length: 100, nullable: true })
  appointmentType: string | null;

  @Column({ name: 'hospital_location', type: 'varchar', length: 150, nullable: true })
  hospitalLocation: string | null;

  @Column({ name: 'date', type: 'date', nullable: true })
  date: Date | null;

  @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 50, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;
}

