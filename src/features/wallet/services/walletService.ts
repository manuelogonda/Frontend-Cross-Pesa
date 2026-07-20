
import { z } from 'zod';
import { walletSchema, type Wallet } from '../validation/transferSchema';
import { apiClient } from '../../../lib/axios';
import type { TopUpFormData } from '../validation/topupSchema';

// Interface defining the response payload for initiating a Flutterwave checkout
export interface TopUpResponse {
  message: string;
  paymentLink: string;
}

// Interface defining the final wallet funding payload status
export interface VerificationResponse {
  message: string;
  status: 'SUCCESS' | 'FAILED';
}

export const getWallets = async (): Promise<Wallet[]> => {
  const { data } = await apiClient.get('/wallets');
  // Zod parsing ensures the backend response matches our TypeScript types
  return z.array(walletSchema).parse(data);
};

export const topUpWallet = async (formData: TopUpFormData): Promise<TopUpResponse> => {
  const { data } = await apiClient.post<TopUpResponse>('/wallets/topup', formData);
  return data; 
};

// * 2. Finalizes the funding step by dispatching Flutterwave parameters 
//  * back to Spring Boot for verification.
//  */
export const verifyWalletTopUp = async (params: {
  transactionId: string;
  amount: string;
  currency: string;
}): Promise<VerificationResponse> => {
  // Matched to your backend query string endpoint: /api/v1/wallets/verify?...
  const { data } = await apiClient.post<VerificationResponse>('/wallets/verify', null, {
    params: {
      transactionId: params.transactionId,
      amount: params.amount,
      currency: params.currency
    }
  });
  return data;
};

export const createWallet = async (currency: string): Promise<Wallet> => {
  const { data } = await apiClient.post('/wallets', { currency });
  return walletSchema.parse(data);
};