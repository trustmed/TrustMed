import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditEventType } from '../audit/audit.service';
import { MedicalRecord } from '../entities/medical-record.entity';
import { BlockchainConnectorService } from '../blockchain/blockchain-connector.service';
import { HistoryEventDto, MedicalHistoryResponseDto } from './dto/history-event.dto';

@Injectable()
export class MedicalHistoryService {
    private readonly logger = new Logger(MedicalHistoryService.name);

    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepo: Repository<AuditLog>,
        @InjectRepository(MedicalRecord)
        private readonly recordRepo: Repository<MedicalRecord>,
        private readonly blockchainConnector: BlockchainConnectorService,
    ) { }

    async getHistory(
        personId: string,
        sort: 'asc' | 'desc' = 'desc',
    ): Promise<MedicalHistoryResponseDto> {
        // 1) Fetch local audit logs that belong to this person
        const logs = await this.auditLogRepo.find({
            where: {
                actorDid: personId,
                eventType: In([
                    AuditEventType.RECORD_UPLOADED,
                    AuditEventType.RECORD_UPDATED,
                    AuditEventType.RECORD_DELETED,
                    AuditEventType.RECORD_DOWNLOADED,
                    AuditEventType.RECORD_LISTED,
                    AuditEventType.RECORD_ACCESS_DENIED,
                    AuditEventType.APPOINTMENT_CREATED,
                    AuditEventType.APPOINTMENT_UPDATED,
                    AuditEventType.APPOINTMENT_CANCELLED,
                    AuditEventType.PROFILE_UPDATED,
                ]),
            },
            order: { timestamp: sort === 'asc' ? 'ASC' : 'DESC' },
        });

        // 2) Collect unique record IDs to resolve file metadata
        const recordIds = [
            ...new Set(
                logs
                    .filter(
                        (l) =>
                            l.targetResource &&
                            [
                                AuditEventType.RECORD_UPLOADED,
                                AuditEventType.RECORD_UPDATED,
                                AuditEventType.RECORD_DELETED,
                                AuditEventType.RECORD_DOWNLOADED,
                            ].includes(l.eventType as AuditEventType),
                    )
                    .map((l) => l.targetResource),
            ),
        ];

        let recordMap = new Map<string, MedicalRecord>();
        if (recordIds.length > 0) {
            try {
                const records = await this.recordRepo.find({
                    where: { id: In(recordIds) },
                    select: ['id', 'fileName', 'category'],
                });
                recordMap = new Map(records.map((r) => [r.id, r]));
            } catch {
                this.logger.warn('Could not resolve file metadata for audit logs');
            }
        }

        // 3) Map to DTOs
        const localEvents: HistoryEventDto[] = logs.map((log) => {
            const record = log.targetResource
                ? recordMap.get(log.targetResource)
                : undefined;
            return {
                id: log.id,
                source: 'local' as const,
                eventType: log.eventType,
                actorId: log.actorDid,
                targetResource: log.targetResource,
                fileName: record?.fileName,
                category: record?.category,
                timestamp: log.timestamp,
                description: this.describe(log.eventType, record?.fileName),
                additionalData: log.additionalData
                    ? (typeof log.additionalData === 'string'
                        ? JSON.parse(log.additionalData)
                        : log.additionalData)
                    : undefined,
            };
        });

        // 4) Fetch blockchain access-request events (non-blocking)
        let blockchainEvents: HistoryEventDto[] = [];
        try {
            const bcItems = await this.blockchainConnector.getAllAccessRequests(personId);
            blockchainEvents = (bcItems as any[]).map((item, index) => ({
                id: `bc-${personId}-${index}`,
                source: 'blockchain' as const,
                eventType: item.status || 'ACCESS_REQUEST',
                actorId: item.requesterId,
                targetResource: item.recordId,
                timestamp: new Date(item.createdAt || item.timestamp || Date.now()),
                description: `Blockchain access request: ${item.status || 'pending'}`,
                additionalData: item,
            }));
        } catch {
            this.logger.warn('Blockchain access requests unavailable');
        }

        // 5) Merge & sort
        const allEvents = [...localEvents, ...blockchainEvents].sort((a, b) => {
            const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            return sort === 'asc' ? diff : -diff;
        });

        return {
            events: allEvents,
            totalCount: allEvents.length,
        };
    }

    private describe(eventType: string, fileName?: string): string {
        const file = fileName ? ` "${fileName}"` : '';
        switch (eventType) {
            case AuditEventType.RECORD_UPLOADED:
                return `Uploaded medical record${file}`;
            case AuditEventType.RECORD_UPDATED:
                return `Updated medical record${file}`;
            case AuditEventType.RECORD_DELETED:
                return `Deleted medical record${file}`;
            case AuditEventType.RECORD_DOWNLOADED:
                return `Downloaded medical record${file}`;
            case AuditEventType.RECORD_LISTED:
                return 'Viewed medical records list';
            case AuditEventType.RECORD_ACCESS_DENIED:
                return `Access denied for record${file}`;
            case AuditEventType.APPOINTMENT_CREATED:
                return 'Created a new appointment';
            case AuditEventType.APPOINTMENT_UPDATED:
                return 'Updated an appointment';
            case AuditEventType.APPOINTMENT_CANCELLED:
                return 'Cancelled an appointment';
            case AuditEventType.PROFILE_UPDATED:
                return 'Updated profile information';
            default:
                return eventType;
        }
    }
}
