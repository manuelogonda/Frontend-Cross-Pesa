import { useCallback, useEffect, useState } from "react";
import type { DashboardMetrics, PaginatedAdminTransactions } from "../validation/adminSchema";
import { fetchAdminTransactionsApi, fetchMetricsApi } from "../api/adminApi";

export const useAdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [transactionsData, setTransactionsData] = useState<PaginatedAdminTransactions | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
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
      console.error("Failed to load admin dashboard:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  // Re-fetch whenever the filter or page changes
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handlers
  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(0); // Reset to first page when changing filters
  };

  const nextPage = () => {
    if (transactionsData && currentPage < transactionsData.totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

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