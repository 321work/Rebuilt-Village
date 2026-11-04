import { ExternalLink, Ticket } from 'lucide-react';
import React from 'react';
import { GALA, galaTicketsUrl, type GalaPlacement } from '../src/gala';

interface GalaTicketButtonProps {
  placement: GalaPlacement;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

// Same sizes as components/Button so it sits next to the gold buttons.
const SIZES = {
  sm: 'h-8 px-5 text-[10px]',
  md: 'h-11 px-7 text-xs',
  lg: 'h-14 px-10 text-sm',
};

/**
 * Red ticket link to the gala on OpenDate. Red marks the gala across the site
 * (gold stays for donating). White on brand crimson is about 5.4:1 contrast.
 */
export const GalaTicketButton: React.FC<GalaTicketButtonProps> = ({
  placement,
  size = 'md',
  className = '',
  children = 'Get Tickets',
}) => (
  <a
    href={galaTicketsUrl(placement)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Get tickets for the ${GALA.TITLE} on ${GALA.DATE_SHORT} (opens in a new tab)`}
    className={[
      'inline-flex items-center justify-center gap-2',
      'font-mono font-bold uppercase tracking-widest whitespace-nowrap',
      'bg-brand-crimson text-white',
      'transition-all duration-300 hover:bg-brand-crimson/85 hover:shadow-lg hover:shadow-brand-crimson/40 hover:-translate-y-0.5',
      'focus:outline-none focus:ring-2 focus:ring-brand-crimson/70 focus:ring-offset-2 focus:ring-offset-background',
      SIZES[size],
      className,
    ].join(' ')}
  >
    <Ticket size={size === 'sm' ? 12 : 14} aria-hidden="true" />
    {children}
    <ExternalLink size={size === 'sm' ? 10 : 12} aria-hidden="true" />
  </a>
);
