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
  // The library registers the element quickly, but the form itself is an iframe
  // that arrives later. Until it has, show a placeholder instead of a blank box.
  const [formShown, setFormShown] = useState(false);

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

  useEffect(() => {
    if (status !== 'ready') return;
    let done = false;
    let settle: number | undefined;
    const finish = () => {
      if (!done) {
        done = true;
        setFormShown(true);
      }
    };
    // Never hide the form for good: show it after 12 seconds no matter what.
    const fallback = window.setTimeout(finish, 12_000);
    let observer: PerformanceObserver | undefined;
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        observer = new PerformanceObserver((list) => {
          // The form frame loads from givebutter.com/embed/...; once it has, give
          // it a moment to paint.
          if (list.getEntries().some((entry) => /givebutter\.com\/embed\//.test(entry.name))) {
            settle = window.setTimeout(finish, 400);
          }
        });
        observer.observe({ type: 'resource', buffered: true });
      } catch {
        /* the 12 second fallback still applies */
      }
    }
    return () => {
      window.clearTimeout(fallback);
      if (settle !== undefined) window.clearTimeout(settle);
      observer?.disconnect();
    };
  }, [status]);

  const waiting = status !== 'failed' && !formShown;

  return (
    <div
      aria-busy={waiting}
      className={`relative ${waiting ? 'min-h-[560px]' : 'min-h-[160px]'}`}
    >
      {waiting && (
        <div className="absolute inset-0" aria-hidden="false">
          <p
            role="status"
            className="text-xs font-mono text-text-muted uppercase tracking-widest text-center pb-6"
          >
            Loading the secure giving form...
          </p>
          <div
            aria-hidden="true"
            className="mx-auto max-w-sm space-y-3 animate-pulse motion-reduce:animate-none"
          >
            <div className="h-12 rounded-xl bg-border/50" />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-14 rounded-xl bg-border/40" />
              ))}
            </div>
            <div className="h-14 rounded-xl bg-border/40" />
            <div className="h-14 rounded-xl bg-border/30" />
          </div>
        </div>
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
            className="inline-flex text-xs font-mono text-primary-text hover:underline uppercase tracking-widest"
          >
            Contact us about giving
          </Link>
        </div>
      )}
      {status !== 'failed' && (
        <div className={waiting ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
          <givebutter-widget id={GIVEBUTTER.WIDGET_ID}></givebutter-widget>
        </div>
      )}
    </div>
  );
};
