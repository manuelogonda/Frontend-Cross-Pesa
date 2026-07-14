import { useEffect, useState } from "react";
import type { FxQuoteResponse } from "../validation/ratesSchema";
import { fetchAndValidateQuote } from "../services/rateService";

interface UseLiveQuoteResult {
  quote: FxQuoteResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const useLiveQuote = (sourceCurrency: string, destinationCurrency: string): UseLiveQuoteResult => {
  const [quote, setQuote] = useState<FxQuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if currencies aren't selected or if they are the same
    if (!sourceCurrency || !destinationCurrency || sourceCurrency === destinationCurrency) {
      setQuote(null);
      return;
    }

    const loadQuote = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const liveQuote = await fetchAndValidateQuote(sourceCurrency, destinationCurrency);
        setQuote(liveQuote);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch live exchange rate.');
        setQuote(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call slightly to avoid spamming the backend if the user types quickly
    const timeoutId = setTimeout(() => {
      loadQuote();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [sourceCurrency, destinationCurrency]);

  return { quote, isLoading, error };
};