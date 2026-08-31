import { apiClient } from "../../../lib/axios";
import { STEP_UP_TOKEN_HEADER } from "../../../lib/stepUp";
import {
  TransactionResponseSchema,
  type TransactionResponse,
  type TransferFormData,
} from "../validation/transferSchema";

/**
 * Executes a cross-border transfer to a saved beneficiary.
 *
 * The idempotency key is supplied by the caller (useTransfer) so RETRIES of a
 * failed attempt reuse the SAME key — the backend dedupes replays with HTTP 409.
 */
export const executeTransferApi = async (
  data: TransferFormData,
  idempotencyKey: string,
  stepUpToken?: string
): Promise<TransactionResponse> => {
  const payload = {
    ...data,
    idempotencyKey,
  };
  
  // PII/financial data: never log transfer payloads

  const { data: responseData } = await apiClient.post('/transactions/send', payload, stepUpToken ? {
    headers: {
      [STEP_UP_TOKEN_HEADER]: stepUpToken,
    },
  } : undefined);
  
  // Strictly enforce the contract before returning to the UI
  return TransactionResponseSchema.parse(responseData);
};

/**
 * Polls a single transaction until it reaches a terminal state
 * (COMPLETED | FAILED | FLAGGED). Transactions start as PROCESSING and are
 * advanced by the settlement worker / payout webhooks.
 */
export const getTransactionStatusApi = async (id: string): Promise<TransactionResponse> => {
  const { data } = await apiClient.get(`/transactions/${id}`);
  return TransactionResponseSchema.parse(data);
};
