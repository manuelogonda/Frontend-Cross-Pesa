import { z } from 'zod';

export const ledgerEntrySchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid().nullable().optional(),
  walletId: z.string().uuid().nullable().optional(),
  entryClass: z.string(),
  debit: z.number(),
  credit: z.number(),
  amount: z.number(),
  balanceAfter: z.number().nullable().optional().transform((val) => val ?? 0),
  currency: z.string(),
  description: z.string(),
  createdAt: z.string(),
});

// Spring Boot / PagedModel nested format
export const ledgerStatementResponseSchema = z.object({
  content: z.array(ledgerEntrySchema),
  page: z.object({
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    number: z.number(),
  }).optional(),
  // Fallback for flat pagination structures if configured differently
  totalPages: z.number().optional(),
  totalElements: z.number().optional(),
  size: z.number().optional(),
  number: z.number().optional(),
}).transform((val) => ({
  content: val.content,
  totalPages: val.page?.totalPages ?? val.totalPages ?? 1,
  totalElements: val.page?.totalElements ?? val.totalElements ?? val.content.length,
  size: val.page?.size ?? val.size ?? 10,
  number: val.page?.number ?? val.number ?? 0,
}));

export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;
export type LedgerStatementResponse = z.infer<typeof ledgerStatementResponseSchema>;

export const LedgerEntryResponseSchema = ledgerEntrySchema;
export const PaginatedLedgerResponseSchema = ledgerStatementResponseSchema;

export type LedgerEntryResponse = LedgerEntry;
export type PaginatedLedgerResponse = LedgerStatementResponse;

export type LedgerDirection = 'DEBIT' | 'CREDIT' | 'NEUTRAL';

export interface FormattedLedgerEntry extends LedgerEntryResponse {
  direction: LedgerDirection;
  formattedAmount: string;
  formattedBalance: string;
  badgeColor: string;
}