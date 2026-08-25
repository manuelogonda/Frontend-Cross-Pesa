import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWallet, topUpWallet, verifyWalletTopUp } from "../services/walletService";
import type { TopUpFormData, Wallet } from "../validation/walletSchema";
import { toast } from "../../../store/toastStore";
import { getApiErrorMessage, isDuplicateTransaction } from "../../../lib/apiErrors";

/**
 * Shared cache key. Money-movement flows (transfer, top-up) invalidate this
 * after success so every mounted consumer refetches automatically.
 */
export const WALLET_QUERY_KEY = ['wallet'] as const;

export const useWallets = () => {
  const queryClient = useQueryClient();
  const [topUpError, setTopUpError] = useState<string | null>(null);

  // ── Server state: the user's single retail wallet ─────────────────────
  // A 404 is a VALID business state (registered but no wallet yet), so it's
  // normalized to `null` data rather than surfacing as a query error.
  const walletQuery = useQuery({
    queryKey: WALLET_QUERY_KEY,
    staleTime: 30 * 1000,
    queryFn: async (): Promise<Wallet | null> => {
      try {
        return await getWallet();
      } catch (err) {
        if ((err as { response?: { status?: number } })?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });

  // ── Mutations ──────────────────────────────────────────────────────────
  const initiateMutation = useMutation({
    mutationFn: (formData: TopUpFormData) => topUpWallet(formData),
    onError: (err) => {
      if (isDuplicateTransaction(err)) {
        toast.info('A checkout session was already created.');
        return;
      }
      setTopUpError(getApiErrorMessage(err, 'Failed to initiate checkout. Please try again.'));
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (txId: string) => verifyWalletTopUp({ transactionId: txId }),
  });

  const initiateTopUpAction = async (formData: TopUpFormData): Promise<void> => {
    setTopUpError(null);
    const response = await initiateMutation.mutateAsync(formData);
    // 🟢 Force a complete top-level window location replacement.
    // No client state is carried into the redirect — the backend derives
    // amount/currency/payer server-side from Flutterwave's verify API.
    window.location.replace(response.paymentLink);
  };

  const verifyTopUpAction = async (txId: string): Promise<boolean> => {
    setTopUpError(null);
    try {
      await verifyMutation.mutateAsync(txId);

      // Reload the wallet to get the fresh double-entry ledger balance!
      await queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
      return true;
    } catch (err) {
      if (isDuplicateTransaction(err)) {
        // HTTP 409: idempotency replay — funds were already credited once.
        // Friendly heads-up instead of a scary failure banner; refresh anyway.
        toast.info('This transaction was already processed.');
        await queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
        return true;
      }

      // Backend verification failures return { "error": "..." }, e.g.:
      // "Payment verification failed." | "Payment does not belong to this account."
      const serverError =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setTopUpError(
        serverError ||
          getApiErrorMessage(err, 'Payment verification failed. Please contact support if funds were deducted.')
      );
      return false;
    }
  };

  const wallet = walletQuery.data ?? null;

  // DERIVED ARRAY: Safely wrap single wallet in an array for list/dropdown consumers
  const walletsList: Wallet[] = wallet ? [wallet] : [];

  return {
    wallet,
    wallets: walletsList,
    hasWallet: !!wallet,
    isLoading: walletQuery.isPending,
    loading: walletQuery.isPending,   // Alias for consistency across components
    error: walletQuery.error
      ? getApiErrorMessage(walletQuery.error, 'Failed to fetch wallet. Please check your connection.')
      : null,
    refetch: () => walletQuery.refetch(),
    initiateTopUp: initiateTopUpAction,
    verifyTopUp: verifyTopUpAction,
    isTopUpLoading: initiateMutation.isPending || verifyMutation.isPending,
    topUpError
  };
};