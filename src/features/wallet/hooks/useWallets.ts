import { useCallback, useEffect, useState } from "react";
import type { Wallet } from "../validation/transferSchema";
import { apiClient } from "../../../lib/axios";
import type { TopUpFormData } from "../validation/topupSchema";
import { topUpWallet, verifyWalletTopUp } from "../services/walletService";

export const useWallets = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Separate states for the top-up action to avoid mixing UI indicators
  const [isTopUpLoading, setIsTopUpLoading] = useState<boolean>(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  const loadWallets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Wallet[]>('/wallets');
      setWallets(response.data);
    } catch (err: any) {
      console.error("RAW JAVASCRIPT ERROR:", err);
      console.error("FRONTEND NETWORK ERROR:", err.message);
      console.error("AXIOS RESPONSE DATA:", err.response?.data);
      console.error("AXIOS RESPONSE STATUS:", err.response?.status);
      const message = err.response?.data?.message || 'Failed to fetch wallets. Please check your connection.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Action function to initiate top-up and handle the external redirect
   */
  const initiateTopUpAction = async (formData: TopUpFormData) => {
    setIsTopUpLoading(true);
    setTopUpError(null);
    try {
      const response = await topUpWallet(formData);
      sessionStorage.setItem("pending_topup_amount", formData.amount.toString());
      sessionStorage.setItem("pending_topup_currency", formData.currency);
      // Direct browser redirect to Flutterwave's secure hosted payment portal
      window.location.href = response.paymentLink;
    } catch (err: any) {
      console.error("🚨🚨🚨 RAW JAVASCRIPT ERROR:", err);
      console.error("🚨🚨🚨 AXIOS RESPONSE:", err.response?.data);
      const message = err.response?.data?.message || 'Failed to initiate checkout. Please try again.';
      setTopUpError(message);
      setIsTopUpLoading(false); // Only toggle false if it fails, otherwise browser navigates away
    }
  };

  /**
   * Action function to verify the transaction when Flutterwave redirects back
   */
  const verifyTopUpAction = async (txId: string, amount: string, currency: string) => {
    setIsTopUpLoading(true);
    setTopUpError(null);
    try {
      // Calls the service function we wrote earlier
      await verifyWalletTopUp({ transactionId: txId, amount, currency });
      setIsTopUpLoading(false);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Payment verification failed.';
      setTopUpError(message);
      setIsTopUpLoading(false);
      return false;
    }
  };

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  return { 
    wallets, 
    isLoading, 
    error, 
    refetch: loadWallets,
    initiateTopUp: initiateTopUpAction,
    verifyTopUp: verifyTopUpAction,
    isTopUpLoading,
    topUpError
  };

  
};