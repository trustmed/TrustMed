import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

@Entity('allergies')
export class Allergy extends BaseEntity {
  @ManyToOne(() => Person, (person) => person.allergies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'allergen_name', type: 'varchar' })
  allergenName: string;

  @Column({ name: 'category', type: 'varchar', nullable: true })
  category: string; // Medication, Food, Environmental

  @Column({ name: 'severity', type: 'varchar', nullable: true })
  severity: string; // Mild, Moderate, Severe

  @Column({ name: 'reaction', type: 'text', nullable: true })
  reaction: string;
}
