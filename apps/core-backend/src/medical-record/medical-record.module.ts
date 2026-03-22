import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Person } from '../entities/person.entity';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordController } from './medical-record.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Person])],
  providers: [MedicalRecordService],
  controllers: [MedicalRecordController],
})
export class MedicalRecordModule {}
