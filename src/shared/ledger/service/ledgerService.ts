import z from "zod";
import { fetchLedgerEntriesApi } from "../api/fetchLedgerEntriesApi";
import { ledgerEntrySchema, type LedgerEntry } from "../validation/ledgerEntrySchema";

export const getLedger = async (walletId: string): Promise<LedgerEntry[]> => {
  const rawData = await fetchLedgerEntriesApi(walletId);
  // Validate data integrity before returning it to the UI
  return z.array(ledgerEntrySchema).parse(rawData);
};