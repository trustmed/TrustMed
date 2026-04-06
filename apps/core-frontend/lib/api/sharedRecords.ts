const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${BASE_URL}/api`;

export interface SharedRecordItem {
  id: number;
  recipient: string;
  date: string;
  status: "active" | "expired" | "deactive";
}

export interface ShareMedicalRecordItem {
  id: number;
  patientName: string;
  recordType: string;
  date: string;
  doctor: string;
}

export interface SharedRecordsResponse {
  sharedRecords: SharedRecordItem[];
  medicalRecords: ShareMedicalRecordItem[];
}

export const SharedRecordsApi = {
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
};
