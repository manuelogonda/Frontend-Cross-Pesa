import { v4 as uuidv4 } from 'uuid';
import { apiClient } from "../../../lib/axios";
import type { TransactionResponse } from "../types/finance";
import type { TransferFormData } from "../validation/transferSchema";

export const executeTransferApi = async (data: TransferFormData): Promise<TransactionResponse> => {
  const myUuid = uuidv4();
  // Attach the idempotency key right before sending to prevent duplicate charges
// 
  const payload = {
    ...data,
    idempotencyKey: myUuid,
  };
  console.log("Sending Payload:", JSON.stringify(payload, null, 2));
  const response = await apiClient.post<TransactionResponse>('/transactions/send', payload);
  return response.data;
};