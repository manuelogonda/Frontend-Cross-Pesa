import { z } from 'zod';

// Exact matches to Java Enums
export const BENEFICIARY_TYPES = ['INDIVIDUAL', 'ORGANIZATION', 'BUSINESS'] as const;
export const PAYOUT_METHODS = ['BANK_TRANSFER', 'MOBILE_MONEY', 'CARD_PAYMENT'] as const;
export const PAYOUT_PROVIDERS = ['MPESA', 'EQUITY_BANK', 'VISA', 'MASTERCARD', 'PAYSTACK'] as const;
export const CURRENCIES = ['KES', 'USD', 'CNY', 'JPY', 'GBP', 'CAD', 'AUD', 'PKR', 'AED', 'SAR', 'EUR', 'SEK'] as const;

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
  beneficiaryType: z.enum(BENEFICIARY_TYPES, "Please select a valid beneficiary type"),
  
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
  payoutMethod: z.enum(PAYOUT_METHODS, "Please select a valid payout method"),
  
  // @NotNull
  payoutProvider: z.enum(PAYOUT_PROVIDERS, "Payout provider is required"),

  // NEW (Paystack): network code (MPESA/AIRTEL) for mobile money, or the
  // numeric nuban bank code for bank transfers — routes the payout dispatch.
  bankCode: z.string()
    .min(1, "Bank or network code is required")
    .max(20, "Bank code cannot exceed 20 characters"),
  
  // @NotBlank, @Size(max = 50)
  accountNumber: z.string()
    .min(1, "Account number is required")
    .max(50, "Account number cannot exceed 50 characters"),
    
  // @NotNull mapped to Currency enum
  accountCurrency: z.enum(CURRENCIES, "Please select a valid currency")
});

export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;

// ── Response DTO contract (what GET /beneficiaries actually returns) ──────
// Deliberately separate from the form schema above: input validation carries
// user-facing error messages & constraints; the response contract only needs
// to guarantee shape safety for rendering and transfer binding.
export const BeneficiaryResponseSchema = z.object({
  // Persisted entity returned by the API — always present, never null.
  // (Nullable here leaked `null` into every <option value={b.id}> consumer.)
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  beneficiaryType: z.enum(BENEFICIARY_TYPES),
  email: z.string(),
  phoneNumber: z.string(),
  countryCode: z.string(),
  city: z.string().nullable().optional(),
  payoutMethod: z.enum(PAYOUT_METHODS),
  // Backend adds providers (e.g. PAYSTACK) faster than we release builds.
  // READS stay tolerant (any string renders fine via formatEnumString);
  // WRITES stay strict through the form-level PAYOUT_PROVIDERS enum above.
  payoutProvider: z.string(),
  // Legacy rows predate bank_code — they parse fine but fail at payout
  // dispatch; the UI flags them for re-save.
  bankCode: z.string().max(20).nullable().optional(),
  accountNumber: z.string(),
  accountCurrency: z.enum(CURRENCIES),
});

// Canonical Beneficiary type — supersedes the loose interface that used to
// live in features/transfer/types/finance.ts
export type Beneficiary = z.infer<typeof BeneficiaryResponseSchema>;