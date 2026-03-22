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

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async create(
    dto: CreateMedicalRecordRequestDto,
  ): Promise<CreateMedicalRecordResponseDto> {
    console.log('Creating medical record with DTO:', dto);
    if (dto.file) {
      console.log('Received file:', {
        originalname: dto.file.originalname,
        mimetype: dto.file.mimetype,
        size: dto.file.size,
      });
    } else {
      console.log('No file received in DTO.');
    }
    const person = await this.personRepo.findOneByOrFail({
      authUserId: dto.personId,
    });
    // Map file properties to entity fields
    const file = dto.file;
    const record = this.recordRepo.create({
      person,
      patientId: person.id,
      uploaderId: person.authUserId,
      fileName: file?.originalname,
      fileType: file?.mimetype,
      fileSize: file?.size ? Number(file.size) : 0,
      // fileUrl should be set to the storage location; for now, set to empty or a placeholder
      fileUrl: '',
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
