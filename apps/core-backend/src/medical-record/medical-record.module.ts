import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Person } from '../entities/person.entity';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordController } from './medical-record.controller';
import { VaultClientModule } from '../vault-client/vault-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord, Person]),
    VaultClientModule,
  ],
  providers: [MedicalRecordService],
  controllers: [MedicalRecordController],
})
export class MedicalRecordModule {}
