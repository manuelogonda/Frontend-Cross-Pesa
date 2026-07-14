import { apiClient } from "../../../lib/axios";
import type { DashboardMetrics, PaginatedAdminTransactions } from "../validation/adminSchema";

export const fetchMetricsApi = async (): Promise<DashboardMetrics> => {
  const response = await apiClient.get<DashboardMetrics>('/admin/metrics');
  return response.data;
};

export const fetchAdminTransactionsApi = async (
  status: string | null,
  page: number = 0,
  size: number = 20
): Promise<PaginatedAdminTransactions> => {
  // Construct query params
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (status && status !== 'ALL') {
    params.append('status', status);
  }

  const response = await apiClient.get<PaginatedAdminTransactions>(`/admin/transactions?${params.toString()}`);
  return response.data;
};

// NEW: User Management API Calls
export const fetchAdminUsersApi = async (
  page: number = 0,
  size: number = 20
): Promise<any> => {
  const response = await apiClient.get(`/admin/users?page=${page}&size=${size}`);
  return response.data;
};

export const updateUserStatusApi = async (
  userId: string,
  status: string,
  reason: string
): Promise<void> => {
  await apiClient.put(`/admin/users/${userId}/status`, { status, reason });
};

export const updateUserKycApi = async (
  userId: string,
  kycStatus: string,
  kycLevel: number,
  adminNotes: string
): Promise<void> => {
  await apiClient.put(`/admin/users/${userId}/kyc`, { kycStatus, kycLevel, adminNotes });
};