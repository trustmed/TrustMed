import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { MedicalProfile } from '../entities/medical-profile.entity';
import { Allergy } from '../entities/allergy.entity';
import { Medication } from '../entities/medication.entity';
import { EmergencyContact } from '../entities/emergency-contact.entity';
import { Person } from '../entities/person.entity';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /profile/me — returns the profile of the currently logged-in user.
   * The JWT cookie guard populates req.user with the token payload;
   * req.user.sub is the Clerk user ID.
   * NOTE: this route MUST be declared before :personId to avoid route conflict.
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get profile for the logged-in user (via JWT cookie)',
  })
  async getMyProfile(
    @Req() req: Request & { auth?: { sub?: string }; user?: { sub?: string } },
  ) {
    // Clerk JWT payload is attached by ClerkAuthGuard.
    // Some code paths may use `req.auth` (custom) and others may expect `req.user` (Passport-style).
    const clerkUserId = req.auth?.sub ?? req.user?.sub;
    if (!clerkUserId) {
      throw new Error('User not authenticated');
    }
    return this.profileService.getProfileByAuthUserId(clerkUserId);
  }

  @Get(':personId')
  @ApiOperation({ summary: 'Get full user profile by person ID' })
  async getProfile(@Param('personId') personId: string) {
    return this.profileService.getProfile(personId);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get full user profile by email' })
  async getProfileByEmail(@Param('email') email: string) {
    return this.profileService.getProfileByEmail(email);
  }

  @Get('auth/:clerkUserId')
  @ApiOperation({ summary: 'Get full user profile by Clerk user ID' })
  async getProfileByAuthUserId(@Param('clerkUserId') clerkUserId: string) {
    return this.profileService.getProfileByAuthUserId(clerkUserId);
  }

  @Patch(':personId/personal')
  @ApiOperation({ summary: 'Update personal details' })
  async updatePerson(
    @Param('personId') personId: string,
    @Body() data: Partial<Person>,
  ) {
    return this.profileService.updatePerson(personId, data);
  }

  @Patch(':personId/medical')
  @ApiOperation({ summary: 'Update medical profile' })
  async updateMedicalProfile(
    @Param('personId') personId: string,
    @Body() data: Partial<MedicalProfile>,
  ) {
    return this.profileService.updateMedicalProfile(personId, data);
  }

  @Post(':personId/allergies')
  @ApiOperation({ summary: 'Add allergy' })
  async addAllergy(
    @Param('personId') personId: string,
    @Body() data: Partial<Allergy>,
  ) {
    return this.profileService.addAllergy(personId, data);
  }

  @Delete('allergies/:id')
  @ApiOperation({ summary: 'Delete allergy' })
  async deleteAllergy(@Param('id') id: string) {
    return this.profileService.deleteAllergy(id);
  }

  @Post(':personId/medications')
  @ApiOperation({ summary: 'Add medication' })
  async addMedication(
    @Param('personId') personId: string,
    @Body() data: Partial<Medication>,
  ) {
    return this.profileService.addMedication(personId, data);
  }

  @Delete('medications/:id')
  @ApiOperation({ summary: 'Delete medication' })
  async deleteMedication(@Param('id') id: string) {
    return this.profileService.deleteMedication(id);
  }

  @Post(':personId/contacts')
  @ApiOperation({ summary: 'Add emergency contact' })
  async addEmergencyContact(
    @Param('personId') personId: string,
    @Body() data: Partial<EmergencyContact>,
  ) {
    return this.profileService.addEmergencyContact(personId, data);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete emergency contact' })
  async deleteEmergencyContact(@Param('id') id: string) {
    return this.profileService.deleteEmergencyContact(id);
  }
}
