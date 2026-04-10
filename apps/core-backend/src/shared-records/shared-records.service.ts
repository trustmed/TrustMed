import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
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
import { AddSharedLinkRecordsDto } from './dto/add-shared-link-records.dto';

@Injectable()
export class SharedRecordsService {
  constructor(
    @InjectRepository(SharedLinkRecord)
    private readonly sharedLinkRecordRepository: Repository<SharedLinkRecord>,
    @InjectRepository(SharedLinkMedicalRecord)
    private readonly sharedLinkMedicalRecordRepository: Repository<SharedLinkMedicalRecord>,
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

  async addRecordsToSharedLink(
    authUserId: string,
    sharedLinkId: string,
    payload: AddSharedLinkRecordsDto,
  ): Promise<SendSharedLinkResponseDto> {
    const sharedLink = await this.sharedLinkRecordRepository.findOne({
      where: { id: sharedLinkId, authUserId },
      select: { id: true },
    });

    if (!sharedLink) {
      throw new UnauthorizedException('Invalid shared record');
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

    const existingSharedRecords = await this.sharedLinkMedicalRecordRepository.find({
      where: {
        sharedLinkId,
        medicalRecordId: In(medicalRecordIds),
      },
      withDeleted: true,
    });

    const existingByRecordId = new Map(
      existingSharedRecords.map((entry) => [entry.medicalRecordId, entry]),
    );

    const softDeletedToRestore = existingSharedRecords.filter(
      (entry) => !!entry.deletedAt,
    );

    const recordIdsToInsert = medicalRecordIds.filter(
      (id) => !existingByRecordId.has(id),
    );

    if (recordIdsToInsert.length === 0 && softDeletedToRestore.length === 0) {
      return {
        success: true,
        message: 'No new records to add',
      };
    }

    await this.dataSource.transaction(async (manager) => {
      if (softDeletedToRestore.length > 0) {
        const restoreIds = softDeletedToRestore.map((entry) => entry.id);

        await manager
          .getRepository(SharedLinkMedicalRecord)
          .restore(restoreIds);

        await manager
          .getRepository(SharedLinkMedicalRecord)
          .update(
            { id: In(restoreIds) },
            { updatedBy: authUserId },
          );
      }

      const sharedLinkMedicalRecords = recordIdsToInsert.map((medicalRecordId) =>
        manager.create(SharedLinkMedicalRecord, {
          sharedLinkId,
          medicalRecordId,
          createdBy: authUserId,
          updatedBy: authUserId,
        }),
      );

      await manager.save(sharedLinkMedicalRecords);
    });

    return {
      success: true,
      message: 'Records added to shared link successfully',
    };
  }

  async deleteSharedLinkRecord(
    authUserId: string,
    sharedLinkId: string,
    medicalRecordId: string,
  ): Promise<SendSharedLinkResponseDto> {
    const sharedLink = await this.sharedLinkRecordRepository.findOne({
      where: { id: sharedLinkId, authUserId },
      select: { id: true },
    });

    if (!sharedLink) {
      throw new UnauthorizedException('Invalid shared record');
    }

    const sharedMedicalRecord = await this.sharedLinkMedicalRecordRepository.findOne({
      where: {
        sharedLinkId,
        medicalRecordId,
        deletedAt: IsNull(),
      },
      select: { id: true },
    });

    if (!sharedMedicalRecord) {
      throw new BadRequestException('Shared medical record not found');
    }

    await this.sharedLinkMedicalRecordRepository.softDelete(sharedMedicalRecord.id);
    await this.sharedLinkMedicalRecordRepository.update(sharedMedicalRecord.id, {
      updatedBy: authUserId,
    });

    return {
      success: true,
      message: 'Record removed from shared link successfully',
    };
  }

  async deleteSharedLink(
    authUserId: string,
    sharedLinkId: string,
  ): Promise<SendSharedLinkResponseDto> {
    const sharedLink = await this.sharedLinkRecordRepository.findOne({
      where: { id: sharedLinkId, authUserId, deletedAt: IsNull() },
      select: { id: true },
    });

    if (!sharedLink) {
      throw new UnauthorizedException('Invalid shared record');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(SharedLinkMedicalRecord).update(
        { sharedLinkId, deletedAt: IsNull() },
        { updatedBy: authUserId },
      );

      await manager.getRepository(SharedLinkMedicalRecord).softDelete({
        sharedLinkId,
        deletedAt: IsNull(),
      });

      await manager.getRepository(SharedLinkRecord).softDelete(sharedLinkId);
      await manager.getRepository(SharedLinkRecord).update(sharedLinkId, {
        updatedBy: authUserId,
      });
    });

    return {
      success: true,
      message: 'Shared link deleted successfully',
    };
  }
}
