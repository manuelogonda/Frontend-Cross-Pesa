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

// Matches the FxRateResponse Java DTO precisely
export const fxQuoteResponseSchema = z.object({
  sourceCurrency: z.string().length(3),
  destinationCurrency: z.string().length(3),
  // Use z.union([z.number(), z.string().transform(Number)]) to gracefully handle 
  // both JSON number or Jackson string-serialized BigDecimals
  exchangeRate: z.union([z.number(), z.string().transform(Number)]).refine((val) => val > 0, {
    message: "Exchange rate must be positive",
  }),
  expiresAt: z.string().datetime(), // Correct Zod syntax for ISO 8601 strings
});

export type FxQuoteRequest = z.infer<typeof fxQuoteRequestSchema>;
export type FxQuoteResponse = z.infer<typeof fxQuoteResponseSchema>;