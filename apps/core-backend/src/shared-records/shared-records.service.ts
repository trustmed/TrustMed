import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SharedRecordsResponseDto } from './dto/shared-records-response.dto';
import { SendSharedLinkResponseDto } from './dto/send-shared-link-response.dto';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto';
import {
  SharedLinkRecord,
  SharedLinkStatus,
} from '../entities/shared-link-record.entity';
import { SharedLinkMedicalRecord } from '../entities/shared-link-medical-record.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { SharedLinkMedicalRecordItemDto } from './dto/shared-records-response.dto';
import { SharedLinkMedicalRecordsResponseDto } from './dto/shared-records-response.dto';

@Injectable()
export class SharedRecordsService {
  constructor(
    @InjectRepository(SharedLinkRecord)
    private readonly sharedLinkRecordRepository: Repository<SharedLinkRecord>,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(AuthUser)
    private readonly authUserRepository: Repository<AuthUser>,
    private readonly dataSource: DataSource,
  ) {}

  async sendSharedRecords(
    authUserId: string,
    payload: CreateSharedLinkDto,
  ): Promise<SendSharedLinkResponseDto> {
    const authUser = await this.authUserRepository.findOne({
      where: { id: authUserId },
      select: { id: true },
    });

    if (!authUser) {
      throw new UnauthorizedException('Invalid user');
    }

    const medicalRecordIds = Array.from(
      new Set(payload.medicalRecordIds.map((id) => id.trim()).filter(Boolean)),
    );

    if (medicalRecordIds.length === 0) {
      throw new BadRequestException('Medical record IDs are required');
    }

    const accessibleRecords = await this.medicalRecordRepository
      .createQueryBuilder('record')
      .innerJoin('record.person', 'person')
      .where('record.id IN (:...medicalRecordIds)', { medicalRecordIds })
      .andWhere('person.authUserId = :authUserId', { authUserId })
      .select(['record.id'])
      .getMany();

    if (accessibleRecords.length !== medicalRecordIds.length) {
      throw new BadRequestException(
        'One or more medical records are invalid for this user',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      const sharedLinkRecord = manager.create(SharedLinkRecord, {
        authUserId,
        recipientName: payload.recipientName.trim(),
        sharedDate: new Date().toISOString().slice(0, 10),
        status: SharedLinkStatus.ACTIVE,
        createdBy: authUserId,
        updatedBy: authUserId,
      });

      const savedSharedLinkRecord = await manager.save(sharedLinkRecord);

      const sharedLinkMedicalRecords = medicalRecordIds.map((medicalRecordId) =>
        manager.create(SharedLinkMedicalRecord, {
          sharedLinkId: savedSharedLinkRecord.id,
          medicalRecordId,
          createdBy: authUserId,
          updatedBy: authUserId,
        }),
      );

      await manager.save(sharedLinkMedicalRecords);
    });

    return {
      success: true,
      message: 'Shared link sent successfully',
    };
  }

  async getSharedRecordsForUser(
    authUserId: string,
  ): Promise<SharedRecordsResponseDto> {
    const sharedLinks = await this.sharedLinkRecordRepository.find({
      where: { authUserId },
      order: { createdAt: 'DESC' },
    });

    return {
      sharedRecords: sharedLinks.map((record) => ({
        id: record.id,
        recipient: record.recipientName,
        date: String(record.sharedDate).slice(0, 10),
        status: record.status,
      })),
      medicalRecords: [],
    };
  }

  async getSharedLinkRecordsForUser(
    authUserId: string,
    sharedLinkId: string,
  ): Promise<SharedLinkMedicalRecordsResponseDto> {
    const sharedLink = await this.sharedLinkRecordRepository.findOne({
      where: { id: sharedLinkId, authUserId },
      relations: {
        sharedMedicalRecords: {
          medicalRecord: true,
        },
      },
    });

    if (!sharedLink) {
      throw new UnauthorizedException('Invalid shared record');
    }

    const medicalRecords: SharedLinkMedicalRecordItemDto[] = [
      ...(sharedLink.sharedMedicalRecords ?? []),
    ].map((item) => {
      const record = item.medicalRecord;
      const recordDate = record.recordDate
        ? new Date(record.recordDate).toISOString().slice(0, 10)
        : new Date(record.createdAt).toISOString().slice(0, 10);

      return {
        id: record.id,
        fileOriginalName:
          record.originalFileName ?? record.fileName ?? 'Untitled record',
        recordType: String(record.category ?? 'other')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        date: recordDate,
      };
    });

    return {
      sharedRecord: {
        id: sharedLink.id,
        recipient: sharedLink.recipientName,
        date: String(sharedLink.sharedDate).slice(0, 10),
        status: sharedLink.status,
        medicalRecords,
      },
    };
  }
}
