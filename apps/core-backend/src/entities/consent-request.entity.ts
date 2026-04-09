import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MedicalRecord } from './medical-record.entity';
import { AuthUser } from './auth-user.entity';
import { Person } from './person.entity';

export enum ConsentRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('consent_requests')
export class ConsentRequest extends BaseEntity {
  @Column({ name: 'requester_id' })
  requesterId: string;

  @ManyToOne(() => AuthUser)
  @JoinColumn({ name: 'requester_id' })
  requester: AuthUser;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'patient_id' })
  patient: Person;

  @Column({ name: 'record_id' })
  recordId: string;

  @ManyToOne(() => MedicalRecord)
  @JoinColumn({ name: 'record_id' })
  record: MedicalRecord;

  @Column({
    type: 'enum',
    enum: ConsentRequestStatus,
    default: ConsentRequestStatus.PENDING,
  })
  status: ConsentRequestStatus;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;
}
