import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
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
import { StorageService } from '../storage/storage.service';

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
    private readonly storageService: StorageService,
  ) {}

  private mapSharedMedicalRecords(
    sharedLink: SharedLinkRecord,
  ): SharedLinkMedicalRecordItemDto[] {
    return [...(sharedLink.sharedMedicalRecords ?? [])].map((item) => {
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
  }

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
    const medicalRecords = this.mapSharedMedicalRecords(sharedLink);

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

  async getSharedLinkRecordsForRecipient(
    sharedLinkId: string,
  ): Promise<SharedLinkMedicalRecordsResponseDto> {
    const sharedLink = await this.sharedLinkRecordRepository.findOne({
      where: { id: sharedLinkId },
      relations: {
        sharedMedicalRecords: {
          medicalRecord: true,
        },
      },
    });

    if (!sharedLink) {
      throw new NotFoundException('Shared link not found');
    }

    if (sharedLink.status !== SharedLinkStatus.ACTIVE) {
      throw new ForbiddenException('Shared link is not active');
    }

    const medicalRecords = this.mapSharedMedicalRecords(sharedLink);

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

  async getSharedRecordFileForRecipient(
    sharedLinkId: string,
    recordId: string,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const sharedLink = await this.sharedLinkRecordRepository.findOne({
      where: { id: sharedLinkId },
      relations: {
        sharedMedicalRecords: {
          medicalRecord: {
            person: true,
          },
        },
      },
    });

    if (!sharedLink) {
      throw new NotFoundException('Shared link not found');
    }

    if (sharedLink.status !== SharedLinkStatus.ACTIVE) {
      throw new ForbiddenException('Shared link is not active');
    }

    const linkedRecord = sharedLink.sharedMedicalRecords?.find(
      (entry) => entry.medicalRecordId === recordId,
    )?.medicalRecord;

    if (!linkedRecord) {
      throw new NotFoundException('Medical record not found for shared link');
    }

    const personId = linkedRecord.person?.id;
    if (!personId) {
      throw new NotFoundException('Medical record owner not found');
    }

    const fileName = linkedRecord.fileName || linkedRecord.originalFileName;
    if (!fileName) {
      throw new NotFoundException('File not found for this medical record');
    }

    const viewed = await this.storageService.view({
      fileName,
      nestedDirectories: ['medical-records', personId],
      encryptedAesKey: linkedRecord.encryptedAesKey || undefined,
      storageUri: linkedRecord.s3Uri || undefined,
    });

    return {
      buffer: viewed.buffer,
      fileName: linkedRecord.originalFileName || viewed.fileName,
      mimeType: viewed.mimeType || linkedRecord.mimeType,
    };
  }

  async addRecordsToSharedLink(
    authUserId: string,
    sharedLinkId: string,
    medicalRecordIds: string[],
  ): Promise<SendSharedLinkResponseDto> {
    const sharedLink = await this.sharedLinkRecordRepository.findOne({
      where: { id: sharedLinkId, authUserId },
      relations: { sharedMedicalRecords: true },
    });

    if (!sharedLink) {
      throw new UnauthorizedException('Invalid shared link');
    }

    const cleanedIds = Array.from(
      new Set(medicalRecordIds.map((id) => id.trim()).filter(Boolean)),
    );

    if (cleanedIds.length === 0) {
      throw new BadRequestException('Medical record IDs are required');
    }

    const accessibleRecords = await this.medicalRecordRepository
      .createQueryBuilder('record')
      .innerJoin('record.person', 'person')
      .where('record.id IN (:...medicalRecordIds)', {
        medicalRecordIds: cleanedIds,
      })
      .andWhere('person.authUserId = :authUserId', { authUserId })
      .select(['record.id'])
      .getMany();

    if (accessibleRecords.length !== cleanedIds.length) {
      throw new BadRequestException(
        'One or more medical records are invalid for this user',
      );
    }

    const existingRecordIds = new Set(
      sharedLink.sharedMedicalRecords?.map((entry) => entry.medicalRecordId) ||
        [],
    );

    const newRecordIds = cleanedIds.filter((id) => !existingRecordIds.has(id));

    if (newRecordIds.length === 0) {
      return {
        success: true,
        message: 'All records are already in this shared link',
      };
    }

    const newSharedRecords = newRecordIds.map((medicalRecordId) =>
      this.sharedLinkRecordRepository.manager.create(SharedLinkMedicalRecord, {
        sharedLinkId,
        medicalRecordId,
        createdBy: authUserId,
        updatedBy: authUserId,
      }),
    );

    await this.sharedLinkRecordRepository.manager.save(newSharedRecords);

    return {
      success: true,
      message: 'Records added to shared link successfully',
    };
  }

  async deleteRecordFromSharedLink(
    authUserId: string,
    sharedLinkId: string,
    recordId: string,
  ): Promise<SendSharedLinkResponseDto> {
    const sharedLink = await this.sharedLinkRecordRepository.findOne({
      where: { id: sharedLinkId, authUserId },
    });

    if (!sharedLink) {
      throw new UnauthorizedException('Invalid shared link');
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(SharedLinkMedicalRecord)
      .where(':sharedLinkId = sharedLinkId', { sharedLinkId })
      .andWhere(':recordId = medicalRecordId', { recordId })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(
        'Medical record not found in this shared link',
      );
    }

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
      where: { id: sharedLinkId, authUserId },
      select: { id: true },
    });

    if (!sharedLink) {
      throw new UnauthorizedException('Invalid shared link');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .delete()
        .from(SharedLinkMedicalRecord)
        .where('sharedLinkId = :sharedLinkId', { sharedLinkId })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(SharedLinkRecord)
        .where('id = :sharedLinkId', { sharedLinkId })
        .execute();
    });

    return {
      success: true,
      message: 'Shared link deleted successfully',
    };
  }
}
