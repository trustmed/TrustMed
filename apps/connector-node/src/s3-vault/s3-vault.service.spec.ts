import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3VaultService } from './s3-vault.service.js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock the AWS SDK modules
const mockSend = jest.fn().mockResolvedValue({});

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn(() => ({ send: mockSend })),
    PutObjectCommand: jest.fn((input: any) => input),
    GetObjectCommand: jest.fn((input: any) => input),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest
        .fn()
        .mockResolvedValue('https://presigned-url.example.com/test'),
}));

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid-1234'),
}));

const mockedGetSignedUrl = getSignedUrl as jest.MockedFunction<
    typeof getSignedUrl
>;

describe('S3VaultService', () => {
    let service: S3VaultService;

    const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
            const config: Record<string, string> = {
                S3_ENDPOINT: 'http://localhost:9000',
                S3_REGION: 'us-east-1',
                S3_ACCESS_KEY_ID: 'minioadmin',
                S3_SECRET_ACCESS_KEY: 'minioadmin',
                S3_BUCKET_NAME: 'trustmed-vault',
                S3_FORCE_PATH_STYLE: 'true',
            };
            return config[key] ?? defaultValue;
        }),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                S3VaultService,
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<S3VaultService>(S3VaultService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadEncryptedFile', () => {
        it('should encrypt a file and return objectKey and encryptionKey', async () => {
            const fileBuffer = Buffer.from('Hello TrustMed!');
            const fileName = 'test-report.pdf';

            const result = await service.uploadEncryptedFile(fileBuffer, fileName);

            // Should return an object key with the uuid prefix (with 'encrypted/' prefix)
            expect(result.objectKey).toBe(
                'encrypted/test-uuid-1234-test-report.pdf',
            );

            // Encryption key should be a 64-char hex string (32 bytes)
            expect(result.encryptionKey).toHaveLength(64);
            expect(result.encryptionKey).toMatch(/^[0-9a-f]{64}$/);

            // Should have called S3Client.send with the PutObjectCommand
            expect(mockSend).toHaveBeenCalledTimes(1);
        });

        it('should sanitize file names with special characters', async () => {
            const fileBuffer = Buffer.from('data');
            const fileName = 'my report (final) [v2].pdf';

            const result = await service.uploadEncryptedFile(fileBuffer, fileName);

            expect(result.objectKey).toBe(
                'encrypted/test-uuid-1234-my_report__final___v2_.pdf',
            );
        });
    });

    describe('generatePresignedDownloadUrl', () => {
        it('should return a presigned URL', async () => {
            const url = await service.generatePresignedDownloadUrl(
                'encrypted/test-uuid-1234-report.pdf',
            );

            expect(url).toBe('https://presigned-url.example.com/test');
        });

        it('should use default expiry of 300 seconds', async () => {
            await service.generatePresignedDownloadUrl('encrypted/test-key');

            expect(mockedGetSignedUrl).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    Bucket: 'trustmed-vault',
                    Key: 'encrypted/test-key',
                }),
                { expiresIn: 300 },
            );
        });

        it('should accept custom expiry', async () => {
            await service.generatePresignedDownloadUrl('encrypted/test-key', 600);

            expect(mockedGetSignedUrl).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                { expiresIn: 600 },
            );
        });
    });
});
