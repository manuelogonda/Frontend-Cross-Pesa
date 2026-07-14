import { z } from 'zod';

// Exact matches to Java Enums
export const BENEFICIARY_TYPES = ['INDIVIDUAL', 'ORGANIZATION', 'BUSINESS'] as const;
export const PAYOUT_METHODS = ['BANK_TRANSFER', 'MOBILE_MONEY', 'CARD_PAYMENT'] as const;
export const PAYOUT_PROVIDERS = ['MPESA', 'EQUITY_BANK', 'VISA', 'MASTERCARD'] as const;
// Assuming standard currencies
export const CURRENCIES = ['KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS', 'RWF'] as const;

export const beneficiarySchema = z.object({
  id: z.string().uuid().optional(),
  
  // @NotBlank and @Size(max = 50)
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
    
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
    
  // @NotNull
  beneficiaryType: z.enum(BENEFICIARY_TYPES, {
    required_error: "Beneficiary type is required",
    invalid_type_error: "Please select a valid beneficiary type"
  }),
  
  // @NotBlank, @Email, @Size(max = 100)
  email: z.string()
    .min(1, "Email is required")
    .email("Provide a valid email address")
    .max(100, "Email cannot exceed 100 characters"),
    
  // @NotBlank, @Size(max = 20)
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .max(20, "Phone number cannot exceed 20 characters"),
    
  // @NotBlank, @Size(min = 2, max = 2)
  countryCode: z.string()
    .length(2, "Country code must be exactly 2 letters (e.g., KE)"),
    
  // @Size(max = 50) - Optional but constrained if present
  city: z.string()
    .max(50, "City cannot exceed 50 characters")
    .optional()
    .or(z.literal('')), // Allows empty string instead of undefined
    
  // @NotNull
  payoutMethod: z.enum(PAYOUT_METHODS, {
    required_error: "Payout method is required",
    invalid_type_error: "Please select a valid payout method"
  }),
  
  // @NotNull
  payoutProvider: z.enum(PAYOUT_PROVIDERS, {
    required_error: "Payout provider is required",
    invalid_type_error: "Please select a valid provider"
  }),
  
  // @NotBlank, @Size(max = 50)
  accountNumber: z.string()
    .min(1, "Account number is required")
    .max(50, "Account number cannot exceed 50 characters"),
    
  // @NotNull mapped to Currency enum
  accountCurrency: z.enum(CURRENCIES, {
    required_error: "Currency is required",
    invalid_type_error: "Please select a valid currency"
  })
});

export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;