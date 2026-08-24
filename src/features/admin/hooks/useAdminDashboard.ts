import { useCallback, useEffect, useState } from "react";
import type { DashboardMetrics, PaginatedAdminTransactions } from "../validation/adminSchema";
import { fetchAdminTransactionsApi, fetchMetricsApi } from "../api/adminApi";
import { ZodError } from "zod";


export const useAdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [transactionsData, setTransactionsData] = useState<PaginatedAdminTransactions | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(0);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Run both API calls in parallel for faster load times
      const [metricsData, txData] = await Promise.all([
        fetchMetricsApi(),
        fetchAdminTransactionsApi(statusFilter, currentPage, 10) // 10 items per page
      ]);

      setMetrics(metricsData);
      setTransactionsData(txData);
    } catch (err: any) {
      if (err instanceof ZodError) {
        setError("Received invalid data format from the server.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(0); // Prevent viewing an empty page out-of-bounds
  };

  const nextPage = () => transactionsData && currentPage < transactionsData.totalPages - 1 && setCurrentPage(prev => prev + 1);
  const prevPage = () => currentPage > 0 && setCurrentPage(prev => prev - 1);

  return {
    metrics,
    transactions: transactionsData?.content || [],
    pagination: {
      currentPage: transactionsData?.number || 0,
      totalPages: transactionsData?.totalPages || 0,
      totalElements: transactionsData?.totalElements || 0,
    },
    statusFilter,
    handleFilterChange,
    nextPage,
    prevPage,
    loading,
    error,
    refresh: loadDashboardData
  };
};