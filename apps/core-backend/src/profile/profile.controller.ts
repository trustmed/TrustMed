import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { Public } from '../auth/public.decorator';
import {
  SyncProfileDto,
  UpdatePersonalDto,
  UpdateMedicalProfileDto,
  AddAllergyDto,
  AddMedicationDto,
  AddEmergencyContactDto,
} from './profile.dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':personId')
  @ApiOperation({ summary: 'Get full user profile' })
  async getProfile(@Param('personId') personId: string) {
    return this.profileService.getProfile(personId);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get full user profile by email' })
  async getProfileByEmail(@Param('email') email: string) {
    return this.profileService.getProfileByEmail(email);
  }

  @Public()
  @Post('sync')
  @ApiOperation({
    summary: 'Sync user from auth provider (creates if missing)',
  })
  @ApiBody({ type: SyncProfileDto })
  async syncProfile(@Body() data: SyncProfileDto) {
    return this.profileService.syncProfile(data.email, data.name);
  }

  @Patch(':personId/personal')
  @ApiOperation({ summary: 'Update personal details' })
  @ApiBody({ type: UpdatePersonalDto })
  async updatePerson(
    @Param('personId') personId: string,
    @Body() data: UpdatePersonalDto,
  ) {
    return this.profileService.updatePerson(personId, data);
  }

  @Patch(':personId/medical')
  @ApiOperation({ summary: 'Update medical profile' })
  @ApiBody({ type: UpdateMedicalProfileDto })
  async updateMedicalProfile(
    @Param('personId') personId: string,
    @Body() data: UpdateMedicalProfileDto,
  ) {
    const { dob, ...rest } = data;
    return this.profileService.updateMedicalProfile(personId, {
      ...rest,
      ...(dob ? { dob: new Date(dob) } : {}),
    });
  }

  @Post(':personId/allergies')
  @ApiOperation({ summary: 'Add allergy' })
  @ApiBody({ type: AddAllergyDto })
  async addAllergy(
    @Param('personId') personId: string,
    @Body() data: AddAllergyDto,
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
  @ApiBody({ type: AddMedicationDto })
  async addMedication(
    @Param('personId') personId: string,
    @Body() data: AddMedicationDto,
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
  @ApiBody({ type: AddEmergencyContactDto })
  async addEmergencyContact(
    @Param('personId') personId: string,
    @Body() data: AddEmergencyContactDto,
  ) {
    return this.profileService.addEmergencyContact(personId, data);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete emergency contact' })
  async deleteEmergencyContact(@Param('id') id: string) {
    return this.profileService.deleteEmergencyContact(id);
  }
}
