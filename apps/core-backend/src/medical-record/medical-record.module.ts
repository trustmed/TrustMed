import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Person } from '../entities/person.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { ConsentRequest } from '../entities/consent-request.entity';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordController } from './medical-record.controller';
import { ConsentService } from './consent.service';
import { ConsentRequestsController } from './consent-requests.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord, Person, AuthUser, ConsentRequest]),
    StorageModule,
  ],
  providers: [MedicalRecordService, ConsentService],
  controllers: [MedicalRecordController, ConsentRequestsController],
  exports: [MedicalRecordService],
})
export class MedicalRecordModule {}
