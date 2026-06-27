import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Create a configured instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // Matches your Spring Boot server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outgoing Request Interceptor: Attach the VIP Wristband (JWT)
apiClient.interceptors.request.use(
  (config) => {
    // Read directly from the Zustand store outside of a React component
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Incoming Response Interceptor: Handle global 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired. Clear state and redirect.
      useAuthStore.getState().logout();
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);