import { z } from 'zod';

// ==========================================
// 1. CENTRALIZED ENUMS
// Perfectly matches the PostgreSQL CHECK constraints
// ==========================================
export const Currencies = [
  'KES', 'USD', 'CNY', 'JPY', 'GBP', 'CAD', 
  'AUD', 'PKR', 'AED', 'SAR', 'EUR', 'SEK'
] as const;

export const WalletStatuses = ['ACTIVE', 'FROZEN', 'SUSPENDED'] as const;

// ==========================================
// 2. BASE WALLET SCHEMA (API Response)
// Matches WalletResponse.java DTO
// ==========================================
export const WalletSchema = z.object({
  id: z.string().uuid(),
  currency: z.enum(Currencies),
  // Note: We use strict .number() here instead of .coerce because 
  // axios automatically parses backend JSON numbers correctly.
  balance: z.number(),
  lockedBalance: z.number(),
  availableBalance: z.number(),
  status: z.enum(WalletStatuses),
});

// ==========================================
// 3. CREATE WALLET SCHEMA (Onboarding Form)
// ==========================================
export const CreateWalletSchema = z.object({
  currency: z.enum(Currencies, {
    errorMap: () => ({ message: "Please select a valid base currency" })
  })
});

// ==========================================
// 4. TOP-UP SCHEMA (Flutterwave Form)
// ==========================================
export const TopUpSchema = z.object({
  currency: z.enum(Currencies, {
    errorMap: () => ({ message: "Please select a valid currency" })
  }),
  // We keep .coerce.number() here because HTML <input type="number"> 
  // natively returns string values to React state.
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a valid number" })
    .positive({ message: "Amount must be greater than zero" })
    .min(1.00, { message: "Minimum top-up is 1.00" }) // Adjusted for realistic minimums
});

// ==========================================
// 5. EXPORTED TYPESCRIPT INTERFACES
// ==========================================
// 1. Define the Zod schema as a variable first
export const CurrencyEnumSchema = z.enum(Currencies);

// 2. Infer the type from the variable
export type Currency = z.infer<typeof CurrencyEnumSchema>;

export type Wallet = z.infer<typeof WalletSchema>;
export type CreateWalletFormData = z.infer<typeof CreateWalletSchema>;
export type TopUpFormData = z.infer<typeof TopUpSchema>;
