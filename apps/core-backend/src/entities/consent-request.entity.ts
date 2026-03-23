import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MedicalRecord } from './medical-record.entity';
import { AuthUser } from './auth-user.entity';

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

  @ManyToOne(() => AuthUser)
  @JoinColumn({ name: 'patient_id' })
  patient: AuthUser;

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
