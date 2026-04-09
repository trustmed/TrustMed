import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { Encryption } from './encryption.interface';

@Injectable()
export class EncryptionService implements Encryption {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const masterKeyHex = this.configService.get<string>(
      'MASTER_ENCRYPTION_KEY',
    );

    if (!masterKeyHex || masterKeyHex.length !== 64) {
      throw new Error(
        'MASTER_ENCRYPTION_KEY must be a 64-character hex string (256 bits). ' +
          "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      );
    }

    this.masterKey = Buffer.from(masterKeyHex, 'hex');
    this.logger.log('EncryptionService initialized with master encryption key');
  }

  seal(plainKey: Buffer): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);

    const encrypted = Buffer.concat([cipher.update(plainKey), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted.toString('hex'),
    ].join(':');
  }

  unseal(sealedKey: string): Buffer {
    const [ivHex, authTagHex, ciphertextHex] = sealedKey.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.masterKey,
      iv,
    );
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }
}
