import z from "zod";
import { WalletSchema, type TopUpFormData, type Wallet } from "../validation/walletSchema";
import { apiClient } from "../../../lib/axios";
import { ledgerEntrySchema, type PaginatedLedgerResponse } from "../../ledger/types";

export interface TopUpResponse {
  message: string;
  paymentLink: string;
}

export interface VerificationResponse {
  message: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface SpendFormData {
  currency: string;
  amount: number;
  description: string;
}

// NOTE: Ledger statement contracts live in features/ledger/types
// (ledgerEntrySchema / PaginatedLedgerResponse) — the single source of truth.

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
 * Finalizes the funding step by sending ONLY the Flutterwave transaction ID
 * back to Spring Boot. The server securely derives amount/currency/payer from
 * Flutterwave's own verify API — client-supplied values are never trusted.
 */
export const verifyWalletTopUp = async (params: {
  transactionId: string;
}): Promise<VerificationResponse> => {
  const { data } = await apiClient.post<VerificationResponse>('/wallets/verify', null, {
    params: {
      transactionId: params.transactionId
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
  size: number = 10
): Promise<PaginatedLedgerResponse> => {
  const { data } = await apiClient.get('/ledgers/statement', {
    params: { page, size }
  });
 

  // 1. Safely parse ONLY the content array so individual rows are validated by Zod
  const rawContent = Array.isArray(data) ? data : (data?.content || []);
  const parsedContent = z.array(ledgerEntrySchema).parse(rawContent);

  // 2. Safely extract pagination metadata from either flat or nested Spring formats without throwing errors
  const totalPages = data?.totalPages ?? data?.page?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? data?.page?.totalElements ?? parsedContent.length;
  const pageSize = data?.size ?? data?.page?.size ?? size;
  const pageNumber = data?.number ?? data?.page?.number ?? page;

  return {
    content: parsedContent,
    totalPages,
    totalElements,
    size: pageSize,
    number: pageNumber,
  };
};