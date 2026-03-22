import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Person } from '../entities/person.entity';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordController } from './medical-record.controller';
import { S3VaultModule } from '../s3-vault/s3-vault.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord, Person]),
    S3VaultModule,
  ],
  providers: [MedicalRecordService],
  controllers: [MedicalRecordController],
})
export class MedicalRecordModule { }
