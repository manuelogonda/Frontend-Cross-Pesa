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

// NOTE: The Beneficiary type moved to features/beneficiaries/validation/beneficiarySchema
// (BeneficiaryResponseSchema) — the Zod-validated single source of truth.

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
  senderId: string;
  sourceWalletId: string;
  beneficiaryId?: string | null;
  sourceCurrency: string;
  destinationCurrency: string;
  grossAmount: number;
  netAmount: number;
  markupFee: number;
  routingFee: number;
  totalFee: number;
  amountReceived: number;
  fxRateApplied: number;
  usdNormalizationRate: number;
  reference: string;
  status: "FAILED" | "PENDING" | "PROCESSING" | "COMPLETED" | "FLAGGED";
  createdAt: string;
}