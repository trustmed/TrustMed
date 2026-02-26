import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

@Entity('emergency_contacts')
export class EmergencyContact extends BaseEntity {
  @ManyToOne(() => Person, (person) => person.emergencyContacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'relationship', type: 'varchar', nullable: true })
  relationship: string;

  @Column({ name: 'phone_number', type: 'varchar' })
  phoneNumber: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;
}
