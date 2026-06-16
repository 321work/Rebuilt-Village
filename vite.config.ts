import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const useEmulators = env.VITE_USE_EMULATORS === 'true';
  const projectId = env.VITE_FIREBASE_PROJECT_ID ?? 'rebuilt-village-web';
  const emulatorHost = `http://localhost:5001/${projectId}/us-central1`;

  return {
    server: {
      port: 5174,
      host: true,
      allowedHosts: true,
      // Proxy API calls to Firebase emulators in development
      proxy: useEmulators
        ? {
            '/api/send-email': {
              target: `${emulatorHost}/sendEmail`,
              changeOrigin: true,
              rewrite: () => '',
            },
            '/api/create-checkout-session': {
              target: `${emulatorHost}/createCheckoutSession`,
              changeOrigin: true,
              rewrite: () => '',
            },
          }
        : undefined,
    },
    plugins: [react()],
    // Pre-bundle marked so the lazy-loaded blog route doesn't trigger an
    // on-the-fly dep re-optimization (which races with React init on first load).
    optimizeDeps: {
      include: ['marked'],
    },
    resolve: {
      // Dedupe React to a single copy as a guard against duplicate instances.
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            ui: ['lucide-react', '@headlessui/react'],
            firebase: ['firebase/app', 'firebase/firestore', 'firebase/storage'],
          },
        },
      },
    },
  };
});
