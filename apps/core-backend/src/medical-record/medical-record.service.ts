import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Person } from '../entities/person.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { CreateMedicalRecordRequestDto } from './dto/create-medical-record-request.dto';
import { CreateMedicalRecordResponseDto } from './dto/create-medical-record-response.dto';
import { S3StorageService } from '../storage/s3-storage.service';
import { AuditService, AuditEventType } from '../audit/audit.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MedicalRecordService {
  private readonly logger = new Logger(MedicalRecordService.name);

  constructor(
    @InjectRepository(MedicalRecord)
    private readonly recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    @InjectRepository(AuthUser)
    private readonly authUserRepo: Repository<AuthUser>,
    private readonly s3StorageService: S3StorageService,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
  ) {}

  async searchPatients(query: string): Promise<
    Array<{
      authUserId: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      records: MedicalRecord[];
    }>
  > {
    const authUsers = await this.authUserRepo.find({
      where: [
        { email: ILike(`%${query}%`) },
        { firstName: ILike(`%${query}%`) },
        { lastName: ILike(`%${query}%`) },
      ],
      take: 20, // Limit to 20 results for safety
    });

    if (!authUsers.length) return [];

    const results: Array<{
      authUserId: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      records: MedicalRecord[];
    }> = [];

    for (const authUser of authUsers) {
      const person = await this.personRepo.findOne({
        where: { authUserId: authUser.id },
      });
      if (!person) continue;

      const records = await this.recordRepo.find({
        where: { person: { id: person.id } },
        relations: ['consentRequests', 'consentRequests.requester'],
      });

      results.push({
        authUserId: authUser.id,
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        email: authUser.email,
        records,
      });
    }

    return results;
  }

  async create(
    dto: CreateMedicalRecordRequestDto,
  ): Promise<CreateMedicalRecordResponseDto> {
    const person = await this.personRepo.findOneByOrFail({
      authUserId: dto.personId,
    });

    let saved: MedicalRecord;

    if (dto.file) {
      const customFileName = `${Date.now()}_${person.id}`;
      const uploadResult = await this.storageService.upload({
        file: {
          originalname: dto.file.originalname,
          mimetype: dto.file.mimetype,
          size: dto.file.size,
          buffer: dto.file.buffer,
        },
        customFileName,
        nestedDirectories: ['medical-records', person.id],
        encrypt: true,
      });

      const recordEntity = this.recordRepo.create({
        person,
        patientId: person.id,
        uploaderId: person.id,
        originalFileName: dto.file.originalname,
        fileName: uploadResult.fileName,
        mimeType: uploadResult.mimeType,
        fileType: uploadResult.mimeType,
        fileSize: uploadResult.size,
        s3Uri: uploadResult.storageUri ?? null,
        documentHash: uploadResult.documentHash ?? null,
        encryptedAesKey: uploadResult.encryptedAesKey ?? null,
        category: dto.category as any,
        notes: dto.notes,
        doctorName: dto.doctorName,
        hospitalName: dto.hospitalName,
        recordDate: dto.recordDate ? new Date(dto.recordDate) : null,
      } as any);
      saved = (await this.recordRepo.save(
        recordEntity,
      )) as unknown as MedicalRecord;
    } else {
      saved = (await this.recordRepo.save(
        this.recordRepo.create({
          person,
          patientId: person.id,
          uploaderId: person.id,
          category: dto.category as any,
          notes: dto.notes,
          doctorName: dto.doctorName,
          hospitalName: dto.hospitalName,
          recordDate: dto.recordDate ? new Date(dto.recordDate) : null,
        }),
      )) as unknown as MedicalRecord;
    }

    await this.auditService.log({
      eventType: AuditEventType.RECORD_UPLOADED,
      actorId: person.id,
      patientId: person.id,
      targetResource: saved.id,
    });

    return {
      id: saved.id,
      personId: saved.person?.id || person.id,
      fileName: dto.file ? saved.originalFileName || saved.fileName || '' : '',
      fileUrl: '',
      fileType: dto.file ? saved.mimeType || saved.fileType || '' : '',
      fileSize: dto.file ? Number(saved.fileSize) || 0 : 0,
      category: saved.category as string,
      notes: saved.notes || undefined,
      doctorName: saved.doctorName || undefined,
      hospitalName: saved.hospitalName || undefined,
      recordDate: saved.recordDate
        ? new Date(saved.recordDate).toISOString()
        : undefined,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async getAllByAuthUserId(authuserId: string) {
    const person = await this.personRepo.findOne({
      where: { authUserId: authuserId },
    });
    if (!person) return [];
    return this.recordRepo.find({
      where: { person: { id: person.id } },
      relations: ['consentRequests', 'consentRequests.requester'],
    });
  }

  async getByIdForAuthUser(authuserId: string, recordId: string) {
    const person = await this.personRepo.findOne({
      where: { authUserId: authuserId },
    });
    if (!person) return null;
    return this.recordRepo.findOne({
      where: { id: recordId, person: { id: person.id } },
      relations: ['consentRequests', 'consentRequests.requester'],
    });
  }

  async deleteByIdForAuthUser(authuserId: string, recordId: string) {
    const person = await this.personRepo.findOne({
      where: { authUserId: authuserId },
    });
    if (!person)
      throw new NotFoundException('Medical record not found or not authorized');
    const record = await this.recordRepo.findOne({
      where: { id: recordId, person: { id: person.id } },
    });
    if (!record)
      throw new NotFoundException('Medical record not found or not authorized');

    // Physical file deletion (cleanup from local FS or S3)
    if (record.s3Uri) {
      // Vault-created file — delete by URI via S3StorageService
      await this.s3StorageService.deleteFile(recordId);
    } else if (record.fileName) {
      // Storage-created file — delete by directory + fileName
      await this.storageService.delete({
        nestedDirectories: ['medical-records', person.id],
        fileName: record.fileName,
      });
    }

    await this.recordRepo.remove(record);
    await this.auditService.log({
      eventType: AuditEventType.RECORD_DELETED,
      actorId: person.id,
      patientId: record.patientId,
      targetResource: recordId,
    });
    return true;
  }

  async viewRecord(
    recordId: string,
    authUserId: string,
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    this.logger.log(`Viewing record: ${recordId} for user: ${authUserId}`);
    const person = await this.personRepo.findOne({
      where: { authUserId },
    });
    if (!person) {
      throw new NotFoundException('User profile not found');
    }

    const record = await this.recordRepo.findOne({
      where: { id: recordId, person: { id: person.id } },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found or not authorized');
    }

    const fileName = record.fileName || record.originalFileName;
    if (!fileName) {
      throw new NotFoundException('File not found for this medical record');
    }

    // If the record has an encrypted AES key, decrypt via the storage service
    if (record.encryptedAesKey) {
      const viewed = await this.storageService.view({
        fileName,
        nestedDirectories: ['medical-records', person.id],
        encryptedAesKey: record.encryptedAesKey,
        storageUri: record.s3Uri || undefined,
      });

      return {
        buffer: viewed.buffer,
        mimeType: viewed.mimeType || record.mimeType,
        fileName: viewed.fileName,
      };
    }

    // No encryption — read raw
    const viewed = await this.storageService.view({
      fileName,
      nestedDirectories: ['medical-records', person.id],
    });

    return {
      buffer: viewed.buffer,
      mimeType: viewed.mimeType,
      fileName: viewed.fileName,
    };
  }

  async updateByIdForAuthUser(
    authuserId: string,
    recordId: string,
    dto: {
      category?: string;
      notes?: string;
      doctorName?: string;
      hospitalName?: string;
      recordDate?: string;
    },
  ): Promise<MedicalRecord> {
    const person = await this.personRepo.findOne({
      where: { authUserId: authuserId },
    });
    if (!person) {
      throw new NotFoundException('Medical record not found or not authorized');
    }
    const record = await this.recordRepo.findOne({
      where: { id: recordId, person: { id: person.id } },
    });
    if (!record) {
      throw new NotFoundException('Medical record not found or not authorized');
    }
    // Update fields
    if (dto.category) {
      record.category = dto.category as any;
    }
    record.notes = dto.notes ?? record.notes;
    record.doctorName = dto.doctorName ?? record.doctorName;
    record.hospitalName = dto.hospitalName ?? record.hospitalName;
    if (dto.recordDate) {
      record.recordDate = new Date(dto.recordDate);
    }
    const saved = await this.recordRepo.save(record);
    await this.auditService.log({
      eventType: AuditEventType.RECORD_UPDATED,
      actorId: person.id,
      patientId: record.patientId,
      targetResource: recordId,
    });

    return saved;
  }

  async downloadRecord(
    recordId: string,
    authUserId: string,
  ): Promise<{ buffer: Buffer; originalFileName: string; mimeType: string }> {
    const person = await this.personRepo.findOne({
      where: { authUserId: authUserId },
    });
    if (!person) {
      throw new NotFoundException('User profile not found');
    }

    const record = await this.recordRepo.findOne({
      where: { id: recordId, person: { id: person.id } },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found or not authorized');
    }

    // Use S3StorageService for encrypted records (backward compat with vault-created files)
    if (record.encryptedAesKey && record.s3Uri) {
      const { buffer, fileName, mimeType } =
        await this.s3StorageService.getDecryptedBuffer(recordId);
      await this.auditService.log({
        eventType: AuditEventType.RECORD_DOWNLOADED,
        actorId: person.id,
        patientId: record.patientId,
        targetResource: recordId,
      });
      return { buffer, originalFileName: fileName, mimeType };
    }

    // Use StorageService for non-encrypted records
    const fileName = record.fileName || record.originalFileName;
    if (!fileName) {
      throw new NotFoundException('File not found for this medical record');
    }

    const viewed = await this.storageService.view({
      fileName,
      nestedDirectories: ['medical-records', person.id],
      encryptedAesKey: record.encryptedAesKey || undefined,
      storageUri: record.s3Uri || undefined,
    });

    await this.auditService.log({
      eventType: AuditEventType.RECORD_DOWNLOADED,
      actorId: person.id,
      patientId: record.patientId,
      targetResource: recordId,
    });

    return {
      buffer: viewed.buffer,
      originalFileName: viewed.fileName,
      mimeType: viewed.mimeType,
    };
  }
}
