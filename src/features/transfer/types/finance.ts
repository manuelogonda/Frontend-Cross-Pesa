export interface LedgerEntry {
  id: string;
  transactionId: string;
  entryType: 'CREDIT' | 'DEBIT';
  currency: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  currency: string;
  balance: number;
  availableBalance: number;
}

export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  payoutProvider: string;
  accountNumber: string;
}

export interface FxQuote {
  quoteId: string;
  sourceCurrency: string;
  destinationCurrency: string;
  exchangeRate: number;
  expiresAt: string;
}

export interface TransactionRequest {
  beneficiaryId: string;
  sourceWalletId: string;
  destinationWalletId: string;
  sourceCurrency: string;
  destinationCurrency: string;
  sourceAmount: number;
  idempotencyKey: string;
}

export interface TransactionResponse {
  id: string;
  gatewayReference: string;
  status: string;
  sourceAmount: number;
  destinationAmount: number;
  transferFee: number;
  fxRateApplied: number;
  createdAt: string;
}