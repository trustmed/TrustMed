import { axiosInstance } from './axios';

// Kept as a hook-like API for compatibility with existing imports.
// Auth now relies on backend-issued HttpOnly cookie.
export function useAxios() {
  return axiosInstance;
}
