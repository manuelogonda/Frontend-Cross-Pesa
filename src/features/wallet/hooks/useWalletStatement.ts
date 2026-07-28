import { useCallback, useEffect, useState } from "react";
import { getWalletStatement, type UserLedgerEntry } from "../services/walletService";
import { ZodError } from "zod";

export const useWalletStatement = (initialSize: number = 10) => {
  // Data State
  const [entries, setEntries] = useState<UserLedgerEntry[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [size, setSize] = useState<number>(initialSize);

  // Status State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatement = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWalletStatement(currentPage, size);
      
      setEntries(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      if (err instanceof ZodError) {
        console.error("Statement Schema Validation Error:", err.errors);
        setError("Received invalid ledger data format from the server.");
      } else {
        const message = err.response?.data?.message || 'Failed to fetch wallet statement. Please check your connection.';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, size]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  // Pagination Handlers
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Reset to first page (useful if user changes page size or applies a date filter later)
  const resetPage = () => setCurrentPage(0);

  return {
    entries,
    pagination: {
      currentPage,
      totalPages,
      totalElements,
      size
    },
    isLoading,
    error,
    nextPage,
    prevPage,
    resetPage,
    setSize,
    refetch: fetchStatement
  };
};