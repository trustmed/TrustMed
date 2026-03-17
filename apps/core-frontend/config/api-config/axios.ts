import axios from "axios";
import { getAuthToken } from "./authTokenStore";
import qs from "qs"; 
import { config } from "../config";

const axiosInstance = axios.create({
  baseURL: config.backendUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    serialize: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    }
  }
});

// Interceptors
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  console.log('📡 API Request:', config.method?.toUpperCase(), config.url);
  console.log('🔑 Token available:', token ? 'YES (' + token.substring(0, 20) + '...)' : 'NO');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Authorization header set');
  } else {
    console.log('❌ No token - Authorization header NOT set');
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // if (err.response?.status === 401) {
    //   console.warn("🔐 Session expired. Redirecting...");
    //   window.location.href = "/sign-in";
    // }
    return Promise.reject(err);
  }
);

export default async function orvalMutator<TData = unknown, TVariables = unknown>({
  url,
  method,
  data,
  headers,
  params,
  signal,
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: TVariables;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
}): Promise<TData> {
  const response = await axiosInstance.request<TData>({
    url,
    method,
    data: data,
    headers,
    params,
    signal,
  });

  return response.data;
}
