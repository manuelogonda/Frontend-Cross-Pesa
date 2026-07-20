import { apiClient } from "../../../lib/axios";
import type { LedgerEntry } from "../../transfer/types/finance";
import type { TopUpResponse } from "../services/walletService";
import type { TopUpFormData } from "../validation/topupSchema";
import type { Wallet } from "../validation/transferSchema";

export const getWallets = async (): Promise<Wallet[]> => {
  const { data } = await apiClient.get<Wallet[]>('/wallets');
  return data;
};

export const topUpWallet = async (formData: TopUpFormData): Promise<TopUpResponse> => {
  const { data } = await apiClient.post<TopUpResponse>('/wallets/topup', formData);
  return data;
};

export const getWalletLedger = async (walletId: string): Promise<LedgerEntry[]> => {
  const { data } = await apiClient.get<LedgerEntry[]>(`/ledgers/wallets/${walletId}`);
  return data;
};