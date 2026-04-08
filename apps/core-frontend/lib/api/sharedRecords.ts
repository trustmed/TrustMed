const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${BASE_URL}/api`;

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
};
