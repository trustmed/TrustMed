import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Storage,
  StorageFile,
  StorageUploadInput,
  StorageUploadResult,
  StorageViewInput,
  StorageViewResult,
  StorageDeleteInput,
} from './storage.interface';
import { EncryptionService } from '../encryption/encryption.service';
import {
  MedicalRecord,
  RecordCategory,
} from '../entities/medical-record.entity';
import { Person } from '../entities/person.entity';
import { AuditService, AuditEventType } from '../audit/audit.service';

export interface UploadResult {
  objectKey: string;
  s3Uri: string;
  documentHash: string;
  medicalRecordId: string;
  savedRecord: MedicalRecord;
}

export interface UploadMetadata {
  category?: RecordCategory;
  notes?: string;
  doctorName?: string;
  hospitalName?: string;
  recordDate?: Date;
}


@Injectable()
export class S3StorageService implements Storage {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly isLocalStorage: boolean;
  private readonly localStorageBasePath: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepo: Repository<MedicalRecord>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    private readonly encryptionService: EncryptionService,
    private readonly auditService: AuditService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    // NODE_ENV is the sole switch — no STORAGE_TYPE
    this.isLocalStorage =
      nodeEnv.toLowerCase() === 'development' ||
      nodeEnv.toLowerCase() === 'local';

    this.localStorageBasePath = this.configService.get<string>(
      'LOCAL_STORAGE_BASE_PATH',
      './uploads',
    );

    this.bucketName = this.configService.get<string>(
      'S3_BUCKET_NAME',
      'trustmed-vault',
    );

