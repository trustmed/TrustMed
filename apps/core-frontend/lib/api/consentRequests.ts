import axios from 'axios';

export interface ConsentRequest {
  id: string;
  requesterId: string;
  patientId: string;
  recordId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  expiresAt: string | null;
  createdAt?: string;
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  record?: {
    id: string;
    originalFileName?: string;
    fileName?: string;
    category?: string;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const ConsentRequestsApi = {
  getReceivedRequests: async (): Promise<ConsentRequest[]> => {
    const response = await axios.get(
      `${API_BASE}/api/consent-requests/me/received`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  acceptRequest: async (id: string, duration: string): Promise<ConsentRequest> => {
    const response = await axios.patch(
      `${API_BASE}/api/consent-requests/${id}/accept`,
      { duration },
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  rejectRequest: async (id: string): Promise<ConsentRequest> => {
    const response = await axios.patch(
      `${API_BASE}/api/consent-requests/${id}/reject`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  requestAccess: async (recordId: string): Promise<ConsentRequest> => {
    const response = await axios.post(
      `${API_BASE}/api/consent-requests/${recordId}`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  },
};
