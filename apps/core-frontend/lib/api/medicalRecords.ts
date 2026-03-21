import { MedicalRecord, RecordCategory } from '@/types/medical-records';

// DUMMY DATA — replace with real API calls when backend is ready
const DUMMY_RECORDS: MedicalRecord[] = [
  {
    id: '1',
    fileName: 'Prescription1.png',
    fileUrl: '#',
    fileType: 'image/png',
    fileSize: 634000,
    category: RecordCategory.PRESCRIPTION,
    notes: 'test 1',
    doctorName: 'Dr. Malik Perera',
    hospitalName: 'City General Hospital',
    recordDate: '2026-03-15',
    personId: 'dummy-person-1',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: '2',
    fileName: 'P1.jpeg',
    fileUrl: '#',
    fileType: 'image/jpeg',
    fileSize: 21000,
    category: RecordCategory.DISCHARGE_SUMMARY,
    notes: 'test 2',
    doctorName: 'Dr. Nirosha Fernando',
    hospitalName: 'Lanka Private Hospital',
    recordDate: '2026-03-15',
    personId: 'dummy-person-1',
    createdAt: '2026-03-15T11:00:00Z',
    updatedAt: '2026-03-15T11:00:00Z',
  },
];

let mockRecords = [...DUMMY_RECORDS];

export const MedicalRecordsApi = {
  getRecords: async (_personId: string): Promise<MedicalRecord[]> => {
    await new Promise((r) => setTimeout(r, 500));
    return mockRecords;
  },

  uploadRecord: async (
    _personId: string,
    file: File,
    category: RecordCategory,
    notes?: string,
    doctorName?: string,
    hospitalName?: string,
    recordDate?: string,
  ): Promise<MedicalRecord> => {
    await new Promise((r) => setTimeout(r, 800));
    const newRecord: MedicalRecord = {
      id: `${Date.now()}`,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      fileSize: file.size,
      category,
      notes,
      doctorName,
      hospitalName,
      recordDate,
      personId: 'dummy-person-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRecords = [newRecord, ...mockRecords];
    return newRecord;
  },

  updateRecord: async (
    _personId: string,
    id: string,
    updates: {
      category?: RecordCategory;
      notes?: string;
      doctorName?: string;
      hospitalName?: string;
      recordDate?: string;
    },
  ): Promise<MedicalRecord> => {
    await new Promise((r) => setTimeout(r, 600));
    const idx = mockRecords.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Record not found');
    mockRecords[idx] = { ...mockRecords[idx], ...updates, updatedAt: new Date().toISOString() };
    return mockRecords[idx];
  },

  deleteRecord: async (_personId: string, id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 500));
    mockRecords = mockRecords.filter((r) => r.id !== id);
  },

  getDownloadUrl: async (_personId: string, _id: string): Promise<string> => {
    await new Promise((r) => setTimeout(r, 300));
    return '#';
  },
};