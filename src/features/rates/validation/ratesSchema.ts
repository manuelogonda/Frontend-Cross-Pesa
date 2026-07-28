import { z } from 'zod';

// Matches the required query params for the Spring Boot FX endpoint
export const fxQuoteRequestSchema = z.object({
  sourceCurrency: z.string()
    .length(3, "Currency code must be exactly 3 characters")
    .toUpperCase(),
  destinationCurrency: z.string()
    .length(3, "Currency code must be exactly 3 characters")
    .toUpperCase(),
});

// Matches the FxRateResponse DTO from Spring Boot
export const fxQuoteResponseSchema = z.object({
  quoteId: z.string().uuid(), // FIXED: Zod syntax is string().uuid()
  sourceCurrency: z.string().length(3),
  destinationCurrency: z.string().length(3),
  exchangeRate: z.number().positive(),
  expiresAt: z.iso.datetime(), // FIXED: Zod syntax for ISO 8601 strings
});

export type FxQuoteRequest = z.infer<typeof fxQuoteRequestSchema>;
export type FxQuoteResponse = z.infer<typeof fxQuoteResponseSchema>;