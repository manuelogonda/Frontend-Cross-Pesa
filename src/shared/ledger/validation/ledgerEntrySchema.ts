import { z } from 'zod';

export const ledgerEntrySchema = z.object({
  id: z.uuid(),
  transactionId: z.uuid(),
  entryType: z.enum(['CREDIT', 'DEBIT']),
  currency: z.string().length(3),
  amount: z.number().positive(),
  balanceAfter: z.number(),
  description: z.string(),
  createdAt: z.iso.datetime(),
});

export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;


