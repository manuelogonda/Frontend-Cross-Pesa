import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { apiClient } from '../../../lib/axios';

/** A financial institution (bank or mobile-money rail) from our Flutterwave proxy. */
export interface PayoutInstitution {
  /** Flutterwave internal id */
  id: number | string;
  /**
   * The ONLY safe value for Beneficiary.bankCode — e.g. '32' (KCB), 'MPS'
   * (M-Pesa KE). Hardcoded guesses fail at payout dispatch and get reversed.
   */
  code: string;
  name: string;
}

// Runtime contract — tolerant of envelope shapes and unusable rows.
const institutionSchema = z.object({
  id: z.union([z.number(), z.string()]),
  code: z.string().min(1), // null-code rows can't route payouts → filtered out
  name: z.string().min(1),
});

const parseInstitutions = (payload: unknown): PayoutInstitution[] => {
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] })?.data)
      ? (payload as { data: unknown[] }).data
      : Array.isArray((payload as { content?: unknown[] })?.content)
        ? (payload as { content: unknown[] }).content
        : [];

  const seen = new Set<string>();
  const out: PayoutInstitution[] = [];
  for (const item of raw) {
    const parsed = institutionSchema.safeParse(item);
    if (!parsed.success || seen.has(parsed.data.code)) continue;
    seen.add(parsed.data.code);
    out.push({ ...parsed.data });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Fetches supported banks/mobile-money networks for a payout country via the
 * backend proxy: GET /api/v1/payouts/banks/{countryCode}.
 *
 * - Skips fetching until countryCode is a valid ISO2 string
 * - Guards against race conditions on rapid country changes (seq counter +
 *   unmount cancellation)
 * - Exposes clean loading / error / empty states for UI branching
 */
export const usePayoutInstitutions = (countryCode?: string) => {
  const [institutions, setInstitutions] = useState<PayoutInstitution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const normalizedCountry = countryCode?.trim().toUpperCase() ?? '';

  useEffect(() => {
    // Invalid/incomplete country → clean empty state, no request
    if (!/^[A-Z]{2}$/.test(normalizedCountry)) {
      setInstitutions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const seq = ++requestSeq.current;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    apiClient
      .get(`/payouts/banks/${normalizedCountry}`)
      .then(({ data }) => {
        if (!cancelled && seq === requestSeq.current) {
          setInstitutions(parseInstitutions(data));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && seq === requestSeq.current) {
          setError(
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              'Could not load banks — you can enter the code manually.'
          );
          setInstitutions([]);
        }
      })
      .finally(() => {
        if (!cancelled && seq === requestSeq.current) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedCountry]);

  return { institutions, isLoading, error };
};