import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

@Entity('medical_records')
export class MedicalRecord extends BaseEntity {
  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'file_name', type: 'varchar' })
  fileName: string;

  @Column({ name: 'file_url', type: 'varchar' })
  fileUrl: string;

  @Column({ name: 'file_type', type: 'varchar' })
  fileType: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'category', type: 'varchar' })
  category: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'doctor_name', type: 'varchar', nullable: true })
  doctorName?: string;

  @Column({ name: 'hospital_name', type: 'varchar', nullable: true })
  hospitalName?: string;

  @Column({ name: 'record_date', type: 'date', nullable: true })
  recordDate?: string;
}
