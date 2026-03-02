// services/axiosWithAuth.ts
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// Custom hook that returns a configured Axios instance
export function useAxios() {
  const { getToken } = useAuth();

  const axiosAuth = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor - Use jwt template token
  axiosAuth.interceptors.request.use(async (config) => {
    try {
      // Prioritize jwt template token
      const token = await getToken({ template: 'add_token_template_name' });
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get jwt token, trying default:', error);
      // Fallback to default token
      try {
        const fallbackToken = await getToken();
        if (fallbackToken) {
          config.headers.Authorization = `Bearer ${fallbackToken}`;
        }
      } catch (fallbackError) {
        console.error('Failed to get any token:', fallbackError);
      }
    }
    return config;
  });

  return axiosAuth;
}
