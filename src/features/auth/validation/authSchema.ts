import { z } from 'zod';

// Login Validation
export const loginSchema = z.object({
  email: z.email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Registration Validation (Matches Backend RegisterRequest DTO)
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email().min(1, 'Email is required'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(5, 'Password must be at least 8 characters long'),
});

// Export inferred TypeScript types for React Hook Form
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Backend Response Interface
export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  role: string;
}