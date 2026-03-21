import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { ConsentService } from './consent.service';
import { S3VaultModule } from '../s3-vault/s3-vault.module';
import { ConsentRequest } from '../entities/consent-request.entity';
import { ConsentRequestsController } from './consent-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, AuthUser, ConsentRequest]), S3VaultModule],
  controllers: [MedicalRecordsController, ConsentRequestsController],
  providers: [MedicalRecordsService, ConsentService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
