import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

/**
 * Global module — any module can inject {@link AuditService}
 * without importing `AuditModule` explicitly.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), BlockchainModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
