import { MedicalRecord, RecordCategory } from '@/types/medical-records';
import axios from 'axios';

export const MedicalRecordsApi = {
  getRecords: async (authuserId: string): Promise<MedicalRecord[]> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/medical-records/${authuserId}`,
      { withCredentials: true }
    );
    // The backend returns { records: MedicalRecord[] }
    return response.data.records as MedicalRecord[];
  },

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
    formData.append('personId', personId);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/medical-records`,
      formData,
      { withCredentials: true }
    );
    return response.data as MedicalRecord;
  },

  updateRecord: async (
    authuserId: string,
    recordId: string,
    updates: {
      category?: RecordCategory;
      notes?: string;
      doctorName?: string;
      hospitalName?: string;
      recordDate?: string;
    },
  ): Promise<MedicalRecord> => {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/medical-records/${authuserId}/${recordId}`,
      updates,
      { withCredentials: true }
    );
    return response.data as MedicalRecord;
  },

  deleteRecord: async (authuserId: string, recordId: string): Promise<void> => {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/medical-records/${authuserId}/${recordId}`,
      { withCredentials: true }
    );
  },

  getDownloadUrl: async (personId: string, recordId: string): Promise<string> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/medical-records/${recordId}/download`,
      {
        params: { personId },
        withCredentials: true,
      }
    );
    return response.data.url as string;
  },
};