import z from "zod";
import { apiClient } from "../../../lib/axios";
import { ledgerEntrySchema, type PaginatedLedgerResponse } from "../types";

export const getWalletStatementApi = async (
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