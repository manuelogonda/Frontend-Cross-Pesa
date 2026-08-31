// ==========================================
// 1. OVERVIEW & METRICS API
// ==========================================

import { apiClient } from "../../../lib/axios";
import {
  buildStepUpContext,
  requestStepUpChallengeApi,
  verifyStepUpChallengeApi,
  STEP_UP_TOKEN_HEADER,
} from "../../../lib/stepUp";
import {
  AdminMessageResponseSchema,
  DashboardMetricsSchema,
  PaginatedAdminTransactionsSchema,
  PaginatedAdminUsersSchema,
  PaginatedLedgerEntriesSchema,
  PaginatedWalletsSchema,
  UpdateKycRequestSchema,
  WalletResponseSchema,
  type AdminMessageResponse,
  type DashboardMetrics,
  type PaginatedAdminTransactions,
  type PaginatedAdminUsers,
  type PaginatedLedgerEntries,
  type PaginatedWallets,
  type StepUpChallengeRequest,
  type StepUpChallengeResponse,
  type StepUpVerifyRequest,
  type StepUpVerifyResponse,
  type UpdateKycRequest,
  type TreasuryRebalance,
  type WalletResponse,
  type WalletStatus,
  type WalletType,
} from "../validation/adminSchema";

export const buildTreasuryRebalanceContext = (payload: TreasuryRebalance): string =>
  buildStepUpContext([
    ["sourceCurrency", payload.sourceCurrency],
    ["withdrawAmount", payload.withdrawAmount],
    ["targetCurrency", payload.targetCurrency],
    ["depositAmount", payload.depositAmount],
    ["notes", payload.notes],
  ]);

/**
 * Fetches high-level metrics for the admin overview dashboard.
 */
export const fetchMetricsApi = async (): Promise<DashboardMetrics> => {
  const { data } = await apiClient.get("/admin/metrics");
  return DashboardMetricsSchema.parse(data);
};

// ==========================================
// 2. TRANSACTION MONITORING API
// ==========================================

/**
 * Fetches paginated platform transactions with optional status filtering.
 */
export const fetchAdminTransactionsApi = async (
  status: string | null = null,
  page: number = 0,
  size: number = 20
): Promise<PaginatedAdminTransactions> => {
  const params: Record<string, string | number> = { page, size };

  if (status && status !== "ALL") {
    params.status = status;
  }

  const { data } = await apiClient.get("/admin/transactions", { params });
  return PaginatedAdminTransactionsSchema.parse(data);
};

// ==========================================
// 3. USER OPERATIONS & RISK MANAGEMENT API
// ==========================================

/**
 * Fetches paginated platform users for customer support and compliance audits.
 */
export const fetchAdminUsersApi = async (
  page: number = 0,
  size: number = 20
): Promise<PaginatedAdminUsers> => {
  const { data } = await apiClient.get("/admin/users", {
    params: { page, size },
  });
  // PII: never dump raw user records to the console
  return PaginatedAdminUsersSchema.parse(data);
};

/**
 * Updates a user's retail wallet status (e.g., ACTIVE, FROZEN, SUSPENDED).
 * Maps directly to AdminUserOpsController in Spring Boot.
 */
export const updateUserWalletStatusApi = async (
  userId: string,
  status: WalletStatus,
  reason?: string
): Promise<WalletResponse> => {
  const { data } = await apiClient.post(`/admin/users/${userId}/wallet/status`, {
    status,
    reason,
  });
  return WalletResponseSchema.parse(data.wallet);
};

/**
 * Updates a user's KYC tier and verification status.
 */
export const updateUserKycApi = async (
  userId: string,
  kycStatus: UpdateKycRequest["kycStatus"],
  kycLevel: number,
  adminNotes: string
): Promise<void> => {
  const payload = UpdateKycRequestSchema.parse({
    kycStatus,
    kycLevel,
    adminNotes,
  });

  await apiClient.put(`/admin/users/${userId}/kyc`, payload);
};

/**
 * Fetches a user's retail wallet details for support auditing.
 */
export const fetchUserRetailWalletApi = async (
  userId: string
): Promise<WalletResponse> => {
  const { data } = await apiClient.get(`/admin/users/${userId}/wallet`);
  return WalletResponseSchema.parse(data);
};

/**
 * Fetches a specific user's double-entry ledger audit trail for dispute resolution.
 */
export const fetchUserLedgerApi = async (
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedLedgerEntries> => {
  const { data } = await apiClient.get(`/admin/users/${userId}/ledger`, {
    params: { page, size },
  });
  return PaginatedLedgerEntriesSchema.parse(data);
};

/**
 * Requests an OTP challenge for sensitive treasury actions.
 */
export const requestTreasuryStepUpChallengeApi = async (
  payload: StepUpChallengeRequest
): Promise<StepUpChallengeResponse> => {
  return requestStepUpChallengeApi(payload);
};

/**
 * Verifies the OTP challenge and exchanges it for a one-time treasury token.
 */
export const verifyTreasuryStepUpChallengeApi = async (
  payload: StepUpVerifyRequest
): Promise<StepUpVerifyResponse> => {
  return verifyStepUpChallengeApi(payload);
};

// ==========================================
// 4. TREASURY & LIQUIDITY POOL API
// ==========================================

/**
 * Fetches system treasury wallets filtered by type (e.g., SYSTEM_LIQUIDITY, SYSTEM_MARKUP, SYSTEM_ROUTING).
 * Maps directly to AdminTreasuryController in Spring Boot.
 */
export const fetchSystemWalletsApi = async (
  type: WalletType,
  page: number = 0,
  size: number = 20
): Promise<PaginatedWallets> => {
  const { data } = await apiClient.get("/admin/treasury/wallets", {
    params: { type, page, size },
  });
  return PaginatedWalletsSchema.parse(data);
};

/**
 * Triggers a manual liquidity rebalance between system pools.
 * Interacts with the backend SystemWalletEngine double-entry ledger sequence.
 */
export const executeTreasuryRebalanceApi = async (
  payload: TreasuryRebalance,
  stepUpToken?: string
): Promise<AdminMessageResponse> => {
  const { data } = await apiClient.post(
    "/admin/treasury/rebalance",
    payload,
    stepUpToken
      ? {
          headers: {
            [STEP_UP_TOKEN_HEADER]: stepUpToken,
          },
        }
      : undefined
  );
  return AdminMessageResponseSchema.parse(data);
};
