// ==========================================
// 1. ENUMS (Aligned with Spring Boot Entities)
// ==========================================

import z from "zod";

export const CurrencySchema = z.enum([
  "KES", "USD", "CNY", "JPY", "GBP", "CAD", 
  "AUD", "PKR", "AED", "SAR", "EUR", "SEK"
]);

export const WalletTypeSchema = z.enum([
  "USER_RETAIL",
  "SYSTEM_MARKUP",
  "SYSTEM_ROUTING",
  "SYSTEM_LIQUIDITY",
]);

export const WalletStatusSchema = z.enum(["ACTIVE", "FROZEN", "SUSPENDED"]);

export const TransactionStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FLAGGED",
  "FAILED",
  "CANCELLED",
]);

export const KycStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const EntryClassSchema = z.enum([
  "PRINCIPAL_TRANSFER",
  "MARKUP_FEE",
  "ROUTING_FEE",
  "FX_CLEARING",
  "DEPOSIT",
  "WITHDRAWAL",
  "REFUND",
  "TREASURY_ADJUSTMENT",
]);

// ==========================================
// 2. USER MANAGEMENT & KYC SCHEMAS
// ==========================================
export const UserStatusSchema = z.enum(["ACTIVE", "SUSPENDED", "LOCKED"]);
export const StepUpActionSchema = z.enum([
  "TRANSACTION_SEND",
  "BENEFICIARY_CREATE",
  "BENEFICIARY_UPDATE",
  "BENEFICIARY_DELETE",
  "ADMIN_TREASURY_REBALANCE",
]);
export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable(),
  idType: z.string().nullable(),
  // Backend sends a PRE-MASKED value (e.g. "*****789"); never receives the raw ID
  idNumberMasked: z.string().nullable(),
  status: UserStatusSchema,
  kycStatus: KycStatusSchema,
  kycLevel: z.number().int().min(0),
  createdAt: z.string(),
});


export const KycReviewRequestSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  kycLevel: z.number().int().min(1).max(3),
  rejectionReason: z.string().optional(),
});

export const StepUpChallengeRequestSchema = z.object({
  action: StepUpActionSchema,
  context: z.string().min(1),
});

export const StepUpChallengeResponseSchema = z.object({
  challengeId: z.string().uuid(),
  expiresAt: z.string(),
  delivery: z.string(),
});

export const StepUpVerifyRequestSchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().min(1),
});

export const StepUpVerifyResponseSchema = z.object({
  stepUpToken: z.string().min(1),
  expiresAt: z.string(),
});

// ==========================================
// 3. WALLETS & TREASURY SCHEMAS
// ==========================================

export const WalletResponseSchema = z.object({
  id: z.string().uuid(),
  currency: CurrencySchema,
  walletType: WalletTypeSchema,
  balance: z.number(),
  lockedBalance: z.number(),
  availableBalance: z.number(),
  status: WalletStatusSchema,
});

export const TreasuryRebalanceSchema = z.object({
  sourceCurrency: CurrencySchema,
  withdrawAmount: z.number().positive("Amount must be greater than zero"),
  targetCurrency: CurrencySchema,
  depositAmount: z.number().positive("Amount must be greater than zero"),
  notes: z.string().min(5, "Rebalance reason/notes are required for audit trail"),
});

export const AdminMessageResponseSchema = z.object({
  message: z.string(),
});

// ==========================================
// 4. TRANSACTIONS & DOUBLE-ENTRY LEDGER
// ==========================================

export const AdminTransactionSchema = z.object({
  transactionId: z.string().uuid(),
  senderName: z.string(),
  senderEmail: z.string().email(),
  beneficiaryName: z.string(),
  beneficiaryAccount: z.string(),
  
  sourceCurrency: CurrencySchema,
  destinationCurrency: CurrencySchema,
  
  // Ledger Amounts
  grossAmount: z.number(),
  netAmount: z.number(),
  destinationAmount: z.number(),
  exchangeRate: z.number(),
  usdNormalizationRate: z.number(),
  markupFee: z.number(),
  routingFee: z.number(),
  totalFee: z.number(),
  
  status: TransactionStatusSchema,
  gatewayReference: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const LedgerEntrySchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid(),
  walletId: z.string().uuid(),
  entryClass: EntryClassSchema,
  debit: z.number(),
  credit: z.number(),
  amount: z.number(), // Net impact (credit - debit)
  balanceAfter: z.number(),
  currency: CurrencySchema,
  description: z.string(),
  createdAt: z.string(),
});

// ==========================================
// 5. DASHBOARD METRICS & PAGINATION WRAPPERS
// ==========================================

export const DashboardMetricsSchema = z.object({
  totalTransactionsToday: z.number(),
  pendingTransactions: z.number(),
  flaggedTransactions: z.number(),
  totalRevenueToday: z.number(),
  netMarkupRevenueToday: z.number(),
  completedTransactionsToday: z.number(),
});


export const createPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    totalPages: z.number().optional(),
    totalElements: z.number().optional(),
    size: z.number().optional(),
    number: z.number().optional(),
    page: z.object({
      size: z.number(),
      number: z.number(),
      totalElements: z.number(),
      totalPages: z.number(),
    }).optional(),
  }).transform((data) => ({
    content: data.content,
    totalPages: data.totalPages ?? data.page?.totalPages ?? 0,
    totalElements: data.totalElements ?? data.page?.totalElements ?? 0,
    size: data.size ?? data.page?.size ?? 20,
    number: data.number ?? data.page?.number ?? 0,
  }));

export const PaginatedAdminTransactionsSchema = createPaginatedSchema(AdminTransactionSchema);
export const PaginatedAdminUsersSchema = createPaginatedSchema(AdminUserSchema);
export const PaginatedLedgerEntriesSchema = createPaginatedSchema(LedgerEntrySchema);
export const PaginatedWalletsSchema = createPaginatedSchema(WalletResponseSchema);

// ==========================================
// 6. INFERRED TYPESCRIPT TYPES
// ==========================================

export type Currency = z.infer<typeof CurrencySchema>;
export type WalletType = z.infer<typeof WalletTypeSchema>;
export type WalletStatus = z.infer<typeof WalletStatusSchema>;
export type StepUpAction = z.infer<typeof StepUpActionSchema>;
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;
export type KycStatus = z.infer<typeof KycStatusSchema>;
export type EntryClass = z.infer<typeof EntryClassSchema>;

export type AdminUser = z.infer<typeof AdminUserSchema>;
export type KycReviewRequest = z.infer<typeof KycReviewRequestSchema>;
export type WalletResponse = z.infer<typeof WalletResponseSchema>;
export type TreasuryRebalance = z.infer<typeof TreasuryRebalanceSchema>;
export type StepUpChallengeRequest = z.infer<typeof StepUpChallengeRequestSchema>;
export type StepUpChallengeResponse = z.infer<typeof StepUpChallengeResponseSchema>;
export type StepUpVerifyRequest = z.infer<typeof StepUpVerifyRequestSchema>;
export type StepUpVerifyResponse = z.infer<typeof StepUpVerifyResponseSchema>;
export type AdminMessageResponse = z.infer<typeof AdminMessageResponseSchema>;
export type AdminTransaction = z.infer<typeof AdminTransactionSchema>;
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
export type PaginatedAdminTransactions = z.infer<typeof PaginatedAdminTransactionsSchema>;
export type PaginatedAdminUsers = z.infer<typeof PaginatedAdminUsersSchema>;
export type PaginatedLedgerEntries = z.infer<typeof PaginatedLedgerEntriesSchema>;
export type PaginatedWallets = z.infer<typeof PaginatedWalletsSchema>;
