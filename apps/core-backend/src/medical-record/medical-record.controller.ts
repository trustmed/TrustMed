import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
// import type { Multer } from 'multer';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordRequestDto } from './dto/create-medical-record-request.dto';
import { CreateMedicalRecordResponseDto } from './dto/create-medical-record-response.dto';

@ApiTags('medical-records')
@Controller('medical-records')
export class MedicalRecordController {
  constructor(private readonly service: MedicalRecordService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: CreateMedicalRecordRequestDto })
  @ApiResponse({ status: 201, type: CreateMedicalRecordResponseDto })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateMedicalRecordResponseDto,
  ): Promise<CreateMedicalRecordResponseDto> {
    const dto: CreateMedicalRecordRequestDto = {
      file,
      personId: body.personId,
      category: body.category,
      notes: body.notes,
      doctorName: body.doctorName,
      hospitalName: body.hospitalName,
      recordDate: body.recordDate,
    };
    console.log('Received create medical record request:', dto);
    return this.service.create(dto);
  }
}
