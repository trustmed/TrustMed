import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MedicalRecord,
  RecordCategory,
} from '../entities/medical-record.entity';
import { ConsentService } from './consent.service';
import { AuditService, AuditEventType } from '../audit/audit.service';
import { RecordListItemDto } from './dto/record-list-item.dto';
import { VaultClientService } from '../vault-client/vault-client.service';

@Injectable()
export class MedicalRecordsService {
  private readonly logger = new Logger(MedicalRecordsService.name);

  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepo: Repository<MedicalRecord>,
    private readonly vaultClient: VaultClientService,
    private readonly consentService: ConsentService,
    private readonly auditService: AuditService,
  ) {}

  async uploadRecord(
    patientId: string,
    uploaderId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    metadata: {
      category?: RecordCategory;
      notes?: string;
      doctorName?: string;
      hospitalName?: string;
      recordDate?: Date;
    },
    ipAddress?: string,
  ): Promise<{ savedRecord: MedicalRecord; medicalRecordId: string }> {
    const vaultResult = await this.vaultClient.uploadFile(
      fileBuffer,
      fileName,
      mimeType,
      patientId,
      uploaderId,
    );

    const record = this.medicalRecordRepo.create({
      patientId,
      uploaderId,
      s3Uri: vaultResult.s3_uri,
      documentHash: vaultResult.document_hash,
      encryptedAesKey: vaultResult.encrypted_aes_key,
      originalFileName: fileName,
      mimeType,
      fileSize: fileBuffer.length,
      category: metadata.category ?? RecordCategory.OTHER,
      notes: metadata.notes ?? null,
      doctorName: metadata.doctorName ?? null,
      hospitalName: metadata.hospitalName ?? null,
      recordDate: metadata.recordDate ?? null,
    });

    const savedRecord = await this.medicalRecordRepo.save(record);

    this.logger.log(
      `MedicalRecord saved via Vault — id: ${savedRecord.id}, hash: ${vaultResult.document_hash}`,
    );

    void this.auditService.log({
      eventType: AuditEventType.RECORD_UPLOADED,
      actorId: uploaderId,
      targetResource: savedRecord.id,
      ipAddress,
      additionalData: {
        patientId,
        originalFileName: fileName,
        mimeType,
        fileSize: fileBuffer.length,
      },
    });

    return {
      savedRecord,
      medicalRecordId: savedRecord.id,
    };
  }

  async listMyRecords(
    authUserId: string,
    ipAddress?: string,
    baseUrl?: string,
  ): Promise<RecordListItemDto[]> {
    const records = await this.medicalRecordRepo.find({
      where: [{ patientId: authUserId }, { uploaderId: authUserId }],
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'originalFileName',
        'mimeType',
        'fileSize',
        'documentHash',
        'patientId',
        'category',
        'notes',
        'doctorName',
        'hospitalName',
        'recordDate',
        'createdAt',
        'updatedAt',
      ],
    });

    const mappedRecords: RecordListItemDto[] = records.map((r) => ({
      ...r,
      fileName: r.originalFileName,
      fileType: r.mimeType,
      personId: r.patientId,
      fileUrl: baseUrl
        ? `${baseUrl}/api/medical-records/${r.id}/download`
        : `/api/medical-records/${r.id}/download`,
    }));

    void this.auditService.log({
      eventType: AuditEventType.RECORD_LISTED,
      actorId: authUserId,
      ipAddress,
      additionalData: { count: mappedRecords.length },
    });

    return mappedRecords;
  }

  async downloadRecord(
    recordId: string,
    requesterId: string,
    ipAddress?: string,
  ): Promise<{
    buffer: Buffer;
    originalFileName: string;
    mimeType: string;
  }> {
    const record = await this.medicalRecordRepo.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    const hasAccess = await this.consentService.verifyAccess(
      requesterId,
      record,
    );

    if (!hasAccess) {
      void this.auditService.log({
        eventType: AuditEventType.RECORD_ACCESS_DENIED,
        actorId: requesterId,
        targetResource: recordId,
        ipAddress,
      });
      throw new ForbiddenException(
        'You do not have consent to access this record',
      );
    }

    const objectKey = record.s3Uri.split('/').slice(3).join('/');

    const decryptedBuffer = await this.vaultClient.downloadFile(
      objectKey,
      record.encryptedAesKey,
    );

    void this.auditService.log({
      eventType: AuditEventType.RECORD_DOWNLOADED,
      actorId: requesterId,
      targetResource: recordId,
      ipAddress,
      additionalData: {
        originalFileName: record.originalFileName,
        mimeType: record.mimeType,
      },
    });

    this.logger.log(
      `Record ${recordId} decrypted via Vault and streamed to ${requesterId}`,
    );

    return {
      buffer: decryptedBuffer,
      originalFileName: record.originalFileName,
      mimeType: record.mimeType,
    };
  }

  async updateRecord(
    recordId: string,
    authUserId: string,
    updates: Partial<MedicalRecord>,
    ipAddress?: string,
    baseUrl?: string,
  ): Promise<RecordListItemDto> {
    const record = await this.medicalRecordRepo.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // Basic ownership check
    if (record.patientId !== authUserId && record.uploaderId !== authUserId) {
      throw new ForbiddenException('Not authorized to update this record');
    }

    Object.assign(record, updates);
    const saved = await this.medicalRecordRepo.save(record);

    void this.auditService.log({
      eventType: AuditEventType.RECORD_UPLOADED,
      actorId: authUserId,
      targetResource: recordId,
      ipAddress,
      additionalData: { updates },
    });

    return {
      ...saved,
      fileName: saved.originalFileName,
      fileType: saved.mimeType,
      personId: saved.patientId,
      fileUrl: baseUrl
        ? `${baseUrl}/api/medical-records/${saved.id}/download`
        : `/api/medical-records/${saved.id}/download`,
    };
  }

  async deleteRecord(
    recordId: string,
    authUserId: string,
    ipAddress?: string,
  ): Promise<void> {
    const record = await this.medicalRecordRepo.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // Basic ownership check
    if (record.patientId !== authUserId && record.uploaderId !== authUserId) {
      throw new ForbiddenException('Not authorized to delete this record');
    }

    try {
      const objectKey = record.s3Uri.split('/').slice(3).join('/');
      await this.vaultClient.deleteFile(objectKey);
      this.logger.log(`Deleted file from vault: ${objectKey}`);
    } catch (err) {
      this.logger.error(
        `Failed to delete file from vault: ${record.s3Uri}`,
        err,
      );
    }

    await this.medicalRecordRepo.remove(record);

    void this.auditService.log({
      eventType: AuditEventType.RECORD_ACCESS_DENIED,
      actorId: authUserId,
      targetResource: recordId,
      ipAddress,
    });
  }
}
