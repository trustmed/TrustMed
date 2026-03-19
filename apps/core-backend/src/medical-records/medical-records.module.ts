import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { ConsentService } from './consent.service';
import { CryptoService } from '../s3-vault/crypto.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, AuthUser])],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, ConsentService, CryptoService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
