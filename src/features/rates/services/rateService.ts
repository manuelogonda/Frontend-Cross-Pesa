import { getLiveFxQuote } from "../api/ratesApi";
import { fxQuoteResponseSchema } from "../validation/ratesSchema";

export const fetchAndValidateQuote = async (source: string, destination: string): Promise<FxQuoteResponse> => {
  const rawData = await getLiveFxQuote(source, destination);
  
  // Ensure the backend didn't send us bad data before returning it to the UI
  const validatedData = fxQuoteResponseSchema.parse(rawData);
  return validatedData;
};