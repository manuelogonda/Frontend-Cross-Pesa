import { useCallback, useEffect, useState } from "react";
import type { PaginatedWallets, TreasuryRebalance, WalletType } from "../validation/adminSchema";
import { executeTreasuryRebalanceApi, fetchSystemWalletsApi } from "../api/adminApi";
import { ZodError } from "zod";

export const useAdminTreasury = () => {
  const [walletsData, setWalletsData] = useState<PaginatedWallets | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default to liquidity pools
  const [walletTypeFilter, setWalletTypeFilter] = useState<WalletType>('SYSTEM_LIQUIDITY');
  const [currentPage, setCurrentPage] = useState<number>(0);

  const loadTreasuryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSystemWalletsApi(walletTypeFilter, currentPage, 10);
      setWalletsData(data);
    } catch (err: any) {
      if (err instanceof ZodError) setError("Invalid treasury data format received.");
      else setError(err.response?.data?.message || "Failed to load treasury wallets");
    } finally {
      setLoading(false);
    }
  }, [walletTypeFilter, currentPage]);

  useEffect(() => {
    loadTreasuryData();
  }, [loadTreasuryData]);

  // Mutation for Rebalancing
  const handleRebalance = async (payload: TreasuryRebalance) => {
    try {
      await executeTreasuryRebalanceApi(payload);
      await loadTreasuryData(); // Refresh pools after rebalancing
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Rebalance failed" };
    }
  };

  return {
    wallets: walletsData?.content || [],
    pagination: {
      currentPage: walletsData?.number || 0,
      totalPages: walletsData?.totalPages || 0,
    },
    walletTypeFilter,
    setWalletTypeFilter: (type: WalletType) => {
      setWalletTypeFilter(type);
      setCurrentPage(0);
    },
    nextPage: () => walletsData && currentPage < walletsData.totalPages - 1 && setCurrentPage(p => p + 1),
    prevPage: () => currentPage > 0 && setCurrentPage(p => p - 1),
    handleRebalance,
    loading,
    error,
    refresh: loadTreasuryData
  };
};