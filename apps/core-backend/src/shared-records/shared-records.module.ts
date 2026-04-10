import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedRecordsController } from './shared-records.controller';
import { SharedRecordsService } from './shared-records.service';
import { SharedLinkRecord } from '../entities/shared-link-record.entity';
import { SharedLinkMedicalRecord } from '../entities/shared-link-medical-record.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([
      SharedLinkRecord,
      SharedLinkMedicalRecord,
      MedicalRecord,
      AuthUser,
    ]),
  ],
  controllers: [SharedRecordsController],
  providers: [SharedRecordsService],
  exports: [SharedRecordsService],
})
export class SharedRecordsModule {}
