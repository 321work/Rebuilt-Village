import { CheckCircle, ExternalLink, Heart, Sprout } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { donorTierForAmount } from '@/src/brand';

export const DonateSuccess: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const [searchParams] = useSearchParams();
  const sessionId  = searchParams.get('session_id');
  const amountRaw  = searchParams.get('amount');      // cents, passed via success URL if configured
  const fundType   = searchParams.get('fund_type');   // 'general' | 'restricted'
  const projectId  = searchParams.get('project_id');  // e.g. 'summer-camp'

  const [shared, setShared] = useState(false);

  // Human-readable project name
  const projectLabels: Record<string, string> = {
    'film-equipment': 'Film Equipment Fund',
    'scholarships':   'Youth Scholarship Fund',
    'summer-camp':    'Summer Camp Launch',
    'film-festival':  'Film Festival 2026',
  };
  const projectLabel = projectId ? (projectLabels[projectId] ?? 'a restricted project') : null;

  // Donor tier (if amount was passed)
  const amountDollars = amountRaw ? Math.round(parseInt(amountRaw, 10) / 100) : null;
  const tier = amountDollars ? donorTierForAmount(amountDollars) : null;

  const shareText = projectLabel
    ? `I just supported the ${projectLabel} at Rebuilt Village — a nonprofit bringing film education to youth in Orlando, FL. Join me!`
    : 'I just supported Rebuilt Village, a nonprofit bringing film education to youth in Orlando, FL. Join me in supporting the next generation of storytellers.';
  const shareUrl = 'https://rebuiltvillage.org/donate';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'I supported Rebuilt Village', text: shareText, url: shareUrl });
        setShared(true);
      } catch {
        // User dismissed — no-op
      }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  useEffect(() => {
    document.title = 'Donation Confirmed — Rebuilt Village';
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Animated check icon */}
        <div className="flex justify-center mb-10">
          <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <CheckCircle size={44} className="text-primary" aria-hidden="true" />
          </div>
        </div>

        {/* Overline */}
        <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-4 font-bold opacity-60">
          Donation Confirmed
        </p>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-serif italic text-text mb-6 leading-tight">
          Cut. Print.<br />Thank you.
        </h1>

        {/* Donation amount */}
        {amountDollars && (
          <p className="text-5xl font-bold font-display text-text mb-4">
            ${amountDollars.toLocaleString()}
            <span className="text-text-muted text-lg font-normal font-mono ml-2">donated</span>
          </p>
        )}

        {/* Tier callout */}
        {tier && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 border font-mono text-xs uppercase tracking-widest mb-6"
            style={{ borderColor: `${tier.color}60`, color: tier.color }}
          >
            <Sprout size={13} aria-hidden="true" />
            You're a {tier.label}
          </div>
        )}

        {/* Project-specific message */}
        <p className="text-lg text-text-muted leading-relaxed mb-4 max-w-lg mx-auto">
          {projectLabel
            ? `Your gift is now growing the ${projectLabel} at Rebuilt Village. `
            : 'Your gift is now working for youth in Orlando. '}
          A tax receipt has been sent to your email — please keep it for your records.
        </p>

        {sessionId && (
          <p className="text-xs font-mono text-text-muted/50 mb-10">
            Reference: {sessionId.substring(0, 24)}...
          </p>
        )}

        {/* Share */}
        <div className="bg-surface border border-border p-8 mb-10">
          <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-4">
            Spread the Word
          </p>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            Help us reach more supporters by sharing that you gave today.
          </p>
          <button
            onClick={handleShare}
            className="w-full py-4 font-mono text-xs uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Heart size={14} aria-hidden="true" />
            {shared ? 'Copied to clipboard!' : 'Share your support'}
          </button>
        </div>

        {/* Next steps */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Follow our work',      href: '/blog',    cta: 'Read the Blog'  },
            { label: 'See upcoming events',  href: '/events',  cta: 'View Events'    },
            { label: 'Volunteer with us',    href: '/contact', cta: 'Get Involved'   },
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block p-5 border border-border hover:border-primary transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">
                {item.label}
              </p>
              <p className="text-sm text-text group-hover:text-primary transition-colors flex items-center gap-1">
                {item.cta} <ExternalLink size={10} aria-hidden="true" />
              </p>
            </Link>
          ))}
        </div>

        {/* Restricted projects CTA — invite donor to fund another project */}
        {fundType === 'restricted' && (
          <div className="mb-10 p-6 border border-border bg-surface/30">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-3">
              Keep the momentum going
            </p>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              There are more projects that need your support. Every restricted gift goes exactly where you intend.
            </p>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 text-xs font-mono text-primary hover:underline uppercase tracking-widest"
            >
              Fund another project →
            </Link>
          </div>
        )}

        <Link
          to="/"
          className="text-xs font-mono text-text-muted hover:text-primary uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
};
