import { defineConfig } from 'vitest/config';

// Node-environment config for the Firestore security-rules tests. Kept separate
// from vite.config.ts so the React/browser build pipeline does not load here.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
