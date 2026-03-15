import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { MedicalRecordsService } from './medical-records.service';
import { AuthService } from '../auth/auth.service';
import {
  UploadMedicalRecordDto,
  UpdateMedicalRecordDto,
} from './dto/medical-record.dto';

@ApiTags('medical-records')
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly authService: AuthService,
  ) {}

  @Get(':personId')
  @ApiOperation({ summary: 'Get all medical records for a patient' })
  async getRecords(@Param('personId') personId: string) {
    return this.medicalRecordsService.getRecords(personId);
  }

  @Post(':personId/upload')
  @ApiOperation({ summary: 'Upload a new medical record' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadRecord(
    @Param('personId') _personId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMedicalRecordDto,
    @Req() req: { auth?: { sub?: string }; user?: { sub?: string } },
  ) {
    // Extract authenticated user's clerkUserId from JWT and resolve their actual personId
    const clerkUserId = req.auth?.sub ?? req.user?.sub;
    if (!clerkUserId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const meData = await this.authService.getMe({ sub: clerkUserId });
    const personId = meData.personId;
    const uploadedBy = meData.sub ?? 'unknown';

    return this.medicalRecordsService.uploadRecord(
      personId,
      file,
      dto,
      uploadedBy,
    );
  }

  @Patch(':personId/records/:id')
  @ApiOperation({ summary: 'Update medical record metadata' })
  async updateRecord(
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.updateRecord(id, personId, dto);
  }

  @Delete(':personId/records/:id')
  @ApiOperation({ summary: 'Delete a medical record' })
  async deleteRecord(
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    await this.medicalRecordsService.deleteRecord(id, personId);
    return { message: 'Record deleted successfully' };
  }

  @Get(':personId/records/:id/url')
  @ApiOperation({ summary: 'Get download URL for a record' })
  async getDownloadUrl(
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    const url = await this.medicalRecordsService.getDownloadUrl(id, personId);
    return { url };
  }
}