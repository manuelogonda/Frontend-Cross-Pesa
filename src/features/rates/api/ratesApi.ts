import { apiClient } from "../../../lib/axios";
import { fxQuoteRequestSchema, fxQuoteResponseSchema, type FxQuoteResponse } from "../validation/ratesSchema";

/**
 * Makes the raw HTTP GET request to the Spring Boot FX Controller.
 */
export const getLiveFxQuote = async (source: string, destination: string): Promise<FxQuoteResponse> => {
  const { data } = await apiClient.get<FxQuoteResponse>(
    `/fx-rates/quote`, {
      params: {
        source,
        destination
      }
    }
  );
  return data;
};

/**
 * Validated wrapper combining request constraints, network call, and response validation.
 */
export const fetchAndValidateQuote = async (source: string, destination: string): Promise<FxQuoteResponse> => {
  // 1. Validate request params
  const validatedParams = fxQuoteRequestSchema.parse({
    sourceCurrency: source,
    destinationCurrency: destination,
  });

  // 2. Fetch raw data using Axios query params object for safer URL encoding
  const rawData = await getLiveFxQuote(
    validatedParams.sourceCurrency, 
    validatedParams.destinationCurrency
  );
  
  // 3. Enforce Zod schema contract on the response
  return fxQuoteResponseSchema.parse(rawData);
};