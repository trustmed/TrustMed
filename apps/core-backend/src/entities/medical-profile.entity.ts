import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

@Entity('medical_profiles')
export class MedicalProfile extends BaseEntity {
  @OneToOne(() => Person, (person) => person.medicalProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'dob', type: 'date', nullable: true })
  dob: Date;

  @Column({
    name: 'biological_sex',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  biologicalSex: string; // Male, Female, Intersex

  @Column({
    name: 'gender_identity',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  genderIdentity: string;

  @Column({ name: 'blood_type', type: 'varchar', length: 10, nullable: true })
  bloodType: string;

  @Column({
    name: 'height_cm',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  heightCm: number;

  @Column({
    name: 'weight_kg',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  weightKg: number;

  @Column({ name: 'organ_donor', type: 'boolean', default: false })
  organDonor: boolean; // Yes/No -> true/false

  @Column({ name: 'insurance_provider', type: 'varchar', nullable: true })
  insuranceProvider: string;

  @Column({ name: 'insurance_policy_no', type: 'varchar', nullable: true })
  insurancePolicyNo: string;

  @Column({ name: 'insurance_group_no', type: 'varchar', nullable: true })
  insuranceGroupNo: string;

  // Store URLs for card photos
  @Column({ name: 'insurance_card_front', type: 'varchar', nullable: true })
  insuranceCardFront: string;

  @Column({ name: 'insurance_card_back', type: 'varchar', nullable: true })
  insuranceCardBack: string;

  @Column({ name: 'primary_physician_name', type: 'varchar', nullable: true })
  primaryPhysicianName: string;

  @Column({
    name: 'primary_physician_contact',
    type: 'varchar',
    nullable: true,
  })
  primaryPhysicianContact: string;

  @Column({ name: 'smoking_status', type: 'varchar', nullable: true })
  smokingStatus: string; // Never, Former, Current

  @Column({ name: 'alcohol_consumption', type: 'varchar', nullable: true })
  alcoholConsumption: string; // Occasional, Social, Daily

  @Column({ name: 'exercise_level', type: 'varchar', nullable: true })
  exerciseLevel: string; // Sedentary, Active, Highly Active

  @Column({ name: 'dietary_preferences', type: 'varchar', nullable: true })
  dietaryPreferences: string;
}
