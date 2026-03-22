import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MedicalRecord,
  RecordCategory,
} from '../entities/medical-record.entity';
import { Person } from '../entities/person.entity';
import { CreateMedicalRecordRequestDto } from './dto/create-medical-record-request.dto';
import { CreateMedicalRecordResponseDto } from './dto/create-medical-record-response.dto';
import { VaultClientService } from '../vault-client/vault-client.service';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    private readonly vaultClient: VaultClientService,
  ) {}

  async create(
    dto: CreateMedicalRecordRequestDto,
  ): Promise<CreateMedicalRecordResponseDto> {
    console.log('Creating medical record with DTO:', dto);

    if (!dto.file) {
      throw new Error('No file received in DTO.');
    }

    const person = await this.personRepo.findOneByOrFail({
      authUserId: dto.personId,
    });

    const vaultResult = await this.vaultClient.uploadFile(
      dto.file.buffer,
      dto.file.originalname,
      dto.file.mimetype,
      person.id,
      person.authUserId,
    );

    const record = this.recordRepo.create({
      person,
      patientId: person.id,
      uploaderId: person.authUserId,
      fileName: dto.file.originalname,
      fileType: dto.file.mimetype,
      fileSize: dto.file.size ? Number(dto.file.size) : 0,

      s3Uri: vaultResult.s3_uri,
      documentHash: vaultResult.document_hash,
      encryptedAesKey: vaultResult.encrypted_aes_key,
      fileUrl: vaultResult.s3_uri, // Compatibility field

      category: dto.category as RecordCategory,
      notes: dto.notes,
      doctorName: dto.doctorName,
      hospitalName: dto.hospitalName,
      recordDate: dto.recordDate ? new Date(dto.recordDate) : undefined,
    });

    const saved = await this.recordRepo.save(record);

    return {
      id: saved.id,
      personId: saved.person?.id || person.id,
      fileName: saved.fileName || '',
      fileUrl: saved.fileUrl || '',
      fileType: saved.fileType || '',
      fileSize: Number(saved.fileSize),
      category: saved.category,
      notes: saved.notes || undefined,
      doctorName: saved.doctorName || undefined,
      hospitalName: saved.hospitalName || undefined,
      recordDate: saved.recordDate?.toISOString(),
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
