import { z } from 'zod';
import { Currencies } from '../../wallet/validation/walletShema';

// ==========================================
// 1. TRANSFER REQUEST SCHEMA
// ==========================================
export const TransferSchema = z.object({
  sourceWalletId: z.string().uuid("Invalid source wallet reference."),
  beneficiaryId: z.string().uuid("Please select a destination beneficiary."),
  
  // Tied to our single source of truth for currencies
  sourceCurrency: z.enum(Currencies),
  destinationCurrency: z.enum(Currencies),
  
  amount: z.coerce
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a valid number",
    })
    .positive("Amount must be greater than zero"),
});

export type TransferFormData = z.infer<typeof TransferSchema>;

// ==========================================
// 2. TRANSACTION RESPONSE SCHEMA
// Maps to the backend DTO, hiding system revenue fields from the retail user
// ==========================================
export const TransactionResponseSchema = z.object({
  id: z.string().uuid(),
  reference: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'FLAGGED']),
  
  grossAmount: z.number(),      // What was deducted from sender
  amountReceived: z.number(),   // What the beneficiary gets
  
  sourceCurrency: z.enum(Currencies),
  destinationCurrency: z.enum(Currencies),
  
  exchangeRate: z.number(),
  createdAt: z.string(),
});

export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;