import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { Person } from '../entities/person.entity';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

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
        private readonly cryptoService: CryptoService,
        private readonly auditService: AuditService,
    ) {
        const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
        const storageType = this.configService.get<string>('STORAGE_TYPE');

        // Default to local if development and not explicitly set to s3
        this.isLocalStorage = storageType === 'local' || (!storageType && nodeEnv === 'development');
        this.localStorageBasePath = this.configService.get<string>('LOCAL_STORAGE_BASE_PATH', './uploads');

        this.bucketName = this.configService.get<string>(
            'S3_BUCKET_NAME',
            'trustmed-vault',
        );

        if (this.isLocalStorage) {
            this.logger.log(`Using Local Storage at: ${this.localStorageBasePath}`);
            if (!fs.existsSync(this.localStorageBasePath)) {
                fs.mkdirSync(this.localStorageBasePath, { recursive: true });
                this.logger.log(`Created local storage directory: ${this.localStorageBasePath}`);
            }
        } else {
            const endpoint = this.configService.get<string>('S3_ENDPOINT');
            const region = this.configService.get<string>('S3_REGION', 'us-east-1');
            const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID', '');
            const secretAccessKey = this.configService.get<string>(
                'S3_SECRET_ACCESS_KEY',
                '',
            );
            const forcePathStyle =
                this.configService.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true';

            this.s3Client = new S3Client({
                endpoint,
                region,
                credentials: { accessKeyId, secretAccessKey },
                forcePathStyle,
            });

            this.logger.log(
                `S3VaultService initialized (S3) — endpoint: ${endpoint}, bucket: ${this.bucketName}`,
            );
        }
    }

    /** Returns true if the service is configured for local development storage. */
    public isLocalStorageMode(): boolean {
        return this.isLocalStorage;
    }

    /**
     * Hash, Encrypt, and store a file.
     * Computes SHA-256 hash, encrypts via AES-256-GCM, and stores in S3 or local FS.
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

        // 3. Build object key & upload
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

        // 4. Envelope-encrypt the AES key before storing
        const sealedAesKey = this.cryptoService.seal(encryptionKey);

        // 5. Persist metadata
        // Resolve the person relation to ensure compatibility with other controllers
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
            fileName, // legacy
            fileType: mimeType, // legacy
            fileSize: fileBuffer.length, // legacy
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
            s3Uri: storageUri,
            documentHash,
            medicalRecordId: savedRecord.id,
            savedRecord,
        };
    }

    /**
     * Generates a temporary S3 presigned URL for downloading the encrypted file.
     *
     * @param recordId UUID of the {@link MedicalRecord}.
     * @param userId UUID of the user requesting the download (for auditing).
     * @returns Presigned URL string.
     */
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
            // No real presigned URL for local storage, return the backend download URL
            return `/api/medical-records/${recordId}/download`;
        }

        if (!this.s3Client) {
            throw new Error('S3 client not initialized but storage type is s3');
        }

        // Parse key from s3Uri (s3://bucket/key)
        const objectKey = s3Uri.replace(`s3://${this.bucketName}/`, '');

        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: objectKey,
        });

        // Generate URL valid for 5 minutes
        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });

        // Audit the access
        void this.auditService.log({
            eventType: AuditEventType.RECORD_DOWNLOADED,
            actorId: userId,
            targetResource: recordId,
            additionalData: { s3Uri: record.s3Uri },
        });

        return url;
    }

    /**
     * Fetches an encrypted blob from S3 or local storage and decrypts it.
     *
     * @param recordId UUID of the {@link MedicalRecord}.
     * @returns Deciphered buffer, original filename, and mime type.
     */
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
            this.logger.log(`Reading encrypted file from local storage: ${fullPath}`);

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

        // 2. Unseal the envelope-encrypted AES key
        const aesKey = this.cryptoService.unseal(record.encryptedAesKey);

        // 3. Decrypt the blob
        // encryptedPayload = [iv(12bytes)][authTag(16bytes)][ciphertext(...)]
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

    /** Returns the SHA-256 hex digest of the given buffer. */
    private hashFile(buffer: Buffer): string {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
}
