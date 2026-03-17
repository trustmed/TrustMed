import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { MedicalProfile } from '../entities/medical-profile.entity';
import { Allergy } from '../entities/allergy.entity';
import { Medication } from '../entities/medication.entity';
import { EmergencyContact } from '../entities/emergency-contact.entity';

const PROFILE_RELATIONS = [
  'authUser',
  'medicalProfile',
  'allergies',
  'medications',
  'emergencyContacts',
];

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(AuthUser)
    private authUserRepository: Repository<AuthUser>,
    @InjectRepository(MedicalProfile)
    private medicalProfileRepository: Repository<MedicalProfile>,
    @InjectRepository(Allergy)
    private allergyRepository: Repository<Allergy>,
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
    @InjectRepository(EmergencyContact)
    private emergencyContactRepository: Repository<EmergencyContact>,
  ) {}

  async getProfile(personId: string) {
    const person = await this.personRepository.findOne({
      where: { id: personId },
      relations: PROFILE_RELATIONS,
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }

  async getProfileByEmail(email: string) {
    const person = await this.personRepository.findOne({
      where: { email },
      relations: PROFILE_RELATIONS,
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }

  /**
   * Load full profile using the Clerk auth user ID (clerkUserId).
   * The Person is linked via AuthUser → Person (authUserId FK).
   */
  async getProfileByAuthUserId(clerkUserId: string) {
    // First look up the auth_user row
    const authUser = await this.authUserRepository.findOne({
      where: { clerkUserId },
    });

    if (!authUser) {
      throw new NotFoundException('Auth user not found');
    }

    // Then find the linked person
    let person = await this.personRepository.findOne({
      where: { authUserId: authUser.id },
      relations: PROFILE_RELATIONS,
    });

    if (!person) {
      // Auto-create the person record to ensure the profile page works
      // even if the user was created before this migration or tables were wiped.
      const newPerson = this.personRepository.create({
        authUserId: authUser.id,
        email: authUser.email,
      });
      await this.personRepository.save(newPerson);

      // Reload with relations to ensure consistency
      person = (await this.personRepository.findOne({
        where: { id: newPerson.id },
        relations: PROFILE_RELATIONS,
      })) as Person;
    }

    return person;
  }

  async updatePerson(personId: string, data: Partial<Person>) {
    await this.personRepository.update(personId, data);
    return this.getProfile(personId);
  }

  async updateMedicalProfile(
    personId: string,
    data: Partial<MedicalProfile>,
  ): Promise<MedicalProfile> {
    const person = await this.personRepository.findOne({
      where: { id: personId },
      relations: ['medicalProfile'],
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    let profile = person.medicalProfile;

    if (!profile) {
      profile = this.medicalProfileRepository.create({
        ...data,
        person: person,
      });
    } else {
      this.medicalProfileRepository.merge(profile, data);
    }

    return this.medicalProfileRepository.save(profile);
  }

  async addAllergy(personId: string, data: Partial<Allergy>) {
    const person = await this.personRepository.findOneBy({ id: personId });
    if (!person) throw new NotFoundException('Person not found');

    const allergy = this.allergyRepository.create({ ...data, person });
    return this.allergyRepository.save(allergy);
  }

  async addMedication(personId: string, data: Partial<Medication>) {
    const person = await this.personRepository.findOneBy({ id: personId });
    if (!person) throw new NotFoundException('Person not found');

    const medication = this.medicationRepository.create({ ...data, person });
    return this.medicationRepository.save(medication);
  }

  async addEmergencyContact(personId: string, data: Partial<EmergencyContact>) {
    const person = await this.personRepository.findOneBy({ id: personId });
    if (!person) throw new NotFoundException('Person not found');

    const contact = this.emergencyContactRepository.create({ ...data, person });
    return this.emergencyContactRepository.save(contact);
  }

  async deleteAllergy(id: string) {
    return this.allergyRepository.delete(id);
  }

  async deleteMedication(id: string) {
    return this.medicationRepository.delete(id);
  }

  async deleteEmergencyContact(id: string) {
    return this.emergencyContactRepository.delete(id);
  }
}
