import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { ConsentService } from './consent.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../entities/auth-user.entity';
import { AcceptConsentDto } from './dto/consent-request.dto';
import {
  ConsentRequest,
  ConsentRequestStatus,
} from '../entities/consent-request.entity';
import { S3VaultService } from '../s3-vault/s3-vault.service';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecord } from '../entities/medical-record.entity';

@ApiTags('consent-requests')
@Controller('consent-requests')
export class ConsentRequestsController {
  constructor(
    private readonly consentService: ConsentService,
    private readonly s3VaultService: S3VaultService,
    private readonly medicalRecordService: MedicalRecordService,
    @InjectRepository(AuthUser)
    private readonly authUserRepo: Repository<AuthUser>,
    @InjectRepository(MedicalRecord)
    private readonly recordRepo: Repository<MedicalRecord>,
  ) {}

  private async resolveAuthUserId(authUserId: string): Promise<string> {
    const authUser = await this.authUserRepo.findOne({
      where: { id: authUserId },
    });
    if (!authUser) {
      throw new NotFoundException('Auth user not found');
    }
    return authUser.id;
  }

  @Post(':recordId')
  @ApiOperation({ summary: 'Request access to a specific medical record' })
  async requestAccess(
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const requesterId = await this.resolveAuthUserId(user.sub);
    await this.consentService.requestAccess(requesterId, recordId);
    const request = await this.consentService.getRequestByRecordAndRequester(
      requesterId,
      recordId,
    );
    if (!request) {
      throw new NotFoundException('No consent request found for this record');
    }
    const result = {
      id: request.id,
      status: request.status,
      createdAt: request.createdAt,
      expiresAt: request.expiresAt,
      downloadUrl: undefined as string | undefined,
    };
    return result;
  }

  @Get(':recordId')
  @ApiOperation({
    summary: 'Check request status and get download URL if accepted',
  })
  async getStatusAndDownload(
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const requesterId = await this.resolveAuthUserId(user.sub);
    const request = await this.consentService.getRequestByRecordAndRequester(
      requesterId,
      recordId,
    );

    if (!request) {
      throw new NotFoundException('No consent request found for this record');
    }
    let fileData;

    if (
      request.status === ConsentRequestStatus.ACCEPTED &&
      (!request.expiresAt || new Date(request.expiresAt) > new Date())
    ) {
      // Default 5 mins
      if (request.expiresAt) {
        Math.floor((new Date(request.expiresAt).getTime() - Date.now()) / 1000);
        // Ensure not negative and cap it for security if needed (already valid through check)
      }

      // 1. Get the record and its owner (person -> authUserId) using TypeORM QueryBuilder (SQL Join)
      const recordItem = await this.recordRepo
        .createQueryBuilder('record')
        .leftJoinAndSelect('record.person', 'person')
        .where('record.id = :recordId', { recordId })
        .getOne();

      const userID = recordItem?.person?.authUserId;

      if (!userID) {
        throw new NotFoundException('Record owner not found');
      }

      fileData = await this.medicalRecordService.downloadRecord(
        recordId,
        userID,
      );
    }
    if (!fileData) {
      throw new NotFoundException('File not found or access not granted');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return fileData;
  }

  @Get('me/received')
  @ApiOperation({ summary: 'Get consent requests received by the patient' })
  async getReceivedRequests(
    @CurrentUser() user: JwtPayload,
  ): Promise<ConsentRequest[]> {
    const patientId = await this.resolveAuthUserId(user.sub);
    return this.consentService.getReceivedRequests(patientId);
  }

  @Get('me/sent')
  @ApiOperation({
    summary: 'Get consent requests sent by the requester (doctor/hospital)',
  })
  async getSentRequests(
    @CurrentUser() user: JwtPayload,
  ): Promise<ConsentRequest[]> {
    const requesterId = await this.resolveAuthUserId(user.sub);
    return this.consentService.getSentRequests(requesterId);
  }

  @Patch(':id/accept')
  @ApiOperation({
    summary: 'Accept a consent request with a specific duration',
  })
  async acceptRequest(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AcceptConsentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ConsentRequest> {
    const patientId = await this.resolveAuthUserId(user.sub);
    return this.consentService.acceptRequest(id, patientId, dto.duration);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a consent request' })
  async rejectRequest(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ConsentRequest> {
    const patientId = await this.resolveAuthUserId(user.sub);
    return this.consentService.rejectRequest(id, patientId);
  }
}
