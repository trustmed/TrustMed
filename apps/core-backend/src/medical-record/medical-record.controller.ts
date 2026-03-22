import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
// import type { Multer } from 'multer';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordRequestDto } from './dto/create-medical-record-request.dto';
import { CreateMedicalRecordResponseDto } from './dto/create-medical-record-response.dto';
import { MedicalRecordListResponseDto } from './dto/medical-record-item-response.dto';
import { MedicalRecordItemResponseDto } from './dto/medical-record-item-response.dto';
import { DeleteMedicalRecordResponseDto } from './dto/delete-medical-record-response.dto';
import { MedicalRecord } from '../entities/medical-record.entity';

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

  @Get(':authuserId')
  @ApiResponse({ status: 200, type: MedicalRecordListResponseDto })
  async getAllByAuthUserId(
    @Param('authuserId') authuserId: string,
  ): Promise<MedicalRecordListResponseDto> {
    const records: MedicalRecord[] =
      await this.service.getAllByAuthUserId(authuserId);
    return {
      records: records.map((rec: MedicalRecord) => ({
        id: rec.id,
        personId: rec.person?.id,
        fileName: rec.fileName,
        fileUrl: rec.fileUrl,
        fileType: rec.fileType,
        fileSize: rec.fileSize,
        category: rec.category,
        notes: rec.notes,
        doctorName: rec.doctorName,
        hospitalName: rec.hospitalName,
        recordDate: rec.recordDate,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt,
      })),
    };
  }

  @Get(':authuserId/:recordId')
  @ApiResponse({ status: 200, type: MedicalRecordItemResponseDto })
  async getById(
    @Param('authuserId') authuserId: string,
    @Param('recordId') recordId: string,
  ): Promise<MedicalRecordItemResponseDto> {
    const rec: MedicalRecord | null = await this.service.getByIdForAuthUser(
      authuserId,
      recordId,
    );
    if (!rec) throw new NotFoundException('Medical record not found');
    return {
      id: rec.id,
      personId: rec.person?.id,
      fileName: rec.fileName,
      fileUrl: rec.fileUrl,
      fileType: rec.fileType,
      fileSize: rec.fileSize,
      category: rec.category,
      notes: rec.notes,
      doctorName: rec.doctorName,
      hospitalName: rec.hospitalName,
      recordDate: rec.recordDate,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
    };
  }

  @Delete(':authuserId/:recordId')
  @ApiResponse({ status: 200, type: DeleteMedicalRecordResponseDto })
  async deleteById(
    @Param('authuserId') authuserId: string,
    @Param('recordId') recordId: string,
  ): Promise<DeleteMedicalRecordResponseDto> {
    await this.service.deleteByIdForAuthUser(authuserId, recordId);
    return { success: true };
  }
}
