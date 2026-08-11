import { useState } from "react";
import type { TransferFormData } from "../validation/transferSchema";
import type { TransactionResponse } from "../types/finance";
import { executeTransferApi } from "../api/transactionApi";
import { ZodError } from "zod";
import { useQueryClient } from "@tanstack/react-query";

export const useTransfer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<TransactionResponse | null>(null);

  const queryClient = useQueryClient(); // 2. Initialize the query client

  const execute = async (data: TransferFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessData(null);

    try {
      const response = await executeTransferApi(data);
      setSuccessData(response);

      // 3. 🟢 Invalidate queries so the Wallet Card & Ledger auto-refresh with new balance
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
      await queryClient.invalidateQueries({ queryKey: ['ledger-statement'] });
      await queryClient.invalidateQueries({ queryKey: ['transaction-history'] });

      return response;
    } catch (err: any) {
      if (err instanceof ZodError) {
        console.error("Transaction Schema Validation Error:", err.issues);
        setError("Received an invalid response format from the server.");
      } else {
        const message = err.response?.data?.message || err.message || "Transfer failed due to a network error.";
        setError(message);
      }
      throw err;
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