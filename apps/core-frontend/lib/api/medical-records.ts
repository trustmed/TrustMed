import { MedicalRecord, RecordCategory } from '@/types/medical-records';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_URL = `${BASE_URL}/api`;

export const MedicalRecordsApi = {
  // GET /api/medical-records/:personId
  getRecords: async (personId: string): Promise<MedicalRecord[]> => {
    const response = await fetch(`${API_URL}/medical-records/${personId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch medical records');
    return response.json();
  },

  // POST /api/medical-records/:personId/upload  (multipart/form-data)
  uploadRecord: async (
    personId: string,
    file: File,
    category: RecordCategory,
    notes?: string,
    doctorName?: string,
    hospitalName?: string,
    recordDate?: string,
  ): Promise<MedicalRecord> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (notes) formData.append('notes', notes);
    if (doctorName) formData.append('doctorName', doctorName);
    if (hospitalName) formData.append('hospitalName', hospitalName);
    if (recordDate) formData.append('recordDate', recordDate);

    const response = await fetch(
      `${API_URL}/medical-records/${personId}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );
    if (!response.ok) throw new Error('Failed to upload medical record');
    return response.json();
  },

  // PATCH /api/medical-records/:personId/records/:id
  updateRecord: async (
    personId: string,
    id: string,
    updates: {
      category?: RecordCategory;
      notes?: string;
      doctorName?: string;
      hospitalName?: string;
      recordDate?: string;
    },
  ): Promise<MedicalRecord> => {
    const response = await fetch(
      `${API_URL}/medical-records/${personId}/records/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      },
    );
    if (!response.ok) throw new Error('Failed to update medical record');
    return response.json();
  },

  // DELETE /api/medical-records/:personId/records/:id
  deleteRecord: async (personId: string, id: string): Promise<void> => {
    const response = await fetch(
      `${API_URL}/medical-records/${personId}/records/${id}`,
      { method: 'DELETE' },
    );
    if (!response.ok) throw new Error('Failed to delete medical record');
  },

  // GET /api/medical-records/:personId/records/:id/url
  getDownloadUrl: async (personId: string, id: string): Promise<string> => {
    const response = await fetch(
      `${API_URL}/medical-records/${personId}/records/${id}/url`,
      { method: 'GET' },
    );
    if (!response.ok) throw new Error('Failed to get download URL');
    const data = await response.json();
    return data.url;
  },
};