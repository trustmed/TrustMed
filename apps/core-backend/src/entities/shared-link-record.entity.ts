import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthUser } from './auth-user.entity';
import { SharedLinkMedicalRecord } from './shared-link-medical-record.entity';

export enum SharedLinkStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DEACTIVATED = 'deactivated',
}

@Entity('shared_link_records')
export class SharedLinkRecord extends BaseEntity {
  @Column({ name: 'auth_user_id', type: 'uuid' })
  authUserId: string;

  @ManyToOne(() => AuthUser)
  @JoinColumn({ name: 'auth_user_id' })
  authUser: AuthUser;

  @Column({ name: 'recipient_name', type: 'varchar', length: 200 })
  recipientName: string;

  @Column({ name: 'shared_date', type: 'date' })
  sharedDate: string;

  @Column({
    type: 'enum',
    enum: SharedLinkStatus,
    default: SharedLinkStatus.ACTIVE,
  })
  status: SharedLinkStatus;

  @OneToMany(
    () => SharedLinkMedicalRecord,
    (sharedLinkMedicalRecord) => sharedLinkMedicalRecord.sharedLink,
  )
  sharedMedicalRecords: SharedLinkMedicalRecord[];
}
