import axios from "axios";
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
  console.log('📡 API Request:', config.method?.toUpperCase(), config.url);
  // Cookies are sent automatically because withCredentials: true is set above
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = String(err?.config?.url ?? '');
    const isAuthRequest =
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/register') ||
      requestUrl.includes('/api/auth/logout');

    if (
      err.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !isAuthRequest
    ) {
      console.warn("🔐 Session expired. Redirecting to sign-in...");
      window.location.href = "/signin";
    }
    return Promise.reject(err);
  }
);

// Named export so auth utilities can share the same configured instance
export { axiosInstance };

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
  const isFormData = data instanceof FormData;
  const finalHeaders: Record<string, string | undefined> = { ...headers };

  if (isFormData) {
    // Must explicitly set multipart/form-data to override the axios instance
    // default Content-Type: application/json. Just deleting the header doesn't
    // override the instance default. Axios will auto-append the boundary.
    finalHeaders['Content-Type'] = 'multipart/form-data';
  }

  const response = await axiosInstance.request<TData>({
    url,
    method,
    data,
    headers: finalHeaders,
    params,
    signal,
  });

  return response.data;
}
