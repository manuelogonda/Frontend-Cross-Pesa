import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ||'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

    // If the error is 401, we haven't retried yet, and it's NOT the refresh endpoint failing
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      
      // If a refresh is already happening, queue this request
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
        logout();
        window.location.replace('/login');
        return Promise.reject(error);
      }

      try {
        // Use a pristine axios instance to avoid interceptor loops
        const response = await axios.post('http://localhost:8080/api/v1/auth/refresh-token', null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // 1. Update Zustand with the fresh tokens
        updateTokens(newAccessToken, newRefreshToken);

        // 2. Replay all queued requests with the new token
        processQueue(null, newAccessToken);

        // 3. Retry the original request that triggered the 401
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // If the refresh token is ALSO expired, nuke the session
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
        console.warn("API triggered a CORS error (likely an unwanted 302 redirect). Nuking session.");
        const { logout } = useAuthStore.getState();
        logout();
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);