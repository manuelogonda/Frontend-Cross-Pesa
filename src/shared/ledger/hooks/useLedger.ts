import { useEffect, useState } from "react";
import { getLedger } from "../service/ledgerService";
import type { LedgerEntry } from "../validation/ledgerEntrySchema";

export const useLedger = (walletId: string | null) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletId) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getLedger(walletId);
        setEntries(data);
      } catch (err: any) {
        console.error("DEBUG: Ledger API failed", {
            walletId,
            status: err.response?.status,
            message: err.response?.data?.message || err.message,
            fullError: err
        });
        setError(err.response?.data?.message || 'Failed to load ledger');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [walletId]);

  return { entries, isLoading, error };
};