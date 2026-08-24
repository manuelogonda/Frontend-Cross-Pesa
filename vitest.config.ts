import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Standalone Vitest config — intentionally does NOT merge vite.config.ts so the
// test runner stays decoupled from Tailwind/production plugins.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setupTests.ts'],
    css: false,
    // Keep noisy console output (e.g. intentional axios warnings) readable
    silent: 'passed-only',
  },
});
