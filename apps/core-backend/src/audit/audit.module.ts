import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';

/**
 * Global module — any module can inject {@link AuditService}
 * without importing `AuditModule` explicitly.
 */
@Global()
@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule { }
