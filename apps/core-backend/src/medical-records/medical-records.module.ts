import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { ConsentService } from './consent.service';
import { VaultClientModule } from '../vault-client/vault-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord, AuthUser]),
    VaultClientModule,
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, ConsentService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
