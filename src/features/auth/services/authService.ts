import { apiClient } from "../../../lib/axios";
import {
  passwordConfirmationSchema,
  type AuthResponse,
  type LoginFormData,
  type PasswordConfirmationFormData,
  type RegisterFormData,
} from "../validation/authSchema";
import { StepUpVerifyResponseSchema, type StepUpVerifyResponse } from "../../admin/validation/adminSchema";

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
      // 2. Catch and format the error — surfaced to the UI via the thrown Error;
      //    never log raw credentials or response bodies (PII).
      const errorMessage = error.response?.data?.message || 'Failed to securely log in.';
      throw new Error(errorMessage);
      
    } finally {
      // 3. Hook point for analytics/telemetry regardless of success/failure
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
        throw new ApiFieldError(body.message || 'Validation failed.', body.validationErrors);
      }

      const errorMessage = body?.message || 'Registration failed.';
      throw new Error(errorMessage);
      
    } finally {
      // Hook point for analytics/telemetry regardless of success/failure
    }
  },

  confirmPassword: async (payload: PasswordConfirmationFormData): Promise<StepUpVerifyResponse> => {
    const parsedPayload = passwordConfirmationSchema.parse(payload);
    const { data } = await apiClient.post('/auth/password-confirmation', parsedPayload);
    return StepUpVerifyResponseSchema.parse(data);
  }
};
