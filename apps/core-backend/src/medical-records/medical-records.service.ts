import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import { MedicalRecord } from '../entities/medical-record.entity';
import { CryptoService } from '../s3-vault/crypto.service';
import { ConsentService } from './consent.service';
import { AuditService, AuditEventType } from '../audit/audit.service';
import { RecordListItemDto } from './dto/record-list-item.dto';

@Injectable()
export class MedicalRecordsService {
  private readonly logger = new Logger(MedicalRecordsService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepo: Repository<MedicalRecord>,
    private readonly cryptoService: CryptoService,
    private readonly consentService: ConsentService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>(
      'S3_SECRET_ACCESS_KEY',
      '',
    );
    const forcePathStyle =
      this.configService.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true';

    this.bucketName = this.configService.get<string>(
      'S3_BUCKET_NAME',
      'trustmed-vault',
    );

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle,
    });
  }

  /**
   * Returns all records where the user is the patient or the uploader.
   * Keys and S3 URIs are **never** exposed.
   */
  async listMyRecords(
    authUserId: string,
    ipAddress?: string,
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
      ],
    });

    void this.auditService.log({
      eventType: AuditEventType.RECORD_LISTED,
      actorId: authUserId,
      ipAddress,
      additionalData: { count: records.length },
    });

    return records;
  }

  /**
   * Verifies consent, downloads the encrypted file from S3,
   * decrypts it in memory, and returns the decrypted buffer + metadata.
   *
   * The AES key is unsealed (envelope decryption) only for the duration
   * of the decryption and is never persisted or returned to the caller.
   */
  async downloadRecord(
    recordId: string,
    requesterId: string,
    ipAddress?: string,
  ): Promise<{
    buffer: Buffer;
    originalFileName: string;
    mimeType: string;
  }> {
    // 1. Load record
    const record = await this.medicalRecordRepo.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // 2. Consent check
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

    // 3. Download encrypted blob from S3
    const objectKey = record.s3Uri.replace(`s3://${this.bucketName}/`, '');

    const s3Response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      }),
    );

    const encryptedPayload = Buffer.from(
      await s3Response.Body!.transformToByteArray(),
    );

    // 4. Unseal the envelope-encrypted AES key
    const aesKey = this.cryptoService.unseal(record.encryptedAesKey);

    // 5. Decrypt: payload layout is iv(12) + authTag(16) + ciphertext
    const iv = encryptedPayload.subarray(0, 12);
    const authTag = encryptedPayload.subarray(12, 28);
    const ciphertext = encryptedPayload.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    // 6. Audit the download
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
      `Record ${recordId} decrypted and streamed to ${requesterId}`,
    );

    return {
      buffer: decrypted,
      originalFileName: record.originalFileName,
      mimeType: record.mimeType,
    };
  }
}
