import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../lib/axios";
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
        console.error("Wallet Schema Validation Error:", err.errors);
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
      
      // Save state for verification callback
      sessionStorage.setItem("pending_topup_amount", formData.amount.toString());
      sessionStorage.setItem("pending_topup_currency", formData.currency);
      
      // 🟢 Force a complete top-level window location replacement
      window.location.replace(response.paymentLink);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to initiate checkout. Please try again.';
      setTopUpError(message);
      setIsTopUpLoading(false);
    }
  };

  const verifyTopUpAction = async (txId: string, amount: string, currency: string) => {
    setIsTopUpLoading(true);
    setTopUpError(null);
    try {
      await verifyWalletTopUp({ transactionId: txId, amount, currency });
      setIsTopUpLoading(false);
      // Reload the wallet to get the fresh double-entry ledger balance!
      await loadWallet();
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Payment verification failed.';
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