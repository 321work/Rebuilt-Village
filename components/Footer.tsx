import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ExternalLink,
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Twitter,
  Youtube,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Nav column definitions ───────────────────────────────────────────────────
const NAV_COLUMNS = [
  {
    heading: 'Organization',
    color: '#1B4FBE', // brand blue — trust / governance
    links: [
      { label: 'About Us',        path: '/about'     },
      { label: 'Board of Directors', path: '/board'  },
      { label: 'Financial Documents', path: '/documents' },
      { label: 'FAQ',             path: '/faq'       },
      { label: 'Privacy Policy',  path: '/privacy'   },
      { label: 'Terms of Service', path: '/terms'    },
    ],
  },
  {
    heading: 'Programs',
    color: '#4A9E52', // brand green — film / education
    links: [
      { label: 'Cinematography Bootcamp', path: '/programs' },
      { label: 'Narrative Preservation',  path: '/programs' },
      { label: "Director's Masterclass",  path: '/programs' },
      { label: 'All Programs',            path: '/programs' },
    ],
  },
  {
    heading: 'Community',
    color: '#2DBFA0', // brand teal — community / growth
    links: [
      { label: 'Events Calendar', path: '/events'  },
      { label: 'Blog & Stories',  path: '/blog'    },
      { label: 'Contact Us',      path: '/contact' },
      { label: 'Volunteer',       path: '/contact' },
    ],
  },
  {
    heading: 'Give',
    color: '#C9A84C', // brand gold — fundraising
    links: [
      { label: 'Donate Now',          path: '/donate'  },
      { label: 'General Fund',        path: '/donate'  },
      { label: 'Restricted Projects', path: '/donate'  },
      { label: 'Corporate Sponsors',  path: '/contact' },
      { label: 'Employer Matching',   path: '/contact' },
    ],
  },
] as const;

// ─── Social links ─────────────────────────────────────────────────────────────
const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/rebuiltvillage',
    icon: <Instagram size={16} aria-hidden="true" />,
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/rebuiltvillage',
    icon: <Facebook size={16} aria-hidden="true" />,
  },
  {
    label: 'Twitter / X',
    href: 'https://twitter.com/rebuiltvillage',
    icon: <Twitter size={16} aria-hidden="true" />,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@rebuiltvillage',
    icon: <Youtube size={16} aria-hidden="true" />,
  },
] as const;

// ─── Newsletter signup ────────────────────────────────────────────────────────
const NewsletterSignup: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, formType: 'newsletter' }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 bg-brand-gold/10 border border-brand-gold/30 px-5 py-4">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Check size={13} className="text-primary-foreground" aria-hidden="true" />
        </div>
        <div>
          <p className="font-mono text-[11px] font-bold text-primary uppercase tracking-widest">You're on the list.</p>
          <p className="font-mono text-[10px] text-text-muted mt-0.5">We'll be in touch with news and impact updates.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="footer-newsletter" className="block font-mono text-[10px] text-text-muted uppercase tracking-widest mb-3">
        Email Address
      </label>
      <div className="flex gap-0">
        <input
          id="footer-newsletter"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address for newsletter"
          className={[
            'flex-1 bg-surface border border-border border-r-0',
            'px-4 py-3 text-text text-sm font-sans',
            'placeholder:text-text-muted/40',
            'focus:outline-none focus:border-primary',
            'transition-colors duration-200',
          ].join(' ')}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          aria-label="Subscribe to newsletter"
          className={[
            'px-4 py-3 shrink-0',
            'bg-primary text-primary-foreground',
            'border border-primary',
            'font-mono text-[11px] font-bold uppercase tracking-widest',
            'hover:bg-brand-gold-light transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/60',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {status === 'loading'
            ? <span className="animate-pulse">···</span>
            : <ArrowRight size={15} aria-hidden="true" />
          }
        </button>
      </div>
      {status === 'error' && (
        <p role="alert" className="mt-2 font-mono text-[10px] text-red-400 uppercase tracking-widest">
          Something went wrong — please try again.
        </p>
      )}
    </form>
  );
};

