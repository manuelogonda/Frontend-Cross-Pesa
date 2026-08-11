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

export const TransactionResponseSchema = z.object({
  id: z.string().uuid(),
  senderId: z.string().uuid(),
  sourceWalletId: z.string().uuid(),
  beneficiaryId: z.string().uuid().nullable().optional(),
  
  sourceCurrency: z.enum(Currencies),
  destinationCurrency: z.enum(Currencies),
  
  grossAmount: z.number(),
  netAmount: z.number(),
  markupFee: z.number(),
  routingFee: z.number(),
  totalFee: z.number(),
  amountReceived: z.number(),
  
  fxRateApplied: z.number(),       // Matches backend fxRateApplied
  usdNormalizationRate: z.number(),
  
  reference: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'FLAGGED']),
  createdAt: z.string(),
});

export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;