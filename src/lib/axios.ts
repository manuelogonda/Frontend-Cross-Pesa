import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Single source of truth for the API origin (also used by the refresh call below)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Path of the refresh endpoint, relative to API_BASE_URL.
const REFRESH_PATH = '/auth/refresh';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  role?: string;
  firstName?: string;
}

/**
 * Calls POST /api/v1/auth/refresh with the refresh token in the BODY
 * (per the backend contract — not an Authorization header).
 *
 * Uses a PRISTINE axios instance (no interceptors attached) so that:
 *  - the refresh response can never re-enter this file's 401 handler,
 *  - a failing refresh can never enqueue itself behind another refresh.
 */
const refreshTokens = async (refreshToken: string) =>
  axios.post<RefreshResponse>(
    `${API_BASE_URL}${REFRESH_PATH}`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );

// --- State for the Refresh Queue ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Request Interceptor ---
// Attaches the current access token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    // We use .getState() to access Zustand outside of a React component
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
// Catches 401s, handles the refresh logic, and replays requests
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Refresh only when ALL of these hold:
    //  1. the failure is a 401 from a protected endpoint,
    //  2. we have NOT already retried this request once (_retry guard => no infinite loops),
    //  3. the failing call is not /auth/refresh itself.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== REFRESH_PATH
    ) {

      // If a refresh is already in flight, park this request until it resolves
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Start the refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, updateTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        // No way to recover — drain the queue so parked requests reject
        // instead of hanging forever, then nuke the session.
        processQueue(error, null);
        logout();
        window.location.replace('/login');
        return Promise.reject(error);
      }

      try {
        const response = await refreshTokens(refreshToken);

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data ?? {};
        if (!newAccessToken || !newRefreshToken) {
          throw new Error('Malformed refresh response from server.');
        }

        // 1. Persist the fresh token pair (zustand persist -> localStorage)
        updateTokens(newAccessToken, newRefreshToken);

        // 2. Replay all queued requests with the new access token
        processQueue(null, newAccessToken);

        // 3. Retry the original request that triggered the 401
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed or returned 401 (invalid/expired refresh token):
        // drain queued requests as failures and log the user out.
        processQueue(refreshError, null);
        logout();
        window.location.replace('/login');
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
      
    }
   else if (error.message === 'Network Error' && !error.response) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        const { logout } = useAuthStore.getState();
        logout();
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);