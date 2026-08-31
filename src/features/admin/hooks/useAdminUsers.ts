import { useCallback, useEffect, useState } from "react";
import type { PaginatedAdminUsers, WalletStatus } from "../validation/adminSchema";
import { fetchAdminUsersApi, updateUserWalletStatusApi } from "../api/adminApi";
import { ZodError } from "zod";

export const useAdminUsers = () => {
  const [usersData, setUsersData] = useState<PaginatedAdminUsers | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminUsersApi(currentPage, 15);
      setUsersData(data);
    } catch (err: any) {
      if (err instanceof ZodError) setError("Invalid user data format received.");
      else setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Mutation to freeze/suspend a user's retail wallet
  const changeWalletStatus = async (userId: string, newStatus: WalletStatus, reason: string) => {
    try {
      await updateUserWalletStatusApi(userId, newStatus, reason);
      await loadUsers(); // Refresh list to reflect new status
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Failed to update status" };
    }
  };

  return {
    users: usersData?.content || [],
    pagination: {
      currentPage: usersData?.number || 0,
      totalPages: usersData?.totalPages || 0,
      totalElements: usersData?.totalElements || 0,
    },
    nextPage: () => usersData && currentPage < usersData.totalPages - 1 && setCurrentPage(p => p + 1),
    prevPage: () => currentPage > 0 && setCurrentPage(p => p - 1),
    changeWalletStatus,
    loading,
    error,
    refresh: loadUsers
  };
};
