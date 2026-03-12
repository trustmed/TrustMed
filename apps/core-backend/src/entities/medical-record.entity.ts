import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

export enum RecordCategory {
  LAB_REPORT = 'lab_report',
  PRESCRIPTION = 'prescription',
  IMAGING = 'imaging',
  DISCHARGE_SUMMARY = 'discharge_summary',
  VACCINATION = 'vaccination',
  OTHER = 'other',
}

@Entity('medical_records')
export class MedicalRecord extends BaseEntity {
  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'person_id' })
  personId: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_type' })
  fileType: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 's3_key' })
  s3Key: string;

  @Column({
    type: 'enum',
    enum: RecordCategory,
    default: RecordCategory.OTHER,
  })
  category: RecordCategory;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'uploaded_by', length: 100 })
  uploadedBy: string;
}
