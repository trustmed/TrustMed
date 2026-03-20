import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  MedicalRecord,
  RecordCategory,
} from '../entities/medical-record.entity';
import { CryptoService } from './crypto.service';
import { AuditService, AuditEventType } from '../audit/audit.service';

/** Shape returned by {@link S3VaultService.uploadEncryptedFile}. */
export interface UploadResult {
  /** S3 object key (e.g. `encrypted/uuid-filename.pdf`). */
  objectKey: string;
  /** Full S3 URI (`s3://<bucket>/<objectKey>`). */
  s3Uri: string;
  /** SHA-256 hex digest of the **raw** file. */
  documentHash: string;
  /** UUID of the persisted {@link MedicalRecord}. */
  medicalRecordId: string;
  /** The full saved record entity. */
  savedRecord: MedicalRecord;
}

/** Extra metadata for medical records. */
export interface UploadMetadata {
  category?: RecordCategory;
  notes?: string;
  doctorName?: string;
  hospitalName?: string;
  recordDate?: Date;
}

@Injectable()
export class S3VaultService {
  private readonly logger = new Logger(S3VaultService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepo: Repository<MedicalRecord>,
    private readonly cryptoService: CryptoService,
    private readonly auditService: AuditService,
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

    this.logger.log(
      `S3VaultService initialized — endpoint: ${endpoint}, bucket: ${this.bucketName}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Hash → Encrypt → Upload → Persist.
   *
   * 1. Computes a SHA-256 digest of the **raw** buffer (`documentHash`).
   * 2. Generates a random AES-256-GCM key + 96-bit IV, encrypts the buffer
   *    entirely in memory (no disk writes).
   * 3. Uploads the encrypted payload to Oracle S3.
   * 4. **Envelope-encrypts** the AES key via {@link CryptoService.seal}.
   * 5. Saves a {@link MedicalRecord} row with all metadata.
   *
   * The raw AES key is discarded from process memory after sealing.
   */
  async uploadEncryptedFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    patientId: string,
    uploaderId: string,
    metadata?: UploadMetadata,
    ipAddress?: string,
  ): Promise<UploadResult> {
    // 1. SHA-256 hash of raw file
    const documentHash = this.hashFile(fileBuffer);

    // 2. AES-256-GCM encryption
    const encryptionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM

    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag(); // 16 bytes

    // iv (12) + authTag (16) + ciphertext — deterministic layout for the decryptor
    const encryptedPayload = Buffer.concat([iv, authTag, encrypted]);

    // 3. Build object key & upload to S3
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `encrypted/${uuidv4()}-${sanitizedName}`;
    const s3Uri = `s3://${this.bucketName}/${objectKey}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        Body: encryptedPayload,
        ContentType: 'application/octet-stream',
        Metadata: {
          'x-trustmed-encryption': 'aes-256-gcm',
          'x-trustmed-original-name': sanitizedName,
        },
      }),
    );

    this.logger.log(
      `Uploaded encrypted file: ${objectKey} (${encryptedPayload.length} bytes)`,
    );

    // 4. Envelope-encrypt the AES key before storing
    const sealedAesKey = this.cryptoService.seal(encryptionKey);

    // 5. Persist metadata
    const record = this.medicalRecordRepo.create({
      patientId,
      uploaderId,
      s3Uri,
      documentHash,
      encryptedAesKey: sealedAesKey,
      originalFileName: fileName,
      mimeType,
      fileSize: fileBuffer.length,
      category: metadata?.category ?? RecordCategory.OTHER,
      notes: metadata?.notes ?? null,
      doctorName: metadata?.doctorName ?? null,
      hospitalName: metadata?.hospitalName ?? null,
      recordDate: metadata?.recordDate ?? null,
    });

    const savedRecord = await this.medicalRecordRepo.save(record);

    this.logger.log(
      `MedicalRecord saved — id: ${savedRecord.id}, hash: ${documentHash}`,
    );

    // 6. Audit
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
      objectKey,
      s3Uri,
      documentHash,
      medicalRecordId: savedRecord.id,
      savedRecord,
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Returns the SHA-256 hex digest of the given buffer. */
  private hashFile(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
