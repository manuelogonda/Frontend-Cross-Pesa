import { z } from 'zod';
import { Currencies } from '../../wallet/validation/walletSchema';
import { StepUpActionSchema } from '../../admin/validation/adminSchema';

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
  // Mirrors backend password policy: 10–128 chars with at least one
  // uppercase, one lowercase, one digit, and one special character.
  // Chained individually so each rule surfaces its own precise inline error.
  password: z.string()
    .min(10, 'Password must be at least 10 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  // Optional: when provided, the backend auto-creates the user's retail
  // wallet in this currency immediately after registration.
  currency: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.enum(Currencies).optional()
  ),
});

export const passwordConfirmationSchema = z.object({
  action: StepUpActionSchema,
  context: z.string().min(1, 'Action context is required'),
  password: z.string().min(1, 'Password is required'),
});

// Export inferred TypeScript types for React Hook Form
export type LoginFormData = z.infer<typeof loginSchema>;
// Input type: pre-validation form values (currency may be '' from the select placeholder)
export type RegisterFormInput = z.input<typeof registerSchema>;
// Output type: post-validation values sent to the backend
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordConfirmationFormData = z.infer<typeof passwordConfirmationSchema>;

// Backend Response Interface
export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  role: string;
}
