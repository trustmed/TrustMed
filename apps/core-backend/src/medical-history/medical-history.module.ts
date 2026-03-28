import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { MedicalHistoryController } from './medical-history.controller';
import { MedicalHistoryService } from './medical-history.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuditLog, MedicalRecord]),
        BlockchainModule,
    ],
    controllers: [MedicalHistoryController],
    providers: [MedicalHistoryService],
})
export class MedicalHistoryModule { }
