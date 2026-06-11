import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { AuthStorage } from "../auth/authStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const FILE_BASE_URL =
  import.meta.env.VITE_FILE_URL || API_BASE_URL;

export const getFileUrl = (path?: string | null) => {
  if (!path) return "";
  const normalizedPath = path.replace(/\\/g, '/');
  if (normalizedPath.startsWith("http")) return normalizedPath;
  const basePath = FILE_BASE_URL.endsWith("/") ? FILE_BASE_URL.slice(0, -1) : FILE_BASE_URL;
  const filePath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  return `${basePath}${filePath}`;
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) =>
  refreshSubscribers.push(cb);

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = AuthStorage.getAccessToken();
  // const tenant_id = AuthStorage.getUser()?.tenant_id;
  // if (tenant_id) {
  //   config.headers["x-tenant-id"] = tenant_id;
  // }
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers?.["Content-Type"];
  }

  return config;
});

const refreshAuthToken = async (): Promise<string> => {
  const refreshToken = AuthStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh-token`,
    null,
    {
      headers: {
        "x-refresh-token": refreshToken,
      },
    }
  );

  const apiData = response.data?.responseObject ?? response.data;
  const newToken = apiData?.accessToken;
  if (!newToken) throw new Error("Failed to refresh token");

  AuthStorage.setAccessToken(newToken);
  AuthStorage.setRefreshToken(apiData?.refreshToken);
  if (apiData?.session_id) {
    AuthStorage.setSessionId(apiData?.session_id);
  }
  return newToken;
};

apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = originalRequest.url ?? "";

    //  Skip interceptor for auth APIs
    if (url.includes("/login") || url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) =>
          subscribeTokenRefresh((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          })
        );
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAuthToken();
        onRefreshed(newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        AuthStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
