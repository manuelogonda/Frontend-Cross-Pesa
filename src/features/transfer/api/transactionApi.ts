import { v4 as uuidv4 } from 'uuid';
import { apiClient } from "../../../lib/axios";
import type { TransactionResponse } from "../types/finance";
import { TransactionResponseSchema, type TransferFormData } from "../validation/transferSchema";

/**
 * Executes a cross-border transfer to a saved beneficiary.
 * Automatically injects a UUID idempotency key to prevent double-charging 
 * if the user double-clicks the submit button.
 */
export const executeTransferApi = async (data: TransferFormData): Promise<TransactionResponse> => {
  const payload = {
    ...data,
    idempotencyKey: uuidv4(),
  };
  
  console.log("Sending Transfer Payload:", JSON.stringify(payload, null, 2));
  
  const { data: responseData } = await apiClient.post('/transactions/send', payload);
  
  // Strictly enforce the contract before returning to the UI
  return TransactionResponseSchema.parse(responseData);
};