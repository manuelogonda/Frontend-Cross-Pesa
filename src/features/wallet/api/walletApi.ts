import { apiClient } from "../../../lib/axios";
import type { LedgerEntry } from "../../transfer/types/finance";
import type { Wallet } from "../validation/transferSchema";

export const getWallets = async (): Promise<Wallet[]> => {
  const { data } = await apiClient.get<Wallet[]>('/wallets');
  return data;
};

export const topUpWallet = async (currency: string, amount: number): Promise<Wallet> => {
  const { data } = await apiClient.post<Wallet>('/wallets/top-up', { currency, amount });
  return data;
};

export const getWalletLedger = async (walletId: string): Promise<LedgerEntry[]> => {
  const { data } = await apiClient.get<LedgerEntry[]>(`/ledgers/wallets/${walletId}`);
  return data;
};