import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, afterAll, beforeAll } from 'vitest';
import { server } from './msw/server';

// ── MSW lifecycle ──────────────────────────────────────────────────────────
// Start the network interceptor before any test runs. Unhandled requests fail
// loudly so new endpoints can't silently bypass the API contract.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Fresh handlers + unmounted DOM for every test (no leakage between cases)
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
