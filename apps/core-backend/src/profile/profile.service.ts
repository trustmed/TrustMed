import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { MedicalProfile } from '../entities/medical-profile.entity';
import { Allergy } from '../entities/allergy.entity';
import { Medication } from '../entities/medication.entity';
import { EmergencyContact } from '../entities/emergency-contact.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
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
      relations: [
        'medicalProfile',
        'allergies',
        'medications',
        'emergencyContacts',
      ],
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }

  async getProfileByEmail(email: string) {
    const person = await this.personRepository.findOne({
      where: { email },
      relations: [
        'medicalProfile',
        'allergies',
        'medications',
        'emergencyContacts',
      ],
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }

  async syncProfile(email: string, name: string) {
    let person = await this.personRepository.findOne({
      where: { email },
      relations: [
        'medicalProfile',
        'allergies',
        'medications',
        'emergencyContacts',
      ],
    });

    if (!person) {
      person = this.personRepository.create({
        email,
        name: name || 'New User',
      });
      person = await this.personRepository.save(person);

      // Ensure relations arrays are present so frontend doesn't crash on null properties
      person.allergies = [];
      person.medications = [];
      person.emergencyContacts = [];
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
