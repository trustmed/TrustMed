import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { ConsentService } from './consent.service';
import { S3VaultModule } from '../s3-vault/s3-vault.module';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, AuthUser]), S3VaultModule],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, ConsentService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
