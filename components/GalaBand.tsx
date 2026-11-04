import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { GalaTicketButton } from './GalaTicketButton';
import { GALA, GALA_TICKET_TIERS, formatDollars, useGalaPromo } from '../src/gala';

/**
 * Home-page feature band for the gala: when, where, what to expect, and every
 * ticket tier with its price. Disappears after the event date.
 */
export const GalaBand: React.FC = () => {
  const promo = useGalaPromo();
  if (!promo.active) return null;

  const details = [
    { icon: Calendar, text: GALA.DATE_LABEL },
    { icon: Clock, text: `${GALA.TIME_LABEL} · ${GALA.DOORS_LABEL}` },
    { icon: MapPin, text: `${GALA.VENUE}, ${GALA.ADDRESS}` },
    { icon: Users, text: GALA.AUDIENCE },
  ];

  return (
    <section
      aria-labelledby="gala-heading"
      className="py-24 bg-surface border-t-4 border-brand-crimson"
    >
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-start">
        {/* Story + details */}
        <div>
          <p className="inline-block bg-brand-crimson text-white font-mono text-[10px] uppercase tracking-[0.3em] font-bold px-3 py-1.5 mb-6">
            Save the Date{promo.countdown ? ` · ${promo.countdown}` : ''}
          </p>
          <h2 id="gala-heading" className="text-4xl md:text-5xl font-serif italic text-text mb-6">
            {GALA.TITLE}
          </h2>
          <p className="text-lg text-text-muted leading-relaxed mb-8">
            Rebuilt Village&rsquo;s first annual fundraising gala, held to kick off the holiday
            season. Enjoy food and drinks, see local student films, learn about our upcoming arts
            programs, and bid in the silent auction. Proceeds support youth film and arts
            programming.
          </p>

          <ul className="space-y-3 mb-10" role="list">
            {details.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-text">
                <Icon size={16} className="text-primary shrink-0 mt-1" aria-hidden="true" />
                <span className="font-mono text-xs uppercase tracking-widest leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <GalaTicketButton placement="home-band" size="lg" className="w-full sm:w-auto">
              Get Tickets
            </GalaTicketButton>
            <Link to="/events">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Event Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Ticket tiers, dated */}
        <div className="border border-border bg-background p-6 md:p-8">
          <h3 className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] font-bold mb-1">
            Tickets
          </h3>
          <p className="text-text font-serif italic text-xl mb-6">
            {`For ${GALA.DATE_LABEL} · ${GALA.TIME_LABEL}`}
          </p>
          <ul role="list" className="divide-y divide-border">
            {GALA_TICKET_TIERS.map((tier) => (
              <li key={tier.name} className="flex items-start justify-between gap-6 py-4">
                <div>
                  <p className="text-text font-serif text-lg leading-tight">{tier.name}</p>
                  <p className="text-xs text-text-muted leading-relaxed mt-1">{tier.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-text font-serif italic text-2xl leading-none">
                    {formatDollars(tier.price)}
                  </p>
                  <p className="font-mono text-[10px] text-text-muted mt-1.5 tracking-wide">
                    {`${formatDollars(tier.total)} with fees`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-text-muted leading-relaxed">
            A service fee is added at checkout. Tickets are sold on OpenDate.
          </p>
        </div>
      </div>
    </section>
  );
};
