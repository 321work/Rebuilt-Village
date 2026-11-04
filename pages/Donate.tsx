import { Building2, CheckCircle, ChevronRight, Shield, Users } from 'lucide-react';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';
import { GivebutterWidget } from '../components/GivebutterWidget';
import { ORGANIZATION } from '../src/organization';

/* ─── Component ──────────────────────────────────────────────────────────── */

export const Donate: React.FC = () => {
  usePageMeta(
    'Donate — Rebuilt Village',
    'Support free film education for Orlando youth. Your tax-deductible gift supports film education and mentorship.'
  );

  // Visitors arrive from Donate buttons all over the site. Bring the donation
  // form into view instead of leaving them on the page heading (or, worse, at
  // whatever depth the previous page was scrolled to).
  useEffect(() => {
    document.getElementById('donate-form')?.scrollIntoView({ block: 'start' });
  }, []);

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <Section bg="black" className="pt-32 pb-16 text-center">
        <p className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
          Call For Producers
        </p>
        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8 leading-none">
          Plant the<br />Seed
        </h1>
        <div className="h-1 w-24 bg-primary/30 mx-auto mb-10" />
        <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
          Your investment grows the next generation of visual storytellers.
          Every contribution is tax-deductible and directly benefits youth in Orlando, Florida.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-text-muted">
          <Users size={14} className="text-primary" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            Join our growing community of supporters
          </span>
        </div>
      </Section>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <Section bg="black">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-16 items-start">

          {/* ── Givebutter donation form ───────────────────────────── */}
          <div id="donate-form" className="lg:col-span-7 bg-surface/50 border border-border shadow-2xl relative overflow-hidden scroll-mt-28">
            <div
              className="absolute top-0 right-0 w-40 h-40 bg-primary/5 -mr-20 -mt-20 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative p-6 md:p-12">
              <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-4 font-bold opacity-60 text-center">
                Your Gift. Their Next Chapter.
              </p>
              <div className="max-w-md mx-auto">
                <GivebutterWidget />
              </div>
              <p className="mt-8 text-center text-xs text-text-muted leading-relaxed max-w-md mx-auto">
                Choose a one-time or monthly gift in the form above. Givebutter emails your receipt,
                and the secure link in a monthly-gift receipt lets you update or cancel that gift.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  <Shield size={12} className="text-primary" aria-hidden="true" />
                  Secured by Givebutter
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  <CheckCircle size={12} className="text-primary" aria-hidden="true" />
                  Tax-deductible 501(c)(3)
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────────────────────── */}
          <aside className="lg:col-span-5 space-y-10" aria-label="Donation details">

            {/* Transparency panel */}
            <div className="border border-border p-6 space-y-4">
              <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] font-bold opacity-60">
                Transparency
              </p>
              {[
                { label: '501(c)(3) Status', value: 'Verified',              link: null },
                { label: 'EIN',             value: ORGANIZATION.EIN,       link: null },
                { label: 'Founded',         value: 'January 2025, Orlando, FL', link: null },
                { label: 'Financial Docs',  value: 'View Documents',         link: '/documents' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
                    {row.label}
                  </span>
                  {row.link ? (
                    <Link
                      to={row.link}
                      className="text-xs font-mono text-primary hover:underline uppercase tracking-widest"
                    >
                      {row.value}
                    </Link>
                  ) : (
                    <span className="text-xs text-text font-mono">{row.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Employer match callout */}
            <div className="border border-border p-5 flex gap-4 items-start">
              <Building2 size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-mono text-[10px] text-text uppercase tracking-widest mb-1 font-bold">
                  Double Your Impact
                </p>
                <p className="text-xs text-text-muted leading-relaxed mb-2">
                  Many employers match charitable contributions. Your $100 can become $200 at no cost to you.
                </p>
                <Link
                  to="/contact"
                  className="text-[10px] font-mono text-primary hover:underline uppercase tracking-widest"
                >
                  Ask us about matching →
                </Link>
              </div>
            </div>

            {/* Other ways to give */}
            <div>
              <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-4">
                Other Ways to Give
              </p>
              <ul className="space-y-3 text-sm text-text-muted" role="list">
                {[
                  `Donor-Advised Funds (DAF) — EIN ${ORGANIZATION.EIN}`,
                  'Equipment and in-kind donations',
                  'Volunteer your professional skills',
                  'Corporate sponsorship packages',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-2 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline uppercase tracking-widest"
              >
                Contact us about partnership <ChevronRight size={12} />
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
};
