import { useCallback, useEffect, useState } from "react";
import type { Wallet } from "../validation/transferSchema";
import { apiClient } from "../../../lib/axios";

export const useWallets = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWallets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Direct call to your backend endpoint
      const response = await apiClient.get<Wallet[]>('/wallets');
      setWallets(response.data);
    } catch (err: any) {
      // Capture detailed error messages from Spring Boot
      const message = err.response?.data?.message || 'Failed to fetch wallets. Please check your connection.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  return { wallets, isLoading, error, refetch: loadWallets };
};