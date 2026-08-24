import { useState } from "react";
import type { TransferFormData } from "../validation/transferSchema";
import type { TransactionResponse } from "../types/finance";
import { executeTransferApi } from "../api/transactionApi";
import { ZodError } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "../../../store/toastStore";
import { getApiErrorMessage, isDuplicateTransaction } from "../../../lib/apiErrors";

export const useTransfer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<TransactionResponse | null>(null);

  const queryClient = useQueryClient(); // 2. Initialize the query client

  // Shared: money moved (or already had) server-side, so balances must refresh
  const invalidateMoneyQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['wallet'] });
    await queryClient.invalidateQueries({ queryKey: ['ledger-statement'] });
    await queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
  };

  const execute = async (data: TransferFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessData(null);

    try {
      const response = await executeTransferApi(data);
      setSuccessData(response);

      // 🟢 Invalidate queries so the Wallet Card & Ledger auto-refresh with new balance
      await invalidateMoneyQueries();

      return response;
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError("Received an invalid response format from the server.");
      } else if (isDuplicateTransaction(err)) {
        // HTTP 409 — idempotency key replayed; funds moved exactly once.
        // Friendly heads-up, NOT a failure modal. Balances may have changed
        // if the original attempt landed after this retry began.
        toast.info("This transaction was already processed.");
        await invalidateMoneyQueries();
      } else {
        // Status-based classification only (400/422 business rules, network, etc.).
        // Backend wording (insufficient funds, tier daily limits) passes through verbatim.
        setError(getApiErrorMessage(err, "Transfer failed due to a network error."));
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