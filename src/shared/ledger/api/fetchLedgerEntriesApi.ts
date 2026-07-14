import { apiClient } from "../../../lib/axios";
import type { LedgerEntry } from "../validation/ledgerEntrySchema";

export const fetchLedgerEntriesApi = async (walletId: string): Promise<LedgerEntry[]> => {
  const { data } = await apiClient.get<LedgerEntry[]>(`/ledgers/wallets/${walletId}`);
  return data;
};