import { z } from 'zod';

export const transferSchema = z.object({
  sourceWalletId: z.uuid("Please select a source wallet."),
  beneficiaryId: z.uuid("Please select a destination beneficiary."),
  sourceCurrency: z.string().length(3, "Currency code must be 3 characters."),
  destinationCurrency: z.string().length(3, "Currency code must be 3 characters."),
  amount: z.coerce
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than zero"),
});

export type TransferFormData = z.infer<typeof transferSchema>;

export const exchangeSchema = z.object({
  sourceWalletId: z.string().uuid("Please select a source wallet."),
  destinationWalletId: z.string().uuid("Please select a destination wallet."),
  sourceCurrency: z.string().length(3),
  destinationCurrency: z.string().length(3),
  amount: z.coerce
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than zero"),
}).refine((data) => data.sourceWalletId !== data.destinationWalletId, {
  // Industry standard validation: prevent exchanging USD to the SAME USD wallet
  message: "Source and destination wallets must be different.",
  path: ["destinationWalletId"], 
});

export type ExchangeFormData = z.infer<typeof exchangeSchema>;
