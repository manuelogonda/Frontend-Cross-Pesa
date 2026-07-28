import { getLiveFxQuote } from "../api/ratesApi";
import { fxQuoteRequestSchema, fxQuoteResponseSchema, type FxQuoteResponse } from "../validation/ratesSchema";

export const fetchAndValidateQuote = async (
  source: string, 
  destination: string
): Promise<FxQuoteResponse> => {
  // 1. Validate and normalize query params before making the API request
  const validatedParams = fxQuoteRequestSchema.parse({
    sourceCurrency: source,
    destinationCurrency: destination,
  });

  // 2. Execute network request
  const rawData = await getLiveFxQuote(
    validatedParams.sourceCurrency, 
    validatedParams.destinationCurrency
  );
  
  // 3. Ensure backend payload strictly conforms to contract
  return fxQuoteResponseSchema.parse(rawData);
};