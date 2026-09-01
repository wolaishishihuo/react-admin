import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * Standalone on purpose: merging `vite.config.ts` would pull compression,
 * html inject, and vite-plugin-checker into every test run.
 *
 * Vitest's default Vite mode is `test`, so `.env.test` is loaded. That file is
 * this repo's staging *build* env (`pnpm build:test`), not a unit-test sandbox.
 * HTTP is mocked in tests; override with `vitest --mode development` if you need
 * local `VITE_PROXY` values.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src')
    }
  },
  test: {
    dir: './tests',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
    clearMocks: true
  }
});