    if (this.isLocalStorage) {
      this.logger.log(`Using Local Storage at: ${this.localStorageBasePath}`);
      if (!fs.existsSync(this.localStorageBasePath)) {
        fs.mkdirSync(this.localStorageBasePath, { recursive: true });
        this.logger.log(
          `Created local storage directory: ${this.localStorageBasePath}`,
        );
      }
    } else {
      const endpoint = this.configService.get<string>('S3_ENDPOINT');
      const region = this.configService.get<string>('S3_REGION', 'us-east-1');
      const accessKeyId = this.configService.get<string>(
        'S3_ACCESS_KEY_ID',
        '',
      );
      const secretAccessKey = this.configService.get<string>(
        'S3_SECRET_ACCESS_KEY',
        '',
      );
      const forcePathStyle =
        this.configService.get<string>('S3_FORCE_PATH_STYLE', 'true') ===
        'true';

      this.s3Client = new S3Client({
        endpoint,
        region,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle,
      });

      this.logger.log(
        `S3StorageService initialized (S3) — endpoint: ${endpoint}, bucket: ${this.bucketName}`,
      );
    }
  }

  // ── Storage interface ──

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    const { file, customFileName, nestedDirectories, encrypt } = input;

    const validatedNestedDirectories =
      this.validateNestedDirectories(nestedDirectories);
    const fileName = this.buildFileName(file, customFileName);
    if (encrypt) {
      return this.uploadWithEncryption(file, fileName, validatedNestedDirectories);
    }

    const objectKey = this.buildObjectKey(validatedNestedDirectories, fileName);

    if (this.isLocalStorage) {
      const fullPath = path.join(this.localStorageBasePath, objectKey);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, file.buffer);
      this.logger.log(
        `Saved file locally: ${fullPath} (${file.size} bytes)`,
      );
    } else {
      if (!this.s3Client) {
        throw new Error('S3 client not initialized');
      }
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      this.logger.log(
        `Uploaded file to S3: ${objectKey} (${file.size} bytes)`,
      );
    }

    return {
      message: 'File received successfully',
      fileName,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async view(input: StorageViewInput): Promise<StorageViewResult> {
    const { fileName, nestedDirectories, encryptedAesKey, storageUri } = input;

    if (encryptedAesKey) {
      return this.viewWithDecryption(
        fileName,
        nestedDirectories,
        encryptedAesKey,
        storageUri,
      );
    }

    const validatedNestedDirectories =
      this.validateNestedDirectories(nestedDirectories);
    const validatedFileName = this.validateFileName(fileName);
    const objectKey = this.buildObjectKey(
      validatedNestedDirectories,
      validatedFileName,
    );

    let buffer: Buffer;

    if (this.isLocalStorage) {
      const fullPath = path.join(this.localStorageBasePath, objectKey);
      if (!fs.existsSync(fullPath)) {
        throw new NotFoundException('File not found');
      }
      buffer = fs.readFileSync(fullPath);
    } else {
      if (!this.s3Client) {
        throw new Error('S3 client not initialized');
      }
      try {
        const response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: objectKey,
          }),
        );
        buffer = Buffer.from(await response.Body!.transformToByteArray());
      } catch (err: unknown) {
        const error = err as { name?: string; message?: string };
        if (error.name === 'NoSuchKey') {
          throw new NotFoundException('File not found in storage');
        }
        throw err;
      }
    }

    return {
      fileName: validatedFileName,
      mimeType: this.detectMimeType(validatedFileName),
      size: buffer.length,
      buffer,
    };
  }

  async delete(input: StorageDeleteInput): Promise<void> {
    const { storageUri } = input;

    if (storageUri) {
      return this.deleteByUri(storageUri);
    }
    const validatedNestedDirectories = this.validateNestedDirectories(
      input.nestedDirectories,
    );
    const validatedFileName = this.validateFileName(input.fileName);
    const objectKey = this.buildObjectKey(
      validatedNestedDirectories,
      validatedFileName,
    );

    if (this.isLocalStorage) {
      const fullPath = path.join(this.localStorageBasePath, objectKey);
      try {
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
          this.logger.log(`Deleted local file: ${fullPath}`);
        } else {
          this.logger.warn(`Local file already missing: ${fullPath}`);
        }
      } catch (err: unknown) {
        const error = err as Error;
        this.logger.error(
          `Failed to delete local file ${fullPath}: ${error.message}`,
        );
      }
    } else {
      await this.deleteFromS3(objectKey);
    }
  }

  // ── Encrypted operations ──
  async uploadEncryptedFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    patientId: string,
    uploaderId: string,
    metadata?: UploadMetadata,
    ipAddress?: string,
  ): Promise<UploadResult> {
    const documentHash = this.hashFile(fileBuffer);
    const encryptionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    const encryptedPayload = Buffer.concat([iv, authTag, encrypted]);

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `encrypted/${uuidv4()}-${sanitizedName}`;
    let storageUri: string;

    if (this.isLocalStorage) {
      const fullPath = path.join(this.localStorageBasePath, objectKey);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(fullPath, encryptedPayload);
      this.logger.log(
        `Saved encrypted file locally: ${fullPath} (${encryptedPayload.length} bytes)`,
      );
      storageUri = `local://${objectKey}`;
    } else {
      if (!this.s3Client) {
        throw new Error('S3 client not initialized but storage type is s3');
      }
      storageUri = `s3://${this.bucketName}/${objectKey}`;
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
        `Uploaded encrypted file to S3: ${objectKey} (${encryptedPayload.length} bytes)`,
      );
    }

    const sealedAesKey = this.encryptionService.seal(encryptionKey);

    const person = await this.personRepo.findOneBy({ id: patientId });

    const record = this.medicalRecordRepo.create({
      person: person || undefined,
      patientId,
      uploaderId,
      s3Uri: storageUri,
      documentHash,
      encryptedAesKey: sealedAesKey,
      originalFileName: fileName,
      mimeType,
      fileName,
      fileType: mimeType,
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

    void this.auditService.log({
      eventType: AuditEventType.RECORD_UPLOADED,
      actorId: uploaderId,
      patientId,
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
      s3Uri: storageUri,
      documentHash,
      medicalRecordId: savedRecord.id,
      savedRecord,
    };
  }

  async getDecryptedBuffer(
    recordId: string,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const record = await this.medicalRecordRepo.findOne({
      where: { id: recordId },
    });

    if (!record) {
      this.logger.warn(`Medical record NOT FOUND in DB: ${recordId}`);
      throw new NotFoundException('Medical record not found');
    }

    const s3Uri = record.s3Uri;
    let encryptedPayload: Buffer;

    if (this.isLocalStorage || s3Uri.startsWith('local://')) {
      const objectKey = s3Uri.startsWith('local://')
        ? s3Uri.replace('local://', '')
        : s3Uri.split('/').slice(3).join('/');

      const fullPath = path.join(this.localStorageBasePath, objectKey);
      this.logger.log(
        `Reading encrypted file from local storage: ${fullPath}`,
      );

      if (!fs.existsSync(fullPath)) {
        this.logger.error(`Local file not found: ${fullPath}`);
        throw new NotFoundException('File not found in local storage');
      }

      encryptedPayload = await fs.promises.readFile(fullPath);
    } else {
      if (!this.s3Client) {
        throw new Error('S3 client not initialized but storage type is s3');
      }
      const objectKey = s3Uri.split('/').slice(3).join('/');

      this.logger.log(
        `Fetching from S3: Bucket=${this.bucketName}, Key=${objectKey} (from URI: ${s3Uri})`,
      );

      try {
        const s3Response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: objectKey,
          }),
        );
        encryptedPayload = Buffer.from(
          await s3Response.Body!.transformToByteArray(),
        );
      } catch (err: unknown) {
        const error = err as { message?: string; name?: string };
        this.logger.error(
          `S3 GetObject failed for key ${objectKey}: ${error.message ?? 'Unknown error'}`,
        );
        if (error.name === 'NoSuchKey') {
          throw new NotFoundException('File not found in storage');
        }
        throw err;
      }
    }

    this.logger.log(
      `Read ${encryptedPayload.length} encrypted bytes. Decrypting...`,
    );

    const aesKey = this.encryptionService.unseal(record.encryptedAesKey);
    const iv = encryptedPayload.subarray(0, 12);
    const authTag = encryptedPayload.subarray(12, 28);
    const ciphertext = encryptedPayload.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return {
      buffer: decrypted,
      fileName: record.originalFileName,
      mimeType: record.mimeType,
    };
  }

  async getPresignedDownloadUrl(
    recordId: string,
    userId: string,
  ): Promise<string> {
    const record = await this.medicalRecordRepo.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    const s3Uri = record.s3Uri;

    if (this.isLocalStorage || s3Uri.startsWith('local://')) {
      return `/api/medical-records/${recordId}/download`;
    }

    if (!this.s3Client) {
      throw new Error('S3 client not initialized but storage type is s3');
    }

    const objectKey = s3Uri.replace(`s3://${this.bucketName}/`, '');

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });

    void this.auditService.log({
      eventType: AuditEventType.RECORD_DOWNLOADED,
      actorId: userId,
      patientId: record.patientId,
      targetResource: recordId,
      additionalData: { s3Uri: record.s3Uri },
    });

    return url;
  }

  async deleteFile(recordId: string): Promise<void> {
    const record = await this.medicalRecordRepo.findOne({
      where: { id: recordId },
    });

    if (!record || !record.s3Uri) {
      this.logger.warn(
        `Cannot delete file: Record ${recordId} not found or has no storage URI`,
      );
      return;
    }

    await this.deleteByUri(record.s3Uri);
  }

  isLocalStorageMode(): boolean {
    return this.isLocalStorage;
  }

  // ── Private helpers ──

  private async uploadWithEncryption(
    file: StorageFile,
    fileName: string,
    nestedDirectories: string[],
  ): Promise<StorageUploadResult> {
    const documentHash = this.hashFile(file.buffer);
    const encryptionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(file.buffer),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    const encryptedPayload = Buffer.concat([iv, authTag, encrypted]);

    const objectKey = this.buildObjectKey(nestedDirectories, fileName);
    let storageUri: string;

    if (this.isLocalStorage) {
      const fullPath = path.join(this.localStorageBasePath, objectKey);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, encryptedPayload);
      storageUri = `local://${objectKey}`;
      this.logger.log(
        `Saved encrypted file locally: ${fullPath} (${encryptedPayload.length} bytes)`,
      );
    } else {
      if (!this.s3Client) {
        throw new Error('S3 client not initialized');
      }
      storageUri = `s3://${this.bucketName}/${objectKey}`;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
          Body: encryptedPayload,
          ContentType: 'application/octet-stream',
          Metadata: { 'x-trustmed-encryption': 'aes-256-gcm' },
        }),
      );
      this.logger.log(
        `Uploaded encrypted file to S3: ${objectKey} (${encryptedPayload.length} bytes)`,
      );
    }

    const sealedAesKey = this.encryptionService.seal(encryptionKey);

    return {
      message: 'File received successfully',
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      documentHash,
      encryptedAesKey: sealedAesKey,
      storageUri,
    };
  }

  private async viewWithDecryption(
    fileName: string,
    nestedDirectories: string[],
    encryptedAesKey: string,
    storageUri?: string,
  ): Promise<StorageViewResult> {
    let encryptedPayload: Buffer;

    if (storageUri) {
      encryptedPayload = await this.readByUri(storageUri);
    } else {
      const validatedNestedDirectories =
        this.validateNestedDirectories(nestedDirectories);
      const validatedFileName = this.validateFileName(fileName);
      const objectKey = this.buildObjectKey(
        validatedNestedDirectories,
        validatedFileName,
      );

      if (this.isLocalStorage) {
        const fullPath = path.join(this.localStorageBasePath, objectKey);
        if (!fs.existsSync(fullPath)) {
          throw new NotFoundException('File not found');
        }
        encryptedPayload = fs.readFileSync(fullPath);
      } else {
        encryptedPayload = await this.readFromS3(objectKey);
      }
    }

    const aesKey = this.encryptionService.unseal(encryptedAesKey);

    const iv = encryptedPayload.subarray(0, 12);
    const authTag = encryptedPayload.subarray(12, 28);
    const ciphertext = encryptedPayload.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return {
      fileName,
      mimeType: this.detectMimeType(fileName),
      size: decrypted.length,
      buffer: decrypted,
    };
  }

  private async readByUri(uri: string): Promise<Buffer> {
    if (uri.startsWith('local://')) {
      const objectKey = uri.replace('local://', '');
      const fullPath = path.join(this.localStorageBasePath, objectKey);
      if (!fs.existsSync(fullPath)) {
        throw new NotFoundException('File not found in local storage');
      }
      return fs.promises.readFile(fullPath);
    }

    // s3://bucket/key
    const objectKey = uri.split('/').slice(3).join('/');
    return this.readFromS3(objectKey);
  }

  private async readFromS3(objectKey: string): Promise<Buffer> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
        }),
      );
      return Buffer.from(await response.Body!.transformToByteArray());
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === 'NoSuchKey') {
        throw new NotFoundException('File not found in storage');
      }
      throw err;
    }
  }

  private async deleteByUri(uri: string): Promise<void> {
    if (uri.startsWith('local://')) {
      const objectKey = uri.replace('local://', '');
      const fullPath = path.join(this.localStorageBasePath, objectKey);
      try {
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
          this.logger.log(`Deleted local file: ${fullPath}`);
        } else {
          this.logger.warn(`Local file already missing: ${fullPath}`);
        }
      } catch (err: unknown) {
        const error = err as Error;
        this.logger.error(
          `Failed to delete local file ${fullPath}: ${error.message}`,
        );
      }
      return;
    }

    // s3://bucket/key
    const objectKey = uri.split('/').slice(3).join('/');
    await this.deleteFromS3(objectKey);
  }

  private async deleteFromS3(objectKey: string): Promise<void> {
    if (!this.s3Client) {
      this.logger.error('S3 client not initialized');
      return;
    }
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
        }),
      );
      this.logger.log(`Deleted file from S3: ${objectKey}`);
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Failed to delete file from S3 (${objectKey}): ${error.message}`,
      );
    }
  }

  private hashFile(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private buildObjectKey(
    nestedDirectories: string[],
    fileName: string,
  ): string {
    const storagePath = this.configService.get<string>(
      'STORAGE_PATH',
      'documents',
    );
    return [storagePath, ...nestedDirectories, fileName].join('/');
  }

  private validateNestedDirectories(nestedDirectories: string[]): string[] {
    const sanitizedSegments = nestedDirectories
      .map((segment) => segment.trim())
      .filter(Boolean);
    if (sanitizedSegments.length === 0) {
      throw new BadRequestException('nestedDirectories is required');
    }
    const hasInvalidSegment = sanitizedSegments.some(
      (segment) =>
        segment === '.' ||
        segment === '..' ||
        segment.includes('\\') ||
        !/^[a-zA-Z0-9._-]+$/.test(segment),
    );
    if (hasInvalidSegment) {
      throw new BadRequestException(
        'nestedDirectories contains invalid segments',
      );
    }
    return sanitizedSegments;
  }

  private validateFileName(fileName: string): string {
    const normalized = fileName.trim();
    if (!normalized) {
      throw new BadRequestException('fileName is required');
    }
    const baseName = path.basename(normalized);
    if (
      baseName !== normalized ||
      baseName === '.' ||
      baseName === '..' ||
      baseName.includes('\\') ||
      !/^[a-zA-Z0-9._-]+$/.test(baseName)
    ) {
      throw new BadRequestException('fileName is invalid');
    }
    return baseName;
  }

  private buildFileName(file: StorageFile, customFileName: string): string {
    const normalized = customFileName.trim();
    if (!normalized) {
      throw new BadRequestException('customFileName is required');
    }
    const customBaseName = path.parse(normalized).name;
    const sanitized = customBaseName.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!sanitized) {
      throw new BadRequestException('customFileName is invalid');
    }
    const extension = path.extname(file.originalname);
    return `${sanitized}${extension}`;
  }

  private detectMimeType(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    switch (extension) {
      case '.png': return 'image/png';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.gif': return 'image/gif';
      case '.webp': return 'image/webp';
      case '.pdf': return 'application/pdf';
      case '.txt': return 'text/plain';
      case '.html': return 'text/html';
      case '.json': return 'application/json';
      default: return 'application/octet-stream';
    }
  }
}
