import { useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { TransferFormData, TransactionResponse } from "../validation/transferSchema";
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

  // Same key across RETRIES of one attempt; regenerated only after the
  // backend money actually moved (success or 409 duplicate).
  const idempotencyKeyRef = useRef(uuidv4());

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
      const response = await executeTransferApi(data, idempotencyKeyRef.current);
      setSuccessData(response);
      idempotencyKeyRef.current = uuidv4(); // next transfer = fresh key

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
        idempotencyKeyRef.current = uuidv4(); // replay confirmed — fresh key
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

  return { execute, isSubmitting, error, successData, setSuccessData, reset };
};