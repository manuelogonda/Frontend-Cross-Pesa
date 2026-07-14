import { z } from 'zod';

export const AdminTransactionSchema = z.object({
  transactionId: z.uuid(),
  senderName: z.string(),
  senderEmail: z.email(),
  beneficiaryName: z.string(),
  beneficiaryAccount: z.string(),
  sourceAmount: z.number(),
  sourceCurrency: z.string(),
  destinationAmount: z.number(),
  destinationCurrency: z.string(),
  exchangeRate: z.number(),
  platformFee: z.number(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'FLAGGED']),
  gatewayReference: z.string(),
  createdAt: z.string(),
});

export const DashboardMetricsSchema = z.object({
  totalTransactionsToday: z.number(),
  pendingTransactions: z.number(),
  flaggedTransactions: z.number(),
  totalRevenueToday: z.number(),
});

// Defines the Spring Boot Pagination wrapper
export const PaginatedAdminTransactionSchema = z.object({
  content: z.array(AdminTransactionSchema),
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  number: z.number(), // Current page index (0-based)
});

export type AdminTransaction = z.infer<typeof AdminTransactionSchema>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
export type PaginatedAdminTransactions = z.infer<typeof PaginatedAdminTransactionSchema>;


export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable(),
  idType: z.string().nullable(),
  idNumber: z.string().nullable(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'LOCKED']),
  kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  kycLevel: z.number(),
  createdAt: z.string(),
});

export const PaginatedAdminUsersSchema = z.object({
  content: z.array(AdminUserSchema),
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  number: z.number(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;
export type PaginatedAdminUsers = z.infer<typeof PaginatedAdminUsersSchema>;
