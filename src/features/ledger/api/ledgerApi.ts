import { apiClient } from "../../../lib/axios";
import { PaginatedLedgerResponseSchema, type PaginatedLedgerResponse } from "../types";

export const getWalletStatementApi = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedLedgerResponse> => {
  const { data } = await apiClient.get('/ledgers/statement', {
    params: { page, size }
  });

  return PaginatedLedgerResponseSchema.parse(data);
};