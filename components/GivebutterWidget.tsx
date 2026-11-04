import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GIVEBUTTER } from '../src/givebutter';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'givebutter-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

// The library registers the <givebutter-widget> element once per page load.
let libraryPromise: Promise<void> | null = null;

function loadLibrary(): Promise<void> {
  if (libraryPromise) return libraryPromise;
  libraryPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = GIVEBUTTER.LIBRARY_URL;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      libraryPromise = null; // allow a retry on the next visit
      reject(new Error('Givebutter library failed to load'));
    };
    document.head.append(script);
  });
  return libraryPromise;
}

/**
 * Inline Givebutter donation form. Givebutter handles amounts, monthly gifts,
 * receipts and recurring-gift management. The library is requested only on
 * pages that render this component.
 */
export const GivebutterWidget: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    let active = true;
    loadLibrary().then(
      () => active && setStatus('ready'),
      () => active && setStatus('failed'),
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <div aria-busy={status === 'loading'} className="min-h-[160px]">
      {status === 'loading' && (
        <p
          role="status"
          className="text-xs font-mono text-text-muted uppercase tracking-widest text-center py-8"
        >
          Loading the secure giving form...
        </p>
      )}
      {status === 'failed' && (
        <div role="alert" className="border border-border bg-surface-highlight p-6 text-center">
          <p className="font-serif italic text-xl text-text mb-3">
            The giving form could not load.
          </p>
          <p className="text-sm text-text-muted leading-relaxed mb-5">
            It may be blocked by a browser extension or your connection. Please refresh the
            page, or contact us and we will help you make your gift.
          </p>
          <Link
            to="/contact"
            className="inline-flex text-xs font-mono text-primary hover:underline uppercase tracking-widest"
          >
            Contact us about giving
          </Link>
        </div>
      )}
      {status !== 'failed' && (
        <givebutter-widget id={GIVEBUTTER.WIDGET_ID}></givebutter-widget>
      )}
    </div>
  );
};
