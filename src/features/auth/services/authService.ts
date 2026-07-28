import { apiClient } from "../../../lib/axios";
import type { AuthResponse, LoginFormData, RegisterFormData } from "../validation/authSchema";

export const authService = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    try {
      // 1. Attempt the network request
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
      
    } catch (error: any) {
      // 2. Catch and format the error
      const errorMessage = error.response?.data?.message || 'Failed to securely log in.';
      console.error('[AuthService] Login Error:', errorMessage);
      console.error('[AuthService] RAW ERROR DETAILS:', error.response?.status, error.response?.data || error.message);
      throw new Error(errorMessage);
      
    } finally {
      // 3. Execute cleanup or analytics regardless of success/failure
      console.log('[AuthService] Login execution cycle completed.');
    }
  },

  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed.';
      console.error('[AuthService] Registration Error:', errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      console.log('[AuthService] Registration execution cycle completed.');
    }
  }
};