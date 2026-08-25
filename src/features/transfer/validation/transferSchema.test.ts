import { describe, expect, it } from 'vitest';
import { TransferSchema } from './transferSchema';

const VALID = {
  sourceWalletId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  beneficiaryId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  sourceCurrency: 'KES',
  destinationCurrency: 'USD',
  amount: 100,
} as const;

describe('TransferSchema', () => {
  it('accepts a fully valid payload', () => {
    expect(TransferSchema.safeParse(VALID).success).toBe(true);
  });

  it('rejects a non-positive amount', () => {
    expect(TransferSchema.safeParse({ ...VALID, amount: 0 }).success).toBe(false);
  });

  it('rejects an invalid beneficiary reference', () => {
    const result = TransferSchema.safeParse({ ...VALID, beneficiaryId: 'not-a-uuid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Please select a destination beneficiary.'
      );
    }
  });
});