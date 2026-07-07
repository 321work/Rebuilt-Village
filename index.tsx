import './src/index.css';
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Analytics } from './components/Analytics';
import { CookieConsentBanner } from './components/CookieConsent';

// ─── Axe-core accessibility auditing (dev only) ───────────────────────────────
// if (import.meta.env.DEV) {
//     import('@axe-core/react').then(({ default: axe }) => {
//         axe(React, undefined, 1000);
//     });
// }

const container = document.getElementById('root');
if (!container) {
  throw new Error("Could not find root element to mount to");
}

const app = (
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Analytics />
        <App />
        <CookieConsentBanner />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Hydrate if the root already has prerendered HTML (SSG build); otherwise mount fresh.
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}