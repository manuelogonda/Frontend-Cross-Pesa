import { useCallback, useEffect, useState } from "react";
import { getWallet, topUpWallet, verifyWalletTopUp } from "../services/walletService";
import type { TopUpFormData, Wallet } from "../validation/walletShema";
import { ZodError } from "zod";

export const useWallets = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States for top-up action
  const [isTopUpLoading, setIsTopUpLoading] = useState<boolean>(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Calls the Zod-validated service function instead of raw Axios
      const data = await getWallet();
      setWallet(data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Valid state: The user just registered and hasn't created a wallet yet
        setWallet(null);
      } else if (err instanceof ZodError) {
        console.error("Wallet Schema Validation Error:", err.issues);
        setError("Received invalid wallet data format from the server.");
      } else {
        const message = err.response?.data?.message || 'Failed to fetch wallet. Please check your connection.';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

 const initiateTopUpAction = async (formData: TopUpFormData) => {
    setIsTopUpLoading(true);
    setTopUpError(null);
    try {
      const response = await topUpWallet(formData);
      
      // 🟢 Force a complete top-level window location replacement
      // NOTE: No client state is carried into the redirect — the backend now
      // derives amount/currency/payer server-side from Flutterwave's verify API.
      window.location.replace(response.paymentLink);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to initiate checkout. Please try again.';
      setTopUpError(message);
      setIsTopUpLoading(false);
    }
  };

  const verifyTopUpAction = async (txId: string) => {
    setIsTopUpLoading(true);
    setTopUpError(null);
    try {
      await verifyWalletTopUp({ transactionId: txId });
      setIsTopUpLoading(false);
      // Reload the wallet to get the fresh double-entry ledger balance!
      await loadWallet();
      return true;
    } catch (err: any) {
      // Backend 400s return { "error": "..." }, e.g.:
      // "Payment verification failed." | "Payment does not belong to this account."
      const message = err.response?.data?.error
        || err.response?.data?.message
        || 'Payment verification failed. Please contact support if funds were deducted.';
      setTopUpError(message);
      setIsTopUpLoading(false);
      return false;
    }
  };

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // DERIVED ARRAY: Safely wrap single wallet in an array for list/dropdown consumers
  const walletsList: Wallet[] = wallet ? [wallet] : [];

  return { 
    wallet, 
    wallets: walletsList, // Fixes TransferForm and ExchangeForm map crashes!
    hasWallet: !!wallet,
    isLoading, 
    loading: isLoading,   // Alias for consistency across components
    error, 
    refetch: loadWallet,
    initiateTopUp: initiateTopUpAction,
    verifyTopUp: verifyTopUpAction,
    isTopUpLoading,
    topUpError
  };
};