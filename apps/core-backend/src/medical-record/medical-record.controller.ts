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
  Res,
  ParseUUIDPipe,
  Logger,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
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
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import {
  ConsentRequest,
  ConsentRequestStatus,
} from '../entities/consent-request.entity';

@ApiTags('medical-records')
@Controller('medical-records')
export class MedicalRecordController {
  private readonly logger = new Logger(MedicalRecordController.name);

  constructor(private readonly service: MedicalRecordService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for a patient by email and list their records' })
  async searchByEmail(@Query('email') email: string) {
    if (!email) {
      throw new NotFoundException('Email query parameter is required');
    }

    const result = await this.service.searchByEmail(email);
    if (!result) {
      throw new NotFoundException('No patient found with this email');
    }

    return {
      patient: {
        authUserId: result.authUserId,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
      },
      records: result.records.map((rec: MedicalRecord) => ({
        id: rec.id,
        fileName: rec.originalFileName || rec.fileName || '',
        fileType: rec.fileType || '',
        fileSize: Number(rec.fileSize) || 0,
        category: rec.category as string,
        notes: rec.notes || undefined,
        doctorName: rec.doctorName || undefined,
        hospitalName: rec.hospitalName || undefined,
        recordDate: rec.recordDate
          ? new Date(rec.recordDate).toISOString()
          : undefined,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt,
        requestStatus: (() => {
          const r: ConsentRequest | undefined =
            rec.consentRequests?.find(
              (req: ConsentRequest) =>
                req.status === ConsentRequestStatus.PENDING,
            ) || rec.consentRequests?.[rec.consentRequests.length - 1];
          return r
            ? {
                status: r.status as string,
                createdBy: r.requester
                  ? `${r.requester.firstName} ${r.requester.lastName}`
                  : r.requesterId,
                createdAt: r.createdAt.toISOString(),
                id: r.id,
              }
            : {
                status: false,
                createdBy: '',
                createdAt: '',
              };
        })(),
      })),
    };
  }


  @Get(':recordId/download')
  @ApiOperation({
    summary: 'Download a decrypted medical record',
  })
  @ApiParam({
    name: 'recordId',
    description: 'UUID of the medical record',
  })
  async download(
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { buffer, originalFileName, mimeType } =
        await this.service.downloadRecord(recordId, user.sub);

      const sanitizedFileName = originalFileName.replace(/["\\]/g, '_');

      res.attachment(sanitizedFileName);
      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      res.send(buffer);
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      this.logger.error(
        `Download failed for record ${recordId}: ${error.message ?? 'Unknown error'}`,
      );
      const statusCode = error.status ?? 500;
      res.status(statusCode).json({
        statusCode: statusCode,
        message: error.message ?? 'Internal server error during download',
      });
    }
  }

  @Get(':recordId/view')
  @ApiOperation({
    summary: 'View an uploaded medical record from storage',
  })
  @ApiParam({
    name: 'recordId',
    description: 'UUID of the medical record',
  })
  async view(
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    console.log(
      `Received view request for record ${recordId} from user ${user.sub}`,
    );
    try {
      const { buffer, fileName, mimeType } = await this.service.viewRecord(
        recordId,
        user.sub,
      );

      const sanitizedFileName = fileName.replace(/["\\]/g, '_');

      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${sanitizedFileName}"`,
      );
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      res.send(buffer);
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      this.logger.error(
        `View failed for record ${recordId}: ${error.message ?? 'Unknown error'}`,
      );
      const statusCode = error.status ?? 500;
      res.status(statusCode).json({
        statusCode: statusCode,
        message: error.message ?? 'Internal server error during view',
      });
    }
  }

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
    return {
      id: updated.id,
      personId: updated.person?.id || '',
      fileName: updated.originalFileName || updated.fileName || '',
      fileUrl: `/api/medical-records/${updated.id}/download`,
      downloadUrl: `/api/medical-records/${updated.id}/download`,
      fileType: updated.fileType || '',
      fileSize: Number(updated.fileSize) || 0,
      category: updated.category as string,
      notes: updated.notes || undefined,
      doctorName: updated.doctorName || undefined,
      hospitalName: updated.hospitalName || undefined,
      recordDate: updated.recordDate
        ? new Date(updated.recordDate).toISOString()
        : undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
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
      records: records.map((rec: MedicalRecord) => ({
        id: rec.id,
        personId: rec.person?.id || '',
        fileName: rec.originalFileName || rec.fileName || '',
        fileUrl: `/api/medical-records/${rec.id}/download`,
        downloadUrl: `/api/medical-records/${rec.id}/download`,
        fileType: rec.fileType || '',
        fileSize: Number(rec.fileSize) || 0,
        category: rec.category as string,
        notes: rec.notes || undefined,
        doctorName: rec.doctorName || undefined,
        hospitalName: rec.hospitalName || undefined,
        recordDate: rec.recordDate
          ? new Date(rec.recordDate).toISOString()
          : undefined,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt,
        requestStatus: (() => {
          const r: ConsentRequest | undefined =
            rec.consentRequests?.find(
              (req: ConsentRequest) =>
                req.status === ConsentRequestStatus.PENDING,
            ) || rec.consentRequests?.[rec.consentRequests.length - 1];
          return r
            ? {
                status: r.status as string,
                createdBy: r.requester
                  ? `${r.requester.firstName} ${r.requester.lastName}`
                  : r.requesterId,
                createdAt: r.createdAt.toISOString(),
                id: r.id,
              }
            : {
                status: false,
                createdBy: '',
                createdAt: '',
              };
        })(),
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
      personId: rec.person?.id || '',
      fileName: rec.originalFileName || rec.fileName || '',
      fileUrl: `/api/medical-records/${rec.id}/download`,
      downloadUrl: `/api/medical-records/${rec.id}/download`,
      fileType: rec.fileType || '',
      fileSize: Number(rec.fileSize) || 0,
      category: rec.category as string,
      notes: rec.notes || undefined,
      doctorName: rec.doctorName || undefined,
      hospitalName: rec.hospitalName || undefined,
      recordDate: rec.recordDate
        ? new Date(rec.recordDate).toISOString()
        : undefined,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
      requestStatus: (() => {
        const r: ConsentRequest | undefined =
          rec.consentRequests?.find(
            (req: ConsentRequest) =>
              req.status === ConsentRequestStatus.PENDING,
          ) || rec.consentRequests?.[rec.consentRequests.length - 1];
        return r
          ? {
              status: r.status as string,
              createdBy: r.requester
                ? `${r.requester.firstName} ${r.requester.lastName}`
                : r.requesterId,
              createdAt: r.createdAt.toISOString(),
              id: r.id,
            }
          : {
              status: false,
              createdBy: '',
              createdAt: '',
            };
      })(),
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
