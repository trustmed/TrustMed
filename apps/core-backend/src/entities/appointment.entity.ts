import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

export type AppointmentStatus = 'pending' | 'accepted' | 'cancelled';

@Entity('appointments')
export class Appointment extends BaseEntity {
  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ length: 100 })
  doctor: string;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 100 })
  location: string;

  @Column({ length: 200, nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'cancelled'],
    default: 'pending',
  })
  status: AppointmentStatus;

  @ManyToOne(() => Person, { nullable: false })
  patient: Person;
}
