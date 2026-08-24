import { useEffect, useState } from "react";
import type { FxQuoteResponse } from "../validation/ratesSchema";
import { fetchAndValidateQuote } from "../services/rateService";
import { ZodError } from "zod";

interface UseLiveQuoteResult {
  quote: FxQuoteResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const useLiveQuote = (
  sourceCurrency: string, 
  destinationCurrency: string
): UseLiveQuoteResult => {
  const [quote, setQuote] = useState<FxQuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Flag to discard stale async resolution
    let isCancelled = false;

    // Skip API call if currencies are missing or identical
    if (!sourceCurrency || !destinationCurrency || sourceCurrency === destinationCurrency) {
      setQuote(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const loadQuote = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const liveQuote = await fetchAndValidateQuote(sourceCurrency, destinationCurrency);
        
        // Only update state if this effect execution is still current
        if (!isCancelled) {
          setQuote(liveQuote);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setQuote(null);
          
          if (err instanceof ZodError) {
            setError('Received invalid rate payload from server.');
          } else if (typeof err === 'object' && err !== null && 'response' in err) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Failed to fetch live exchange rate.');
          } else {
            setError('An unexpected error occurred while fetching exchange rates.');
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    // 300ms Debounce
    const timeoutId = setTimeout(() => {
      loadQuote();
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [sourceCurrency, destinationCurrency]);

  return { quote, isLoading, error };
};