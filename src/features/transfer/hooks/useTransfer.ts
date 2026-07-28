import { useState } from "react";
import type { TransferFormData } from "../validation/transferSchema";
import type { TransactionResponse } from "../types/finance";
import { executeTransferApi } from "../api/transactionApi";
import { ZodError } from "zod";

export const useTransfer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<TransactionResponse | null>(null);

  const execute = async (data: TransferFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessData(null);

    try {
      // Calls our API which injects the idempotency key automatically
      const response = await executeTransferApi(data);
      setSuccessData(response);
      return response;
    } catch (err: any) {
      if (err instanceof ZodError) {
        console.error("Transaction Schema Validation Error:", err.errors);
        setError("Received an invalid response format from the server.");
      } else {
        // Extract the exact error message thrown by Spring Boot
        const message = err.response?.data?.message || err.message || "Transfer failed due to a network error.";
        setError(message);
      }
      throw err; // Re-throw so the UI form can stop its loading state
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