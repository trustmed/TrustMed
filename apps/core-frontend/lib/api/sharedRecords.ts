const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${BASE_URL}/api`;

function extractFileNameFromDisposition(disposition: string): string {
  const filenameMatch = disposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
  );
  return filenameMatch?.[1]?.replace(/['"]/g, '') || 'download';
}

function triggerBrowserDownload(
  buffer: ArrayBuffer,
  mimeType: string,
  fileName: string,
): void {
  const blob = new Blob([buffer], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export interface SharedRecordItem {
  id: string;
  recipient: string;
  date: string;
  status: "active" | "expired" | "deactivated";
}

export interface ShareMedicalRecordItem {
  id: string;
  patientName: string;
  recordType: string;
  date: string;
  doctor: string;
}

export interface SharedLinkMedicalRecordItem {
  id: string;
  fileOriginalName: string;
  recordType: string;
  date: string;
}

export interface SharedLinkWithMedicalRecords {
  id: string;
  recipient: string;
  date: string;
  status: "active" | "expired" | "deactivated";
  medicalRecords: SharedLinkMedicalRecordItem[];
}

export interface SendSharedRecordsPayload {
  recipientName: string;
  medicalRecordIds: string[];
}

export interface SendSharedRecordsResponse {
  success: true;
  message: string;
}

export interface SharedRecordsResponse {
  sharedRecords: SharedRecordItem[];
  medicalRecords: ShareMedicalRecordItem[];
}

export interface SharedLinkMedicalRecordsResponse {
  sharedRecord: SharedLinkWithMedicalRecords;
}

export interface AddRecordsToSharedLinkPayload {
  medicalRecordIds: string[];
}

export interface AddRecordsToSharedLinkResponse {
  success: true;
  message: string;
}

export interface DeleteRecordFromSharedLinkResponse {
  success: true;
  message: string;
}

export interface DeleteSharedLinkResponse {
  success: true;
  message: string;
}

export const SharedRecordsApi = {
  sendSharedRecords: async (
    payload: SendSharedRecordsPayload,
  ): Promise<SendSharedRecordsResponse> => {
    const response = await fetch(`${API_URL}/shared-records/send-link`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to send shared records");
    }

    return response.json();
  },

  getMySharedRecords: async (): Promise<SharedRecordsResponse> => {
    const response = await fetch(`${API_URL}/shared-records/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch shared records");
    }

    return response.json();
  },

  getSharedLinkRecords: async (
    sharedLinkId: string,
  ): Promise<SharedLinkMedicalRecordsResponse> => {
    const response = await fetch(`${API_URL}/shared-records/${sharedLinkId}/records`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch shared link records");
    }

    return response.json();
  },

  deleteSharedLink: async (
    sharedLinkId: string,
  ): Promise<DeleteSharedLinkResponse> => {
    const response = await fetch(`${API_URL}/shared-records/${sharedLinkId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete shared link");
    }

    return response.json();
  },

  getPublicSharedLinkRecords: async (
    sharedLinkId: string,
  ): Promise<SharedLinkMedicalRecordsResponse> => {
    const response = await fetch(
      `${API_URL}/shared-records/public/${sharedLinkId}/records`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch shared link records');
    }

    return response.json();
  },

  getPublicRecordViewUrl: (sharedLinkId: string, recordId: string): string =>
    `${API_URL}/shared-records/public/${sharedLinkId}/records/${recordId}/view`,

  downloadPublicSharedRecord: async (
    sharedLinkId: string,
    recordId: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_URL}/shared-records/public/${sharedLinkId}/records/${recordId}/download`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to download shared record');
    }

    const disposition = response.headers.get('content-disposition') || '';
    const fileName = extractFileNameFromDisposition(disposition);
    const mimeType =
      response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    triggerBrowserDownload(buffer, mimeType, fileName);
  },

  downloadAllPublicSharedRecords: async (
    sharedLinkId: string,
    records: SharedLinkMedicalRecordItem[],
  ): Promise<void> => {
    for (const record of records) {
      await SharedRecordsApi.downloadPublicSharedRecord(sharedLinkId, record.id);
    }
  },

  addRecordsToSharedLink: async (
    sharedLinkId: string,
    payload: AddRecordsToSharedLinkPayload,
  ): Promise<AddRecordsToSharedLinkResponse> => {
    const response = await fetch(
      `${API_URL}/shared-records/${sharedLinkId}/records/add`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to add records to shared link');
    }

    return response.json();
  },

  deleteRecordFromSharedLink: async (
    sharedLinkId: string,
    recordId: string,
  ): Promise<DeleteRecordFromSharedLinkResponse> => {
    const response = await fetch(
      `${API_URL}/shared-records/${sharedLinkId}/records/${recordId}`,
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to delete record from shared link');
    }

    return response.json();
  },
};
