import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MedicalRecord } from '../entities/medical-record.entity';
import {
  UploadMedicalRecordDto,
  UpdateMedicalRecordDto,
} from './dto/medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  private uploadDir = path.join(process.cwd(), 'public', 'uploads');

  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
  ) {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async getRecords(personId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordRepository.find({
      where: { personId },
      order: { createdAt: 'DESC' },
    });
  }

  async uploadRecord(
    personId: string,
    file: Express.Multer.File,
    dto: UploadMedicalRecordDto,
    uploadedBy: string,
  ): Promise<MedicalRecord> {
    if (!file) throw new BadRequestException('No file provided');

    const ext = file.originalname.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${ext}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    // Save file to local storage
    fs.writeFileSync(filePath, file.buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;

    const record = this.medicalRecordRepository.create({
      personId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      fileUrl,
      s3Key: null,
      category: dto.category,
      notes: dto.notes ?? null,
      doctorName: dto.doctorName ?? null,
      hospitalName: dto.hospitalName ?? null,
      recordDate: dto.recordDate ? new Date(dto.recordDate) : null,
      uploadedBy,
    });

    return this.medicalRecordRepository.save(record);
  }

  async updateRecord(
    id: string,
    personId: string,
    dto: UpdateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    const record = await this.findOneOrFail(id, personId);
    Object.assign(record, {
      ...dto,
      recordDate: dto.recordDate ? new Date(dto.recordDate) : record.recordDate,
    });
    return this.medicalRecordRepository.save(record);
  }

  async deleteRecord(id: string, personId: string): Promise<void> {
    const record = await this.findOneOrFail(id, personId);

    // Delete file from local storage if it exists
    if (record.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', record.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.medicalRecordRepository.softDelete(id);
  }

  async getDownloadUrl(id: string, personId: string): Promise<string> {
    const record = await this.findOneOrFail(id, personId);
    if (!record.fileUrl) throw new NotFoundException('File not found');
    return `http://localhost:4000${record.fileUrl}`;
  }

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