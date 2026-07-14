
import { z } from 'zod';
import { walletSchema, type Wallet } from '../validation/transferSchema';
import { apiClient } from '../../../lib/axios';
import type { TopUpFormData } from '../validation/topupSchema';

export const getWallets = async (): Promise<Wallet[]> => {
  const { data } = await apiClient.get('/wallets');
  // Zod parsing ensures the backend response matches our TypeScript types
  return z.array(walletSchema).parse(data);
};

export const topUpWallet = async (request: TopUpFormData): Promise<Wallet> => {
  const { data } = await apiClient.post('/wallets/top-up', request);
  return walletSchema.parse(data);
};

export const createWallet = async (currency: string): Promise<Wallet> => {
  const { data } = await apiClient.post('/wallets', { currency });
  return walletSchema.parse(data);
};