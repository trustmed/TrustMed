import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

/** Well-known audit event types for medical records. */
export enum AuditEventType {
  RECORD_UPLOADED = 'RECORD_UPLOADED',
  RECORD_DOWNLOADED = 'RECORD_DOWNLOADED',
  RECORD_LISTED = 'RECORD_LISTED',
  RECORD_ACCESS_DENIED = 'RECORD_ACCESS_DENIED',
}

export interface AuditEvent {
  eventType: AuditEventType;
  /** Internal user identifier (AuthUser.id UUID). */
  actorId: string;
  /** Description of the target (e.g. MedicalRecord UUID). */
  targetResource?: string;
  /** Client IP address. */
  ipAddress?: string;
  /** Any extra structured data. */
  additionalData?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  /**
   * Persists an audit event. Failures are logged but **never** propagated
   * — audit logging must not break business flows.
   */
  async log(event: AuditEvent): Promise<void> {
    try {
      const entry = new AuditLog();
      entry.eventType = event.eventType;
      entry.actorDid = event.actorId;
      entry.targetResource = event.targetResource ?? '';
      entry.ipAddress = event.ipAddress ?? '';
      entry.timestamp = new Date();
      entry.additionalData = event.additionalData ?? null;
      await this.auditLogRepo.save(entry);
      this.logger.debug(
        `Audit: ${event.eventType} by ${event.actorId} on ${event.targetResource ?? 'N/A'}`,
      );
    } catch (err) {
      this.logger.error('Failed to persist audit log', err);
    }
  }
}
