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
  Put,
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
import { UpdateMedicalRecordRequestDto } from './dto/update-medical-record-request.dto';
import { DeleteMedicalRecordResponseDto } from './dto/delete-medical-record-response.dto';
import { MedicalRecord } from '../entities/medical-record.entity';

@ApiTags('medical-records')
@Controller('medical-records')
export class MedicalRecordController {
  constructor(private readonly service: MedicalRecordService) { }

  @ApiResponse({ status: 200, type: MedicalRecordItemResponseDto })
  @ApiBody({ type: UpdateMedicalRecordRequestDto })
  @Put(':authuserId/:recordId')
  async update(
    @Param('authuserId') authuserId: string,
    @Param('recordId') recordId: string,
    @Body() body: UpdateMedicalRecordRequestDto,
  ): Promise<MedicalRecordItemResponseDto> {
    const updated = await this.service.updateByIdForAuthUser(
      authuserId,
      recordId,
      body,
    );
    return this.mapToItemResponseDto(updated);
  }

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
      records: records.map((rec: MedicalRecord) =>
        this.mapToItemResponseDto(rec),
      ),
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
    return this.mapToItemResponseDto(rec);
  }

  private mapToItemResponseDto(
    rec: MedicalRecord,
  ): MedicalRecordItemResponseDto {
    return {
      id: rec.id,
      personId: rec.person?.id || '',
      fileName: rec.fileName || '',
      fileUrl: rec.fileUrl || '',
      fileType: rec.fileType || '',
      fileSize: Number(rec.fileSize),
      category: rec.category,
      notes: rec.notes || undefined,
      doctorName: rec.doctorName || undefined,
      hospitalName: rec.hospitalName || undefined,
      recordDate: rec.recordDate?.toISOString(),
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
