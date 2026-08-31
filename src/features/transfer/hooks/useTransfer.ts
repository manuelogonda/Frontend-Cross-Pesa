import { useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { TransferFormData, TransactionResponse } from "../validation/transferSchema";
import { executeTransferApi } from "../api/transactionApi";
import { ZodError } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { NOTIFICATIONS_QUERY_KEY } from "../../notifications/hooks/useNotifications";
import { WALLET_QUERY_KEY } from "../../wallet/hooks/useWallets";
import { toast } from "../../../store/toastStore";
import { getApiErrorMessage, isDuplicateTransaction } from "../../../lib/apiErrors";

// Shared cache keys — money-movement flows (transfer form settlement polling,
// top-up verification) reuse these so every consumer refetches consistently.
export const LEDGER_STATEMENT_QUERY_KEY = ['ledger-statement'] as const;
export const TRANSACTION_HISTORY_QUERY_KEY = ['transaction-history'] as const;

export const useTransfer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<TransactionResponse | null>(null);

  const queryClient = useQueryClient(); // 2. Initialize the query client

  // Same key across RETRIES of one attempt; regenerated only after the
  // backend money actually moved (success or 409 duplicate).
  const idempotencyKeyRef = useRef(uuidv4());

  const getIdempotencyKey = () => idempotencyKeyRef.current;

  // Shared: money moved (or already had) server-side, so balances must refresh
  const invalidateMoneyQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: LEDGER_STATEMENT_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: TRANSACTION_HISTORY_QUERY_KEY });
    // Backend created a transaction notification server-side — refresh the
    // bell immediately instead of waiting for the next poll tick.
    await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  };

  const execute = async (data: TransferFormData, stepUpToken?: string) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessData(null);

    try {
      const response = await executeTransferApi(data, idempotencyKeyRef.current, stepUpToken);
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

  return { execute, isSubmitting, error, successData, setSuccessData, reset, getIdempotencyKey };
};
