import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { Person } from '../entities/person.entity';
import { EncryptionModule } from '../encryption/encryption.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord, AuthUser, Person]),
    EncryptionModule,
  ],
  controllers: [StorageController],
  providers: [StorageService, LocalStorageService, S3StorageService],
  exports: [StorageService, S3StorageService],
})
export class StorageModule {}
