import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getWalletStatement } from "../services/walletService";
import type { LedgerEntry } from "../../ledger/types";
import { getApiErrorMessage } from "../../../lib/apiErrors";

/**
 * Paginated ledger statement for the dashboard.
 *
 * Query key family is prefixed with `ledger-statement` so money-movement
 * flows can invalidate every page at once:
 *   invalidateQueries({ queryKey: ['ledger-statement'] })
 * `keepPreviousData` keeps the previous page rendered while the next loads.
 */
export const useWalletStatement = (initialSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSizeState] = useState(initialSize);

  const statementQuery = useQuery({
    queryKey: ['ledger-statement', currentPage, size],
    queryFn: () => getWalletStatement(currentPage, size),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  const data = statementQuery.data;

  // Content is already contract-parsed by getWalletStatement (ledger/types);
  // transactionId/walletId nullability is handled by the schema itself.
  const entries: LedgerEntry[] = data?.content ?? [];

  // Pagination Handlers
  const nextPage = () => {
    if (currentPage < (data?.totalPages ?? 0) - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return {
    entries,
    pagination: {
      currentPage,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
      size,
    },
    isLoading: statementQuery.isPending,
    error: statementQuery.error
      ? getApiErrorMessage(statementQuery.error, 'Failed to fetch wallet statement. Please check your connection.')
      : null,
    nextPage,
    prevPage,
    // Reset to first page (useful if user changes page size or applies a date filter later)
    resetPage: () => setCurrentPage(0),
    setSize: (newSize: number) => {
      setSizeState(newSize);
      setCurrentPage(0);
    },
    refetch: () => statementQuery.refetch(),
  };
};