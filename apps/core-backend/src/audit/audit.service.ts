import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { BlockchainConnectorService } from '../blockchain/blockchain-connector.service';

/** Well-known audit event types for medical records. */
export enum AuditEventType {
  RECORD_UPLOADED = 'RECORD_UPLOADED',
  RECORD_UPDATED = 'RECORD_UPDATED',
  RECORD_DELETED = 'RECORD_DELETED',
  RECORD_DOWNLOADED = 'RECORD_DOWNLOADED',
  RECORD_LISTED = 'RECORD_LISTED',
  RECORD_ACCESS_DENIED = 'RECORD_ACCESS_DENIED',
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED = 'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  CONSENT_ACCESS_REQUESTED = 'CONSENT_ACCESS_REQUESTED',
  CONSENT_ACCESS_ACCEPTED = 'CONSENT_ACCESS_ACCEPTED',
  CONSENT_ACCESS_REJECTED = 'CONSENT_ACCESS_REJECTED',
}

export interface AuditEvent {
  eventType: AuditEventType;
  /** Internal user identifier (AuthUser.id UUID). */
  actorId: string;
  /** The patient whose data this event relates to. */
  patientId?: string;
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
    private readonly blockchainConnector: BlockchainConnectorService,
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
      entry.patientId = event.patientId;
      entry.targetResource = event.targetResource;
      entry.ipAddress = event.ipAddress;
      entry.timestamp = new Date();
      entry.additionalData = event.additionalData ?? null;
      await this.auditLogRepo.save(entry);
      this.logger.debug(
        `Audit: ${event.eventType} by ${event.actorId} on ${event.targetResource ?? 'N/A'}`,
      );

      this.blockchainConnector
        .logAuditEvent({
          auditId: entry.id,
          eventType: entry.eventType,
          actorId: entry.actorDid,
          patientId: entry.patientId,
          targetResource: entry.targetResource,
          ipAddress: entry.ipAddress,
          additionalData: entry.additionalData
            ? JSON.stringify(entry.additionalData)
            : undefined,
        })
        .catch((err) => {
          this.logger.error(
            'Failed to push audit log to Blockchain Gateway',
            err,
          );
        });
    } catch (err) {
      this.logger.error('Failed to persist audit log', err);
    }
  }
}
