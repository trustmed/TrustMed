import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MedicalHistoryService } from './medical-history.service';
import { AuditLog } from '../entities/audit-log.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
import { BlockchainConnectorService } from '../blockchain/blockchain-connector.service';
import { AuditEventType } from '../audit/audit.service';

describe('MedicalHistoryService', () => {
  let service: MedicalHistoryService;

  const mockAuditLogRepo = {
    find: jest.fn(),
  };

  const mockRecordRepo = {
    find: jest.fn(),
  };

  const mockBlockchain = {
    getAllAccessRequests: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalHistoryService,
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditLogRepo },
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: mockRecordRepo,
        },
        { provide: BlockchainConnectorService, useValue: mockBlockchain },
      ],
    }).compile();

    service = module.get<MedicalHistoryService>(MedicalHistoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty events when no audit logs exist', async () => {
    mockAuditLogRepo.find.mockResolvedValue([]);

    const result = await service.getHistory('person-1');

    expect(result.events).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  it('should map local audit logs to HistoryEventDto', async () => {
    const mockLog = {
      id: 'log-1',
      eventType: AuditEventType.RECORD_UPLOADED,
      actorId: 'person-1',
      targetResource: 'record-1',
      createdAt: new Date('2024-01-01'),
      additionalData: null,
    };

    mockAuditLogRepo.find.mockResolvedValue([mockLog]);
    mockRecordRepo.find.mockResolvedValue([
      { id: 'record-1', fileName: 'test.pdf', category: 'Lab Report' },
    ]);

    const result = await service.getHistory('person-1');

    expect(result.events).toHaveLength(1);
    expect(result.events[0].source).toBe('local');
    expect(result.events[0].eventType).toBe(AuditEventType.RECORD_UPLOADED);
    expect(result.events[0].fileName).toBe('test.pdf');
    expect(result.events[0].category).toBe('Lab Report');
  });

  it('should handle all expanded audit event types', async () => {
    const mockLogs = [
      AuditEventType.APPOINTMENT_CREATED,
      AuditEventType.PROFILE_UPDATED,
      AuditEventType.RECORD_DOWNLOADED,
    ].map((type, i) => ({
      id: `log-${i}`,
      eventType: type,
      actorId: 'person-1',
      targetResource: `res-${i}`,
      createdAt: new Date(Date.now() - i * 1000),
      additionalData: null,
    }));

    mockAuditLogRepo.find.mockResolvedValue(mockLogs);
    mockRecordRepo.find.mockResolvedValue([]);

    const result = await service.getHistory('person-1');
    expect(result.events).toHaveLength(3);
    expect(result.totalCount).toBe(3);
  });

  it('should gracefully handle blockchain failures', async () => {
    mockAuditLogRepo.find.mockResolvedValue([]);
    mockBlockchain.getAllAccessRequests.mockRejectedValue(new Error('fail'));

    const result = await service.getHistory('person-1');
    expect(result.events).toEqual([]);
    expect(result.totalCount).toBe(0);
  });
});
