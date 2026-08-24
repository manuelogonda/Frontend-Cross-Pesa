import { apiClient } from "../../../lib/axios";
import type { AuthResponse, LoginFormData, RegisterFormData } from "../validation/authSchema";

/**
 * Thrown when the backend rejects a payload with per-field validation errors.
 * Carries the `validationErrors` map ({ password: "...", email: "...", ... })
 * so forms can render server-side messages inline next to each field.
 */
export class ApiFieldError extends Error {
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiFieldError';
    this.fieldErrors = fieldErrors;
  }
}

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
      const status = error?.response?.status;
      const body = error?.response?.data;

      // Backend 400 shape: { message: "Validation failed...", validationErrors: { password: "...", ... } }
      if (status === 400 && body?.validationErrors && typeof body.validationErrors === 'object') {
        console.error('[AuthService] Registration field errors:', body.validationErrors);
        throw new ApiFieldError(body.message || 'Validation failed.', body.validationErrors);
      }

      const errorMessage = body?.message || 'Registration failed.';
      console.error('[AuthService] Registration Error:', errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      console.log('[AuthService] Registration execution cycle completed.');
    }
  }
};