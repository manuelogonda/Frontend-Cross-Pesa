import { useState } from "react";
import type { ExchangeFormData } from "../validation/transferSchema";
import { apiClient } from "../../../lib/axios";

export const useExchange = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const execute = async (data: ExchangeFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessData(null);

    try {
      // Prepare payload exactly as the backend's ExchangeFundsRequest expects
      const payload = {
        ...data,
        idempotencyKey: crypto.randomUUID(), // Built-in browser UUID generator
      };

      const response = await apiClient.post('/transactions/exchange', payload);
      setSuccessData(response.data);
      return response.data;
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || err.message || "Exchange failed. Please try again.";
      setError(backendMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => setSuccessData(null);

  return { execute, isSubmitting, error, successData, reset };
};