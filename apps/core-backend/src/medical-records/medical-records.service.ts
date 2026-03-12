import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { MedicalRecord } from '../entities/medical-record.entity';
import {
  UploadMedicalRecordDto,
  UpdateMedicalRecordDto,
} from './dto/medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  private s3: S3Client;
  private bucket: string;

  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
    private configService: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          '',
        ),
      },
    });
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', '');
  }

  // ── List all records for a patient ──────────────────────────────────────
  async getRecords(personId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordRepository.find({
      where: { personId },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Upload a new record ──────────────────────────────────────────────────
  async uploadRecord(
    personId: string,
    file: Express.Multer.File,
    dto: UploadMedicalRecordDto,
    uploadedBy: string,
  ): Promise<MedicalRecord> {
    if (!file) throw new BadRequestException('No file provided');

    const ext = file.originalname.split('.').pop();
    const s3Key = `medical-records/${personId}/${uuidv4()}.${ext}`;

    // Upload to S3
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256',
      }),
    );

    // Save metadata to DB
    const record = this.medicalRecordRepository.create({
      personId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      s3Key,
      category: dto.category,
      notes: dto.notes ?? null,
      uploadedBy,
    });

    return this.medicalRecordRepository.save(record);
  }

  // ── Update record metadata ───────────────────────────────────────────────
  async updateRecord(
    id: string,
    personId: string,
    dto: UpdateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    const record = await this.findOneOrFail(id, personId);
    Object.assign(record, dto);
    return this.medicalRecordRepository.save(record);
  }

  // ── Delete record ────────────────────────────────────────────────────────
  async deleteRecord(id: string, personId: string): Promise<void> {
    const record = await this.findOneOrFail(id, personId);

    // Remove from S3
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: record.s3Key,
      }),
    );

    // Soft-delete from DB (deletedAt is set by TypeORM via @DeleteDateColumn)
    await this.medicalRecordRepository.softDelete(id);
  }

  // ── Generate a pre-signed download URL (valid 15 min) ───────────────────
  async getDownloadUrl(id: string, personId: string): Promise<string> {
    const record = await this.findOneOrFail(id, personId);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: record.s3Key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 900 }); // 15 minutes
  }

  // ── Internal helper ──────────────────────────────────────────────────────
  private async findOneOrFail(
    id: string,
    personId: string,
  ): Promise<MedicalRecord> {
    const record = await this.medicalRecordRepository.findOne({
      where: { id, personId },
    });
    if (!record) throw new NotFoundException('Medical record not found');
    return record;
  }
}
