import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MedicalProfile } from './medical-profile.entity';
import { Allergy } from './allergy.entity';
import { Medication } from './medication.entity';
import { EmergencyContact } from './emergency-contact.entity';

@Entity('persons')
export class Person extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 100, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  addressLine1: string;

  @Column({ length: 100, nullable: true })
  addressLine2: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  zipCode: string;

  @Column({ length: 100, nullable: true })
  gender: string;

  @Column({ length: 100, nullable: true })
  dob: string;

  @Column({ length: 100, nullable: true })
  password_hash: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @OneToOne(() => MedicalProfile, (profile) => profile.person)
  medicalProfile: MedicalProfile;

  @OneToMany(() => Allergy, (allergy) => allergy.person)
  allergies: Allergy[];

  @OneToMany(() => Medication, (medication) => medication.person)
  medications: Medication[];

  @OneToMany(() => EmergencyContact, (contact) => contact.person)
  emergencyContacts: EmergencyContact[];
}
