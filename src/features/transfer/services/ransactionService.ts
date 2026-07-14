import { executeTransferApi } from "../api/transactionApi";
import type { TransactionResponse } from "../types/finance";
import type { TransferFormData } from "../validation/transferSchema";

export const submitTransfer = async (formData: TransferFormData): Promise<TransactionResponse> => {
  try {
    return await executeTransferApi(formData);
  } catch (error: any) {
    // Standardize the error message from Spring Boot to display in the UI
    const backendMessage = error.response?.data?.message;
    throw new Error(backendMessage || "An unexpected error occurred during the transfer.");
  }
};