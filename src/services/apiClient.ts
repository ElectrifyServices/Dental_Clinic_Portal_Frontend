import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { AuthStorage } from "../auth/authStorage";
import { refreshModeHeaders } from "../auth/refreshCookieMode";

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
// Set while a user-initiated logout is in progress, so late 401s from in-flight
// queries don't trigger a hard redirect (page reload) to /login.
let loggingOut = false;
export const setLoggingOut = (value: boolean) => {
  loggingOut = value;
};
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
  // During sign-out, only the logout call itself may reach the API.
  if (loggingOut && !(config.url ?? "").includes("/auth/logout")) {
    return Promise.reject(new axios.CanceledError("Signing out"));
  }
  const token = AuthStorage.getAccessToken();
  const tenant_id = AuthStorage.getUser()?.tenant_id;
  if (tenant_id) {
    config.headers["x-tenant-id"] = tenant_id;
  }
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers?.["Content-Type"];
  }

  return config;
});

const refreshAuthToken = async (): Promise<string> => {
  // A token stored by the browser exists only for the old flow (or a session that started before
  // the HttpOnly cookie was switched on). With the cookie flow the browser sends it by itself.
  const storedRefreshToken = AuthStorage.getRefreshToken();
  const cookieFlow = Object.keys(refreshModeHeaders()).length > 0;
  if (!storedRefreshToken && !cookieFlow) throw new Error("No refresh token");

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh-token`,
    null,
    {
      withCredentials: true,
      headers: {
        ...refreshModeHeaders(),
        ...(storedRefreshToken ? { "x-refresh-token": storedRefreshToken } : {}),
      },
    }
  );

  // The server answers { responseObject: { data: { accessToken, ... } } }. This used to read
  // responseObject directly, found no token and sent the user to the login page, so in the browser a
  // refresh never succeeded and a session ended when the access token expired.
  const body = response.data;
  const apiData =
    body?.responseObject?.data ?? body?.responseObject ?? body;
  const newToken = apiData?.accessToken;
  if (!newToken) throw new Error("Failed to refresh token");

  AuthStorage.setAccessToken(newToken);
  if (apiData?.refreshToken) {
    // The server answered in the old way: keep the token as before
    AuthStorage.setRefreshToken(apiData.refreshToken);
  } else {
    // Cookie flow: the refresh token now lives only in the HttpOnly cookie, so drop any old copy
    AuthStorage.clearRefreshToken();
  }
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
    if (
      url.includes("/login") ||
      url.includes("/auth/login") ||
      url.includes("/verify-email") ||
      url.includes("/forgot-password") ||
      url.includes("/change-password") ||
      url.includes("/reset-password")
    ) {
      return Promise.reject(error);
    }

    // While signing out, late 401s from other requests are ignored. The logout call itself is the
    // exception: if the access token had already expired, refresh once and retry the logout, so the
    // server really ends the session and clears the refresh cookie (the browser cannot clear an
    // HttpOnly cookie by itself).
    const isLogoutCall = url.includes("/auth/logout");
    if (
      loggingOut &&
      (status === 401 || status === 403) &&
      !(isLogoutCall && !originalRequest._retry)
    ) {
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
        // During sign-out the logout flow clears everything itself, without a page reload
        if (loggingOut) return Promise.reject(error);
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
