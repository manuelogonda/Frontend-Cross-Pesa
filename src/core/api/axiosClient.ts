import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outgoing Request Interceptor: Attach the bearer token dynamically
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token; //Pulls token directly from Zustand state
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Incoming Response Interceptor: Boot user if token expires
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout(); // Automatically clears memory and handles logouts
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;