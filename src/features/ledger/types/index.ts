import { z } from 'zod';

export const LedgerEntryResponseSchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid().nullable(),
  walletId: z.string().uuid().nullable(),
  entryClass: z.string(), // E.g., 'PRINCIPAL_TRANSFER', 'MARKUP_FEE', 'ROUTING_FEE', 'FX_CLEARING', 'DEPOSIT'
  debit: z.number(),
  credit: z.number(),
  amount: z.number(),     // The net impact (credit - debit) calculated by PostgreSQL
  currency: z.string().length(3),
  balanceAfter: z.number(),
  description: z.string(),
  createdAt: z.string(),
});

export const PaginatedLedgerResponseSchema = z.object({
  content: z.array(LedgerEntryResponseSchema),
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  number: z.number(), // 0-indexed page number from Spring Data
});

export type LedgerEntryResponse = z.infer<typeof LedgerEntryResponseSchema>;
export type PaginatedLedgerResponse = z.infer<typeof PaginatedLedgerResponseSchema>;

// Helper UI Type to derive entry direction quickly for the table
export type LedgerDirection = 'DEBIT' | 'CREDIT' | 'NEUTRAL';

export interface FormattedLedgerEntry extends LedgerEntryResponse {
  direction: LedgerDirection;
  formattedAmount: string;
  formattedBalance: string;
  badgeColor: string; // E.g., 'bg-red-100 text-red-700' for Debits
}