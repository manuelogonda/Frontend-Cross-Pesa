import z from "zod";
import { WalletSchema, type TopUpFormData, type Wallet } from "../validation/walletShema";
import { apiClient } from "../../../lib/axios";

export interface TopUpResponse {
  message: string;
  paymentLink: string;
}

export interface VerificationResponse {
  message: string;
  status: 'SUCCESS' | 'FAILED';
}

// Ledger Statement Schemas (Aligned with LedgerEntryResponse.java)
export const UserLedgerEntrySchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid(),
  entryClass: z.string(),
  debit: z.number(),
  credit: z.number(),
  amount: z.number(), // Net impact
  balanceAfter: z.number(),
  currency: z.string(),
  description: z.string(),
  createdAt: z.string()
});

export const PaginatedUserStatementSchema = z.object({
  content: z.array(UserLedgerEntrySchema),
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  number: z.number(),
});

export type UserLedgerEntry = z.infer<typeof UserLedgerEntrySchema>;
export type PaginatedUserStatement = z.infer<typeof PaginatedUserStatementSchema>;

// ==========================================
// 2. WALLET OPERATIONS
// ==========================================

/**
 * Fetches the currently authenticated user's single retail wallet.
 */
export const getWallet = async (): Promise<Wallet> => {
  const { data } = await apiClient.get('/wallets');
  return WalletSchema.parse(data);
};

/**
 * Creates the user's primary retail wallet during onboarding.
 */
export const createWallet = async (currency: string): Promise<Wallet> => {
  const { data } = await apiClient.post('/wallets', { currency });
  return WalletSchema.parse(data);
};

// ==========================================
// 3. FLUTTERWAVE TOP-UP FLOW
// ==========================================

/**
 * Initiates the top-up process to get the Flutterwave redirect link.
 */
export const topUpWallet = async (formData: TopUpFormData): Promise<TopUpResponse> => {
  const { data } = await apiClient.post<TopUpResponse>('/wallets/topup', formData);
  return data; 
};

/**
 * Finalizes the funding step by dispatching Flutterwave parameters 
 * back to Spring Boot for secure double-entry verification.
 */
export const verifyWalletTopUp = async (params: {
  transactionId: string;
  amount: string;
  currency: string;
}): Promise<VerificationResponse> => {
  const { data } = await apiClient.post<VerificationResponse>('/wallets/verify', null, {
    params: {
      transactionId: params.transactionId,
      amount: params.amount,
      currency: params.currency
    }
  });
  return data;
};

// ==========================================
// 4. USER LEDGER STATEMENT (TRANSPARENCY)
// ==========================================

/**
 * Fetches the user's paginated, immutable double-entry ledger statement.
 * SECURE: No walletId passed in the URL. The backend derives it from the JWT token.
 */
export const getWalletStatement = async (
  page: number = 0, 
  size: number = 15
): Promise<PaginatedUserStatement> => {
  const { data } = await apiClient.get('/ledgers/statement', {
    params: { page, size }
  });
  
  // Strictly enforce the schema so the UI doesn't crash if backend drops a field
  return PaginatedUserStatementSchema.parse(data);
};