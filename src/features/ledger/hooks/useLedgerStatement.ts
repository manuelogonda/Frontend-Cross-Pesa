import { useCallback, useEffect, useState } from "react";
import type { FormattedLedgerEntry } from "../types";
import { getWalletStatementApi } from "../api/ledgerApi";
import { LedgerService } from "../services/LedgerService";
import { ZodError } from "zod";

export const useLedgerStatement = (initialPageSize: number = 10) => {
  const [entries, setEntries] = useState<FormattedLedgerEntry[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rawResponse = await getWalletStatementApi(page, initialPageSize);

      // Transform raw backend responses via our service before saving to state
      const formatted = rawResponse.content.map(LedgerService.formatEntry);

      setEntries(formatted);
      setTotalPages(rawResponse.totalPages);
      setTotalElements(rawResponse.totalElements);
    } catch (err: any) {
      if (err instanceof ZodError) {
        console.error('Ledger Schema Validation Error:', err.errors);
        setError('Server returned an unexpected ledger data structure.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch ledger statement.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, initialPageSize]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  const nextPage = () => {
    if (page < totalPages - 1) setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  return {
    entries,
    page,
    totalPages,
    totalElements,
    loading,
    error,
    nextPage,
    prevPage,
    setPage,
    refresh: fetchStatement,
  };
};

