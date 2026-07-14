import { z } from 'zod';

// Matches the required query params for the Spring Boot FX endpoint
export const fxQuoteRequestSchema = z.object({
  sourceCurrency: z.string().min(3).max(3),
  destinationCurrency: z.string().min(3).max(3),
});

// Matches the FxRateResponse DTO from Spring Boot
export const fxQuoteResponseSchema = z.object({
  quoteId: z.uuid(),
  sourceCurrency: z.string(),
  destinationCurrency: z.string(),
  exchangeRate: z.number().positive(),
  expiresAt: z.iso.datetime(),
});

export type FxQuoteRequest = z.infer<typeof fxQuoteRequestSchema>;
export type FxQuoteResponse = z.infer<typeof fxQuoteResponseSchema>;