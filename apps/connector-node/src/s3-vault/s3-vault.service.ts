import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3VaultService {
    private readonly logger = new Logger(S3VaultService.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        const endpoint = this.configService.get<string>('S3_ENDPOINT');
        const region = this.configService.get<string>('S3_REGION', 'us-east-1');
        const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID', '');
        const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY', '');
        const forcePathStyle = this.configService.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true';

        this.bucketName = this.configService.get<string>('S3_BUCKET_NAME', 'trustmed-vault');

        this.s3Client = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            forcePathStyle,
        });

        this.logger.log(`S3VaultService initialized — endpoint: ${endpoint}, bucket: ${this.bucketName}`);
    }

    /**
     * Encrypts the given file buffer using AES-256-GCM and uploads it to the S3 bucket.
     *
     * @param fileBuffer - Raw file buffer to encrypt and upload
     * @param fileName  - Original file name (used as part of the object key)
     * @returns Object key in the bucket and the hex-encoded encryption key
     */
    async uploadEncryptedFile(
        fileBuffer: Buffer,
        fileName: string,
    ): Promise<{ objectKey: string; encryptionKey: string }> {
        // 1. Generate a random 256-bit key and 96-bit IV for AES-256-GCM
        const encryptionKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(12);

        // 2. Encrypt the file buffer
        const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
        const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
        const authTag = cipher.getAuthTag(); // 16 bytes

        // 3. Combine iv (12) + authTag (16) + ciphertext into one buffer
        //    This format allows the decryptor to extract iv & tag before decrypting.
        const encryptedPayload = Buffer.concat([iv, authTag, encrypted]);

        // 4. Build the object key
        const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const objectKey = `encrypted/${uuidv4()}-${sanitizedName}`;

        // 5. Upload to S3
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: objectKey,
            Body: encryptedPayload,
            ContentType: 'application/octet-stream',
            Metadata: {
                'x-trustmed-encryption': 'aes-256-gcm',
                'x-trustmed-original-name': sanitizedName,
            },
        });

        await this.s3Client.send(command);

        this.logger.log(`Uploaded encrypted file: ${objectKey} (${encryptedPayload.length} bytes)`);

        return {
            objectKey,
            encryptionKey: encryptionKey.toString('hex'),
        };
    }

    /**
     * Generates a temporary presigned URL for downloading an object from the S3 bucket.
     *
     * @param objectKey      - Key of the object in the bucket
     * @param expiresInSeconds - URL expiry in seconds (default 300 = 5 minutes)
     * @returns Presigned download URL
     */
    async generatePresignedDownloadUrl(
        objectKey: string,
        expiresInSeconds: number = 300,
    ): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: objectKey,
        });

        const url = await getSignedUrl(this.s3Client, command, {
            expiresIn: expiresInSeconds,
        });

        this.logger.log(`Generated presigned URL for ${objectKey} (expires in ${expiresInSeconds}s): ${url}`);

        return url;
    }
}
