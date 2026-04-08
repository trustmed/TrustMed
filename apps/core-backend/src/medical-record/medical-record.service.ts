import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Person } from '../entities/person.entity';
import { CreateMedicalRecordRequestDto } from './dto/create-medical-record-request.dto';
import { CreateMedicalRecordResponseDto } from './dto/create-medical-record-response.dto';
import { S3VaultService } from '../s3-vault/s3-vault.service';
import { ConsentService } from './consent.service';
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
    private readonly s3VaultService: S3VaultService,
    private readonly storageService: StorageService,
    private readonly consentService: ConsentService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    dto: CreateMedicalRecordRequestDto,
  ): Promise<CreateMedicalRecordResponseDto> {
    const person = await this.personRepo.findOneByOrFail({
      authUserId: dto.personId,
    });

    let saved: MedicalRecord;

    if (dto.file) {
      const customFileName = `${Date.now()}_${person.id}`;
      const uploadResult = this.storageService.upload({
        file: {
          originalname: dto.file.originalname,
          mimetype: dto.file.mimetype,
          size: dto.file.size,
          buffer: dto.file.buffer,
        },
        customFileName,
        nestedDirectories: ['medical-records', person.id],
      });

      saved = await this.recordRepo.save(
        this.recordRepo.create({
          person,
          patientId: person.id,
          uploaderId: person.id,
          originalFileName: dto.file.originalname,
          fileName: uploadResult.fileName,
          mimeType: uploadResult.mimeType,
          fileType: uploadResult.mimeType,
          fileSize: uploadResult.size,
          category: dto.category as any,
          notes: dto.notes,
          doctorName: dto.doctorName,
          hospitalName: dto.hospitalName,
          recordDate: dto.recordDate ? new Date(dto.recordDate) : null,
        }),
      );
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
    await this.s3VaultService.deleteFile(recordId);

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
    console.log('Viewing record:', { recordId, authUserId });
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

    const viewed = this.storageService.view({
      fileName,
      nestedDirectories: ['medical-records', person.id],
    });

    return {
      buffer: viewed.buffer,
      mimeType: viewed.mimeType,
      fileName: viewed.fileName,
    };
  }

  // Removed duplicate methods and misplaced code. Only one set of methods is kept above. Class ends here.
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

  /**
   * Fetches the record, verifies authorization, and returns the decrypted buffer.
   */
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

    const { buffer, fileName, mimeType } =
      await this.s3VaultService.getDecryptedBuffer(recordId);
    await this.auditService.log({
      eventType: AuditEventType.RECORD_DOWNLOADED,
      actorId: person.id,
      patientId: record.patientId,
      targetResource: recordId,
    });

    return { buffer, originalFileName: fileName, mimeType };
  }
}
