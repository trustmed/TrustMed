import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

@Entity('medications')
export class Medication extends BaseEntity {
  @ManyToOne(() => Person, (person) => person.medications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'dosage', type: 'varchar', nullable: true })
  dosage: string;

  @Column({ name: 'frequency', type: 'varchar', nullable: true })
  frequency: string;

  @Column({ name: 'purpose', type: 'varchar', nullable: true })
  purpose: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
