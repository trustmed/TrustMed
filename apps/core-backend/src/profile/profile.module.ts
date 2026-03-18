import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Person } from '../entities/person.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { MedicalProfile } from '../entities/medical-profile.entity';
import { Allergy } from '../entities/allergy.entity';
import { Medication } from '../entities/medication.entity';
import { EmergencyContact } from '../entities/emergency-contact.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Person,
      AuthUser,
      MedicalProfile,
      Allergy,
      Medication,
      EmergencyContact,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
