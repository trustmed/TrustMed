import { Injectable, Inject, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../storage/storage.interface';
import { CryptoService } from '../crypto/crypto.service';

export interface VaultUploadResult {
  objectKey: string;
  s3Uri: string;
  documentHash: string;
  sealedAesKey: string;
}

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly cryptoService: CryptoService,
  ) { }

  async uploadEncryptedFile(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<VaultUploadResult> {
    const documentHash = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

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

    const s3Uri = await this.storage.upload(
      objectKey,
      encryptedPayload,
      'application/octet-stream',
      {
        'x-trustmed-encryption': 'aes-256-gcm',
        'x-trustmed-original-name': sanitizedName,
      },
    );

    this.logger.log(`Uploaded encrypted file to vault: ${objectKey}`);

    const sealedAesKey = this.cryptoService.seal(encryptionKey);

    return {
      objectKey,
      s3Uri,
      documentHash,
      sealedAesKey,
    };
  }

  async downloadAndDecryptFile(
    objectKey: string,
    sealedAesKey: string,
  ): Promise<Buffer> {
    const aesKey = this.cryptoService.unseal(sealedAesKey);

    const encryptedPayload = await this.storage.download(objectKey);

    const iv = encryptedPayload.subarray(0, 12);
    const authTag = encryptedPayload.subarray(12, 28);
    const ciphertext = encryptedPayload.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    this.logger.log(`Decrypted file from vault: ${objectKey}`);
    return decrypted;
  }

  async deleteFile(objectKey: string): Promise<void> {
    await this.storage.delete(objectKey);
    this.logger.log(`File deleted from vault: ${objectKey}`);
  }
}
