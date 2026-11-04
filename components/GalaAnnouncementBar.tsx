import React from 'react';
import { GALA, galaTicketsUrl } from '../src/gala';

interface GalaAnnouncementBarProps {
  /** False once the page is scrolled; the strip slides away and stops taking focus. */
  visible: boolean;
  countdown: string | null;
}

/**
 * Thin red strip fixed above the header on every page while the gala is coming
 * up. The header sits 32px lower while it shows (see ViewfinderNav).
 */
export const GalaAnnouncementBar: React.FC<GalaAnnouncementBarProps> = ({ visible, countdown }) => (
  <div
    role="region"
    aria-label="Gala announcement"
    // inert removes the hidden strip's link from the tab order and screen readers.
    inert={!visible}
    className={[
      'fixed top-0 left-0 right-0 z-[51] h-8 bg-brand-crimson text-white',
      'transition-all duration-500 motion-reduce:transition-none',
      visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none',
    ].join(' ')}
  >
    <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 sm:gap-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest">
      <span className="font-bold truncate">{GALA.TITLE}</span>
      <span className="hidden sm:inline" aria-hidden="true">·</span>
      <span className="hidden sm:inline whitespace-nowrap">
        {`Sat ${GALA.DATE_SHORT} · ${GALA.TIME_LABEL.replace(':00', '')}`}
      </span>
      {countdown && (
        <>
          <span className="hidden md:inline" aria-hidden="true">·</span>
          <span className="hidden md:inline whitespace-nowrap">{countdown}</span>
        </>
      )}
      <a
        href={galaTicketsUrl('announcement-bar')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get tickets for the ${GALA.TITLE} on ${GALA.DATE_SHORT} (opens in a new tab)`}
        className="ml-1 sm:ml-2 font-bold underline underline-offset-4 decoration-white/60 hover:decoration-white whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white/80 rounded-sm"
      >
        Get Tickets &rarr;
      </a>
    </div>
  </div>
);
