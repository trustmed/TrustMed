import { Injectable } from '@nestjs/common';
import { SharedRecordsResponseDto } from './dto/shared-records-response.dto';

@Injectable()
export class SharedRecordsService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSharedRecordsForUser(_authUserId: string): SharedRecordsResponseDto {
    return {
      sharedRecords: [
        {
          id: 1,
          recipient: 'Dr. John Doe',
          date: '2026-03-20',
          status: 'active',
        },
        {
          id: 2,
          recipient: 'Dr. Jane Smith',
          date: '2026-02-15',
          status: 'expired',
        },
        {
          id: 3,
          recipient: 'Dr. Alice Brown',
          date: '2026-03-01',
          status: 'deactive',
        },
        {
          id: 4,
          recipient: 'Dr. Bob Lee',
          date: '2026-03-10',
          status: 'active',
        },
      ],
      medicalRecords: [
        {
          id: 1,
          patientName: 'John Doe',
          recordType: 'Lab Report',
          date: '2026-03-01',
          doctor: 'Dr. Smith',
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          recordType: 'Prescription',
          date: '2026-02-20',
          doctor: 'Dr. Brown',
        },
        {
          id: 3,
          patientName: 'Alice Brown',
          recordType: 'Imaging',
          date: '2026-01-15',
          doctor: 'Dr. Lee',
        },
        {
          id: 4,
          patientName: 'Bob Lee',
          recordType: 'Discharge Summary',
          date: '2025-12-10',
          doctor: 'Dr. Green',
        },
      ],
    };
  }
}
