import { z } from 'zod';

export const currencies = ['KES', 'USD', 'CNY', 'JPY', 'GBP', 'CAD', 'AUD', 'PKR', 'AED', 'SAR', 'EUR', 'SEK'] as const;

export const topUpSchema = z.object({
  // Ensures the selected currency is one of the supported strings
  currency: z.enum(currencies, {
    errorMap: () => ({ message: "Please select a valid currency" })
  }),
  // Ensures the amount is a positive number and handles the input string conversion
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .positive({ message: "Amount must be greater than zero" })
    .min(0.01, { message: "Minimum top-up is 0.01" })
});

export type TopUpFormData = z.infer<typeof topUpSchema>;
