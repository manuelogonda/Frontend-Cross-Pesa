import { z } from 'zod';

export const currencies = ['KES', 'USD', 'CNY', 'JPY', 'GBP', 'CAD', 'AUD', 'PKR', 'AED', 'SAR', 'EUR', 'SEK'] as const;
export const walletStatuses = ['ACTIVE', 'FROZEN', 'SUSPENDED'] as const;

export const walletSchema = z.object({
  id: z.uuid(),
  currency: z.enum(currencies),
  balance: z.coerce.number(),
  lockedBalance: z.coerce.number(),
  availableBalance: z.coerce.number(),
  status: z.enum(walletStatuses),
});

export type Wallet = z.infer<typeof walletSchema>;

