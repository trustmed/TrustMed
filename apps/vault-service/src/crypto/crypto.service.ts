import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const masterKeyHex = this.configService.get<string>('MASTER_ENCRYPTION_KEY');
    if (!masterKeyHex) {
      throw new Error('MASTER_ENCRYPTION_KEY is required in .env');
    }

    this.masterKey = Buffer.from(masterKeyHex, 'hex');
    this.logger.log(`CryptoService initialized with master encryption key (length: ${this.masterKey.length} bytes)`);
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

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }
}
