import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthUser } from './auth-user.entity';
import { MedicalProfile } from './medical-profile.entity';
import { Allergy } from './allergy.entity';
import { Medication } from './medication.entity';
import { EmergencyContact } from './emergency-contact.entity';

@Entity('persons')
export class Person extends BaseEntity {
  // Foreign key column to auth_users
  @Column({ type: 'uuid', nullable: true, unique: true })
  authUserId: string;

  @OneToOne(() => AuthUser, (authUser) => authUser.person, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'authUserId' })
  authUser: AuthUser;

  @Column({ unique: true, nullable: true })
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

  @OneToOne(() => MedicalProfile, (profile) => profile.person)
  medicalProfile: MedicalProfile;

  @OneToMany(() => Allergy, (allergy) => allergy.person)
  allergies: Allergy[];

  @OneToMany(() => Medication, (medication) => medication.person)
  medications: Medication[];

  @OneToMany(() => EmergencyContact, (contact) => contact.person)
  emergencyContacts: EmergencyContact[];
}
