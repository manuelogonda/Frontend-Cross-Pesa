import { apiClient } from '../../../lib/axios';
import type { Beneficiary, FxQuote, LedgerEntry, TransactionRequest, Wallet } from '../../transfer/types/finance';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid

export const fetchWallets = async (): Promise<Wallet[]> => {
  const { data } = await apiClient.get('/wallets');
  return data;
};

export const fetchBeneficiaries = async (): Promise<Beneficiary[]> => {
  const { data } = await apiClient.get('/beneficiaries');
  return data;
};

export const getFxQuote = async (source: string, destination: string): Promise<FxQuote> => {
  const { data } = await apiClient.get(`/fx-rates/quote?source=${source}&destination=${destination}`);
  return data;
};

export const executeTransfer = async (payload: Omit<TransactionRequest, 'idempotencyKey'>) => {
  // We generate the idempotency key right before sending!
  const request: TransactionRequest = {
    ...payload,
    idempotencyKey: uuidv4() 
  };
  const { data } = await apiClient.post('/transactions/transfer', request);
  return data;
};

export const fetchWalletLedger = async (walletId: string): Promise<LedgerEntry[]> => {
  const { data } = await apiClient.get(`/ledgers/wallets/${walletId}`);
  return data;
};