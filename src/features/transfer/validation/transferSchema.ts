import { z } from 'zod';
import { Currencies } from '../../wallet/validation/walletShema';

export const TransferSchema = z.object({
  sourceWalletId: z.string().uuid("Invalid source wallet reference."),
  beneficiaryId: z.string().uuid("Please select a destination beneficiary."),
  sourceCurrency: z.enum(Currencies),
  destinationCurrency: z.enum(Currencies),
  // Use z.preprocess or standard number validation if input is handled by valueAsNumber
  amount: z.number({ message: "Amount is required" }).positive(),
});

// Use z.input for form fields where values can be empty/strings initially
export type TransferFormInput = z.input<typeof TransferSchema>;
// Use z.output (or z.infer) for the final validated payload
export type TransferFormData = z.output<typeof TransferSchema>;

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