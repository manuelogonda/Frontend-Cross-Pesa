import { useState } from "react";
import { submitTransfer } from "../services/ransactionService";
import type { TransferFormData } from "../validation/transferSchema";
import type { TransactionResponse } from "../types/finance";

export const useTransfer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<TransactionResponse | null>(null);

  const execute = async (data: TransferFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessData(null);

    try {
      const response = await submitTransfer(data);
      setSuccessData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw so the form component can catch it if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccessData(null);
  };

  return { execute, isSubmitting, error, successData, reset };
};