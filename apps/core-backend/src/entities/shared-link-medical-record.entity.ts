import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MedicalRecord } from './medical-record.entity';
import { SharedLinkRecord } from './shared-link-record.entity';

@Entity('shared_link_medical_records')
@Index(
  'UQ_shared_link_medical_record_unique',
  ['sharedLinkId', 'medicalRecordId'],
  {
    unique: true,
  },
)
export class SharedLinkMedicalRecord extends BaseEntity {
  @Column({ name: 'shared_link_id', type: 'uuid' })
  sharedLinkId: string;

  @ManyToOne(() => SharedLinkRecord)
  @JoinColumn({ name: 'shared_link_id' })
  sharedLink: SharedLinkRecord;

  @Column({ name: 'medical_record_id', type: 'uuid' })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;
}
