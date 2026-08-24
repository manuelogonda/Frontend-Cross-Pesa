import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'error';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  push: (type: ToastType, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;
const TOAST_TTL_MS = 6000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push: (type, message) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    // Auto-dismiss
    setTimeout(() => useToastStore.getState().dismiss(id), TOAST_TTL_MS);
  },

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Imperative helpers — safe to call from anywhere, including outside React
 * (hooks, axios interceptors, services).
 */
export const toast = {
  info: (message: string) => useToastStore.getState().push('info', message),
  success: (message: string) => useToastStore.getState().push('success', message),
  error: (message: string) => useToastStore.getState().push('error', message),
};
/**
 * Status-code-based API error classification.
 *
 * IMPORTANT: never branch on `err.message` text. Backend wording changes
 * over time (e.g. insufficient-funds / daily-limit messages now read like
 * "would exceed your Tier N daily limit of X KES"), so decisions must be
 * made on HTTP status codes only, with backend messages surfaced verbatim.
 */

export const ApiStatus = {
  /** Bean Validation / business rule rejection */
  BAD_REQUEST: 400,
  /** Business rule violation (e.g. insufficient funds, tier daily limit) */
  UNPROCESSABLE: 422,
  /** Idempotency-key replay / duplicate transaction */
  CONFLICT: 409,
} as const;

export const getApiStatus = (err: unknown): number | undefined =>
  (err as { response?: { status?: number } } | undefined)?.response?.status;

/** HTTP 409 — duplicate transaction detected (idempotency key replayed). */
export const isDuplicateTransaction = (err: unknown): boolean =>
  getApiStatus(err) === ApiStatus.CONFLICT;

/** HTTP 400/422 — request rejected by validation or a business rule. */
export const isBusinessRuleError = (err: unknown): boolean => {
  const status = getApiStatus(err);
  return status === ApiStatus.BAD_REQUEST || status === ApiStatus.UNPROCESSABLE;
};

/**
 * Returns the backend-provided message VERBATIM (no rewriting, no pattern
 * matching), or a safe generic fallback when none exists (e.g. network
 * failures where there is no response body at all).
 */
export const getApiErrorMessage = (
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string =>
  (err as { response?: { data?: { message?: string } } } | undefined)?.response?.data?.message ||
  fallback;
