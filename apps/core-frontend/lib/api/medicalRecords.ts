import { axiosInstance } from '@/config/api-config/axios';

export const MedicalRecordsApi = {
  /**
   * Downloads a medical record file directly from the backend.
   * The backend returns the decrypted binary buffer, so we fetch it
   * as an arraybuffer and trigger a browser download.
   */
  downloadRecord: async (recordId: string): Promise<void> => {
    const response = await axiosInstance.get(
      `/api/medical-records/${recordId}/download`,
      {
        responseType: 'arraybuffer',
      }
    );

    // Extract filename from Content-Disposition header
    const disposition = response.headers['content-disposition'] || '';
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const fileName = filenameMatch?.[1]?.replace(/['"]/g, '') || 'download';

    // Get the MIME type from the response
    const mimeType = response.headers['content-type'] || 'application/octet-stream';

    // Create a blob and trigger download
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};