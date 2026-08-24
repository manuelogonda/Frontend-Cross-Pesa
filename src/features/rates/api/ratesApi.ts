import { apiClient } from "../../../lib/axios";
import type { FxQuoteResponse } from "../validation/ratesSchema";

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

// NOTE: The validated wrapper `fetchAndValidateQuote` lives in
// ../services/rateService.ts — the single implementation. This module stays
// raw-transport only (no schema imports, no business rules).