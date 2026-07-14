import { z } from 'zod';


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;

// Login Validation
export const loginSchema = z.object({
  email: z.email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Registration Validation (Matches Backend RegisterRequest DTO)
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.email().min(1, 'Email is required'),
  phoneNumber: z.string().min(8, 'Please enter a valid phone number'),
  password: z.string()
    .min(8, 'Password must be at least 5 characters long')
    .regex(passwordRegex, 'Password must contain uppercase, lowercase, number, and special character'),
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