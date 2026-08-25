import { http, HttpResponse, delay } from 'msw';
import type { Wallet } from '../../features/wallet/validation/walletSchema';

/** Base URL matches apiClient's fallback (no VITE_API_BASE_URL in test env) */
export const API_BASE_URL = 'http://localhost:8080/api/v1';

// Valid v4 UUIDs satisfying z.string().uuid() everywhere
export const WALLET_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
export const BENEFICIARY_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
export const TX_ID = 'b4c5d6e7-f8a9-4b0c-8d1e-2f3a4b5c6d7e';

// ── Fixture builders ───────────────────────────────────────────────────────
export const makeWallet = (overrides: Record<string, unknown> = {}) => ({
  id: WALLET_ID,
  currency: 'KES',
  balance: 26000,
  lockedBalance: 1000,
  availableBalance: 25000,
  status: 'ACTIVE',
  ...overrides,
});

export const makeLedgerPage = () => ({
  content: [
    {
      id: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
      transactionId: TX_ID,
      walletId: WALLET_ID,
      entryClass: 'PRIMARY',
      debit: 0,
      credit: 5000,
      amount: 5000,
      balanceAfter: 25000,
      currency: 'KES',
      description: 'Top-up via Flutterwave',
      createdAt: new Date().toISOString(),
    },
  ],
  totalPages: 1,
  totalElements: 1,
  size: 5,
  number: 0,
});

export const makeBeneficiary = (overrides: Record<string, unknown> = {}) => ({
  id: BENEFICIARY_ID,
  firstName: 'Amina',
  lastName: 'Otieno',
  beneficiaryType: 'INDIVIDUAL',
  email: 'amina.otieno@example.com',
  phoneNumber: '+254700000001',
  countryCode: 'KE',
  payoutMethod: 'MOBILE_MONEY',
  payoutProvider: 'MPESA',
  accountNumber: '254700000001',
  accountCurrency: 'USD',
  ...overrides,
});

export const makeTxResponse = () => ({
  id: TX_ID,
  senderId: 'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a',
  sourceWalletId: WALLET_ID,
  beneficiaryId: BENEFICIARY_ID,
  sourceCurrency: 'KES',
  destinationCurrency: 'USD',
  grossAmount: 100,
  netAmount: 99,
  markupFee: 0.5,
  routingFee: 0.5,
  totalFee: 1,
  amountReceived: 0.77,
  fxRateApplied: 0.0077,
  usdNormalizationRate: 129.87,
  reference: 'RTP-TEST-001',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
});

// ── Default handlers (happy path for every endpoint the app calls) ────────
export const handlers = [
  http.get(`${API_BASE_URL}/wallets`, async () => {
    await delay(10);
    return HttpResponse.json(makeWallet());
  }),

  http.get(`${API_BASE_URL}/ledgers/statement`, async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    return HttpResponse.json({
      ...makeLedgerPage(),
      number: Number(url.searchParams.get('page') ?? 0),
    });
  }),

  http.get(`${API_BASE_URL}/beneficiaries`, async () => {
    await delay(10);
    return HttpResponse.json([makeBeneficiary()]);
  }),

  http.get(`${API_BASE_URL}/fx-rates/quote`, async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    const source = url.searchParams.get('source') ?? 'KES';
    const destination = url.searchParams.get('destination') ?? 'USD';
    return HttpResponse.json({
      sourceCurrency: source,
      destinationCurrency: destination,
      // String-encoded BigDecimal, exactly like Jackson serializes it
      exchangeRate: source === 'KES' && destination === 'USD' ? '0.0077' : 1.25,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
  }),

  http.post(`${API_BASE_URL}/transactions/send`, async () => {
    await delay(10);
    return HttpResponse.json(makeTxResponse());
  }),
];
