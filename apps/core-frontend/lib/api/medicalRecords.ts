import axios from 'axios';

export const MedicalRecordsApi = {


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