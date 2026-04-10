import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';

/**
 * Global module — any module can inject {@link AuditService}
 * without importing `AuditModule` explicitly.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), BlockchainModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