// ─── Main Footer ──────────────────────────────────────────────────────────────
export const Footer: React.FC = () => {
  const ref           = useRef<HTMLElement>(null);
  const inView        = useInView(ref, { once: true, margin: '-80px' });
  const prefersReduced = useReducedMotion();
  const year          = new Date().getFullYear();

  return (
    <footer
      ref={ref}
      role="contentinfo"
      className="bg-brand-black border-t border-primary/15"
    >
      {/* ── Main footer body ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* ── Brand column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-4">
            {/* Logo */}
            <Link
              to="/"
              aria-label="Rebuilt Village — return to homepage"
              className="inline-flex items-center gap-3 mb-6 focus:outline-none focus:ring-2 focus:ring-primary/60 rounded group"
            >
              <img
                src="/assets/brand/logo-icon.svg"
                alt=""
                aria-hidden="true"
                width={48}
                height={48}
                loading="eager"
                decoding="async"
                className="h-12 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="flex flex-col leading-none">
                <span className="font-display font-semibold text-primary uppercase tracking-[0.18em] text-sm group-hover:text-brand-gold-light transition-colors">
                  Rebuilt Village
                </span>
                <span className="font-mono text-[9px] text-white/50 uppercase tracking-[0.25em] mt-1">
                  Est. 2025 · Orlando, FL
                </span>
              </div>
            </Link>

            {/* Tagline */}
            <p className="font-serif text-white/80 text-sm leading-relaxed mb-6 max-w-xs">
              Enriching the community through the art of film. We empower local voices to capture personal stories and preserve them for future generations.
            </p>

            {/* Location */}
            <div className="flex items-start gap-2 mb-8 text-white/70">
              <MapPin size={13} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                Orlando, Florida<br />Orange County
              </span>
            </div>

            {/* Newsletter */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Mail size={12} className="text-primary" aria-hidden="true" />
                <span className="font-display text-xs font-medium text-white uppercase tracking-widest">
                  The Call Sheet
                </span>
              </div>
              <p className="font-mono text-[10px] text-white/60 uppercase tracking-widest mb-4">
                News, screenings & community updates.
              </p>
              <NewsletterSignup />
            </div>

            {/* Social links */}
            <div>
              <p className="font-mono text-[10px] text-white/50 uppercase tracking-widest mb-3">Follow Us</p>
              <div className="flex items-center gap-2" role="list" aria-label="Social media links">
                {SOCIALS.map(social => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} (opens in new tab)`}
                    role="listitem"
                    className={[
                      'w-9 h-9 flex items-center justify-center',
                      'border border-border text-text-muted',
                      'hover:border-primary hover:text-primary hover:bg-primary/5',
                      'transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary/60 rounded',
                    ].join(' ')}
                  >
                    {social.icon}
                    <ExternalLink size={0} aria-hidden="true" className="sr-only" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Nav columns ──────────────────────────────────────────────── */}
          <nav
            aria-label="Footer navigation"
            className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8"
          >
            {NAV_COLUMNS.map((col, colIdx) => (
              <motion.div
                key={col.heading}
                initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + colIdx * 0.07, duration: 0.4 }}
              >
                {/* Column heading with art-form accent color */}
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                    aria-hidden="true"
                  />
                  <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/70">
                    {col.heading}
                  </h3>
                </div>

                <ul className="space-y-3" role="list">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className={[
                          'font-mono text-[11px] text-white/60 uppercase tracking-widest',
                          'hover:text-primary transition-colors duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-primary/60 rounded',
                          'inline-block',
                        ].join(' ')}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Donate CTA strip ─────────────────────────────────────────────── */}
      <div className="border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display text-sm font-medium text-white uppercase tracking-widest mb-1">
                Ready to make an impact?
              </p>
              <p className="font-mono text-[10px] text-white/70 uppercase tracking-widest">
                Support film education with a tax-deductible gift
              </p>
            </div>
            <Link
              to="/donate"
              className={[
                'inline-flex items-center gap-2 shrink-0',
                'px-8 py-3.5',
                'bg-primary text-primary-foreground',
                'font-mono text-xs font-bold uppercase tracking-widest',
                'hover:bg-brand-gold-light hover:shadow-gold',
                'transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-brand-black',
                'animate-glow-pulse',
              ].join(' ')}
              aria-label="Donate to Rebuilt Village — fully tax deductible 501(c)(3)"
            >
              <Heart size={14} aria-hidden="true" />
              Support Our Mission
            </Link>
          </div>
        </div>
      </div>

      {/* ── Legal bottom bar ─────────────────────────────────────────────── */}
      <div className="border-t border-primary/10 bg-brand-off-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Left: legal copy */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest">
                © {year} Rebuilt Village, Inc.
              </p>
              <span className="hidden sm:block w-px h-3 bg-border/40" aria-hidden="true" />
              <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest">
                501(c)(3) Nonprofit
              </p>
              <span className="hidden sm:block w-px h-3 bg-border/40" aria-hidden="true" />
              <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest">
                EIN: 93-XXXXXXX
              </p>
            </div>

            {/* Right: legal links */}
            <div className="flex items-center gap-5">
              {[
                { label: 'FAQ',           path: '/faq'           },
                { label: 'Privacy',       path: '/privacy'       },
                { label: 'Terms',         path: '/terms'         },
                { label: 'Accessibility', path: '/accessibility' },
              ].map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={[
                    'font-mono text-[9px] text-white/50 uppercase tracking-widest',
                    'hover:text-white/80 transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary/60 rounded',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              ))}

              {/* Charity commitment badge */}
              <div className="hidden sm:flex items-center gap-1.5 border border-border/30 px-3 py-1.5 rounded-full">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                  aria-hidden="true"
                />
                <span className="font-mono text-[9px] text-white/60 uppercase tracking-widest">
                  Radical Transparency
                </span>
              </div>
            </div>
          </div>

          {/* Decorative gold rule */}
          <div
            className="mt-5 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            aria-hidden="true"
          />

          {/* Tree color strip — a visual nod to the logo */}
          <div className="mt-3 flex h-0.5 rounded-full overflow-hidden" aria-hidden="true">
            {['#2DBFA0', '#4A9E52', '#DC267F', '#C0392B', '#7B2FBE', '#C9A84C', '#1B4FBE', '#E07B00'].map(color => (
              <div key={color} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
