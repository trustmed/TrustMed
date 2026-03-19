import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Handles **envelope encryption** of per-file AES keys.
 *
 * Each uploaded file is encrypted with a unique AES-256-GCM key.
 * Before persisting that key to PostgreSQL, we "seal" it by encrypting
 * it with a system-wide **master key** (also AES-256-GCM).
 *
 * Format of the sealed string: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 */
@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
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
    this.logger.log('CryptoService initialized with master encryption key');
  }

  /**
   * Encrypts a per-file AES key with the master key.
   *
   * @param plainKey Raw AES key buffer (32 bytes).
   * @returns Sealed string: `iv:authTag:ciphertext` (all hex-encoded).
   */
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

  /**
   * Decrypts a sealed per-file AES key back to its raw form.
   *
   * @param sealedKey String produced by {@link seal}.
   * @returns Raw AES key buffer (32 bytes).
   */
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
