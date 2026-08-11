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
  id?: string;
  firstName: string;
  lastName: string;
  beneficiaryType: "INDIVIDUAL" | "ORGANIZATION" | "BUSINESS";
  email: string;
  phoneNumber: string;
  countryCode: string;
  city?: string;
  payoutMethod: "BANK_TRANSFER" | "MOBILE_MONEY" | "CARD_PAYMENT";
  payoutProvider: "MPESA" | "EQUITY_BANK" | "VISA" | "MASTERCARD";
  accountNumber: string;
  accountCurrency: "KES" | "USD" | "CNY" | "JPY" | "GBP" | "CAD" | "AUD" | "PKR" | "AED" | "SAR" | "EUR" | "SEK";
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
  reference: string;
  status: "FAILED" | "PENDING" | "PROCESSING" | "COMPLETED" | "FLAGGED";
  grossAmount: number;
  amountReceived: number;
  sourceCurrency: string;
  destinationCurrency: string;
  exchangeRate: number;
  createdAt: string;
  gatewayReference?: string;
  sourceAmount?: number;
  destinationAmount?: number;
  transferFee?: number;
  fxRateApplied?: number;
}