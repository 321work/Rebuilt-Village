import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, Clock, ExternalLink, MapPin, Ticket } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { Event } from '../types';
import { getEvents } from '../services/sanityService';

// ─── Accent color map (inline styles to avoid undefined CSS var bugs) ────────
const TYPE_STYLE: Record<Event['type'], { color: string; label: string }> = {
  festival:    { color: '#E5A916', label: 'Festival'   },
  workshop:    { color: '#E5A916', label: 'Workshop'   },
  screening:   { color: '#2DBFA0', label: 'Screening'  },
  community:   { color: '#2DBFA0', label: 'Community'  },
  fundraiser:  { color: '#7C3AED', label: 'Fundraiser' },
};

// ─── Fallback events (hardcoded) ─────────────────────────────────────────────
// Used when Sanity has no events yet or is unreachable. Jess/Amanda can manage
// events via Sanity Studio once it's deployed to studio.rebuiltvillage.org.
const FALLBACK_EVENTS: Event[] = [
  // ── UPCOMING ──────────────────────────────────────────────────────────────

  {
    id: 'workshop-spring-2026',
    title: 'Spring Cinematography Workshop',
    date: '2026-04-05',
    day: '05',
    month: 'APR',
    year: '2026',
    time: '10:00 AM – 2:00 PM',
    location: 'John H. Jackson Community Center, Orlando, FL',
    description:
      'Open to all community members. Hands-on training in camera operation, basic lighting, and storytelling fundamentals using Blackmagic Cinema cameras. No experience required — just bring your curiosity.',
    type: 'workshop',
    tags: ['All Ages', 'Free'],
  },

  {
    id: 'film-apalooza-2026',
    title: 'Film-apalooza at Dr. Phillips',
    date: '2026-05-15',
    dateEnd: '2026-05-17',
    day: '15',
    month: 'MAY',
    year: '2026',
    time: 'May 15–17 · 9:00 AM – 10:00 PM',
    location: 'Dr. Phillips High School, Orlando, FL',
    description:
      'A three-day community film festival celebrating emerging local voices. Rebuilt Village is a proud sponsor of this event alongside our partners in the Florida film community. Day 1: Opening night screenings. Day 2: Filmmaker panels and hands-on workshops. Day 3: Awards ceremony and closing reception.',
    type: 'festival',
    featured: true,
    sponsoredBy: 'Rebuilt Village',
    registrationUrl: '/contact',
    tags: ['Multi-Day', 'All Ages', 'Awards'],
  },

  {
    id: 'summer-camp-2026',
    title: 'Summer Cinematography Camp',
    date: '2026-07-13',
    dateEnd: '2026-07-24',
    day: '13',
    month: 'JUL',
    year: '2026',
    time: 'July 13–24 · 9:00 AM – 3:00 PM (Weekdays)',
    location: 'John H. Jackson Community Center, Orlando, FL',
    description:
      'Our flagship two-week summer intensive for youth ages 14–18. Students gain hands-on experience with Blackmagic and RED cameras, lighting rigs, color grading labs, and sound design — then premiere their original short films at a closing screening open to family and community.',
    type: 'workshop',
    featured: false,
    registrationUrl: '/programs',
    tags: ['Ages 14–18', 'Free to Students', '2 Weeks'],
  },

  {
    id: 'winter-gala-2026',
    title: 'Annual Fundraising Gala',
    date: '2026-11-14',
    day: '14',
    month: 'NOV',
    year: '2026',
    time: '6:00 PM – 10:00 PM',
    location: 'TBD · Orlando Area',
    description:
      'Rebuilt Village\'s first annual fundraising gala celebrating one year of impact. An evening of short film screenings, live entertainment, and a silent auction supporting youth program scholarships. Sponsorship packages available.',
    type: 'fundraiser',
    registrationUrl: '/contact',
    tags: ['Fundraiser', '21+', 'Sponsorships Available'],
  },

  // ── PAST ──────────────────────────────────────────────────────────────────

  {
    id: 'inaugural-screening-2026',
    title: 'Inaugural Community Screening Night',
    date: '2026-01-25',
    day: '25',
    month: 'JAN',
    year: '2026',
    time: '6:30 PM – 9:00 PM',
    location: 'John H. Jackson Community Center, Orlando, FL',
    description:
      'Our first public event since founding in January 2025. We screened three short films produced through early programming and introduced Rebuilt Village to the broader Orlando community.',
    type: 'screening',
    tags: ['Free', 'Community'],
  },

  {
    id: 'donor-preview-2026',
    title: 'Equipment Showcase & Donor Preview',
    date: '2026-02-08',
    day: '08',
    month: 'FEB',
    year: '2026',
    time: '2:00 PM – 5:00 PM',
    location: 'Rebuilt Minds Studio, Orlando, FL',
    description:
      'An invitation-only preview for supporters and prospective donors. Attendees got a firsthand look at the camera inventory, met the board, and heard the vision for the Film Equipment Fund and 2026 programming season.',
    type: 'community',
    tags: ['Invite Only', 'Donors'],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isPastEvent(event: Event): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const endDate = event.dateEnd ?? event.date;
  return endDate < today;
}

// ─── Events page ─────────────────────────────────────────────────────────────
export const Events: React.FC = () => {
  usePageMeta(
    'Events — Rebuilt Village',
    'Screenings, workshops, festivals, and community events hosted by Rebuilt Village in Orlando, Florida. Find upcoming film events and add them to your calendar.'
  );
  const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);

  useEffect(() => {
    getEvents()
      .then((sanityEvents) => {
        if (sanityEvents.length > 0) {
          setEvents(sanityEvents);
        }
        // If Sanity returns empty (Studio not yet populated), keep fallback data
      })
      .catch(() => {
        // Silently keep fallback data if Sanity is unreachable
      });
  }, []);

  const upcoming = events.filter((e) => !isPastEvent(e));
  const past     = events.filter((e) => isPastEvent(e));

  return (
    <article aria-label="Rebuilt Village events calendar">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Section bg="black" className="pt-32">
        <div className="text-center">
          <p className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
            Call Sheet
          </p>
          <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8">
            Calendar of Events
          </h1>
          <div className="h-1 w-24 bg-primary/30 mx-auto mb-10" />
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
            Workshops, screenings, and community gatherings. Mark your calendar for the 2026 production season.
          </p>
        </div>
      </Section>

      {/* ── Upcoming Events ──────────────────────────────────────────────── */}
      <Section bg="black">
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center gap-4 mb-12">
            <Calendar size={16} className="text-primary" aria-hidden="true" />
            <h2 className="font-mono text-[11px] text-primary uppercase tracking-[0.4em] font-bold">
              Upcoming · 2026
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-10" role="list" aria-label="Upcoming events">
            {upcoming.map((event, idx) => (
              <EventCard key={event.id} event={event} index={idx} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── Past Events ──────────────────────────────────────────────────── */}
      {past.length > 0 && (
        <Section bg="black">
          <div className="max-w-4xl mx-auto">

            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-border" />
              <h2 className="font-mono text-[11px] text-text-muted/50 uppercase tracking-[0.4em] font-bold">
                Past Events
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-10 opacity-60" role="list" aria-label="Past events">
              {past.map((event, idx) => (
                <EventCard key={event.id} event={event} index={idx} past />
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── Book a Masterclass CTA ───────────────────────────────────────── */}
      <Section bg="black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center border border-dashed border-border p-12 bg-surface-highlight">
            <h3 className="text-text font-serif italic text-2xl mb-6">
              Host a Workshop or Screening
            </h3>
            <p className="text-text-muted text-sm font-light mb-8 leading-relaxed max-w-lg mx-auto">
              Interested in booking a private filmmaking workshop or community screening for your school
              or organization? Let's talk.
            </p>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Contact the Production Office
              </Button>
            </Link>
          </div>
        </div>
      </Section>

    </article>
  );
};

// ─── EventCard ────────────────────────────────────────────────────────────────
interface EventCardProps {
  event: Event;
  index: number;
  past?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, index, past = false }) => {
  const prefersReduced = useReducedMotion();
  const typeStyle  = TYPE_STYLE[event.type] ?? TYPE_STYLE.community;
  const accentHex  = event.accentColor ?? typeStyle.color;
  const isFeatured = event.featured && !past;

  return (
    <motion.div
      role="listitem"
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: prefersReduced ? 0 : index * 0.07 }}
      className={`group relative bg-surface/40 border p-8 transition-all duration-500 hover:shadow-2xl ${
        isFeatured
          ? 'border-primary/60 hover:border-primary hover:shadow-primary/10'
          : 'border-border hover:border-primary/40 hover:shadow-primary/5'
      }`}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div
          className="absolute top-0 left-0 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-black font-bold"
          style={{ backgroundColor: accentHex }}
          aria-label="Featured event"
        >
          Featured Event
        </div>
      )}

      <div className={`flex flex-col md:flex-row gap-10 ${isFeatured ? 'mt-6' : ''}`}>

        {/* Date Side */}
        <div className="flex flex-col items-center justify-start shrink-0 w-24 pt-1">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2"
            style={{ color: accentHex }}
          >
            {event.month}
          </span>
          <span className="text-5xl font-serif italic text-text leading-none">
            {event.day}
          </span>
          {event.dateEnd && (
            <span className="font-mono text-[9px] text-text-muted mt-1 uppercase tracking-wider">
              – {event.dateEnd.split('-')[2]}
            </span>
          )}
          <div className="h-px w-10 bg-border mt-3" />
          {event.year && (
            <span className="font-mono text-[9px] text-text-muted/50 mt-2 tracking-wider">
              {event.year}
            </span>
          )}
        </div>

        {/* Content Side */}
        <div className="flex-grow min-w-0">

          {/* Type badge + tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="font-mono text-[9px] px-2 py-0.5 border uppercase tracking-widest"
              style={{ borderColor: `${accentHex}80`, color: accentHex }}
            >
              {typeStyle.label}
            </span>
            {event.sponsoredBy && (
              <span className="font-mono text-[9px] px-2 py-0.5 border border-border text-text-muted uppercase tracking-widest">
                Sponsored by {event.sponsoredBy}
              </span>
            )}
            {event.tags?.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] px-2 py-0.5 bg-surface border border-border text-text-muted uppercase tracking-widest"
              >
                {tag}
              </span>
            ))}
            {past && (
              <span className="font-mono text-[9px] px-2 py-0.5 bg-surface border border-border text-text-muted/40 uppercase tracking-widest">
                Past
              </span>
            )}
          </div>

          {/* Title + CTA row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
            <h3
              className={`text-3xl font-serif italic transition-colors duration-300 ${
                past ? 'text-text/60' : 'text-text group-hover:text-primary'
              }`}
            >
              {event.title}
            </h3>

            {!past && event.registrationUrl && (
              event.registrationUrl.startsWith('http') ? (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                  aria-label={`Register for ${event.title}`}
                >
                  <Button variant="outline" size="sm" className="border-border hover:border-primary flex items-center gap-2">
                    Register <ExternalLink size={12} />
                  </Button>
                </a>
              ) : (
                <Link to={event.registrationUrl} className="shrink-0">
                  <Button variant="outline" size="sm" className="border-border hover:border-primary">
                    {event.type === 'fundraiser' ? 'Get Tickets' : 'Learn More'}
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-6 mb-5">
            <div className="flex items-center text-text-muted font-mono text-[10px] uppercase tracking-widest">
              <Clock size={13} className="mr-2 text-primary shrink-0" aria-hidden="true" />
              {event.time}
            </div>
            <div className="flex items-center text-text-muted font-mono text-[10px] uppercase tracking-widest">
              <MapPin size={13} className="mr-2 text-primary shrink-0" aria-hidden="true" />
              {event.location}
            </div>
          </div>

          {/* Description */}
          <p className={`font-light leading-relaxed text-sm ${past ? 'text-text-muted/60' : 'text-text-muted'}`}>
            {event.description}
          </p>
        </div>
      </div>

      {/* Decorative ticket icon */}
      <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-40 transition-opacity" aria-hidden="true">
        <Ticket size={22} style={{ color: accentHex }} className="rotate-12" />
      </div>
    </motion.div>
  );
};
