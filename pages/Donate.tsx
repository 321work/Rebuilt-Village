import {
  ArrowRight,
  Building2,
  CheckCircle,
  ChevronRight,
  Heart,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useProjectBalances } from '../services/projectBalancesService';
import { getDonorProjects } from '../services/sanityService';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { motion } from 'framer-motion';
import { BRAND, donorTierForAmount } from '@/src/brand';
import { Section } from '../components/Section';

/* ─── Types ──────────────────────────────────────────────────────────────── */

type FundType  = 'general' | 'restricted';
type Frequency = 'once' | 'monthly';

interface DonorTier {
  key: string;
  amount: number;
  label: string;
  color: string;
  impact: string;
  popular?: boolean;
}

interface RestrictedProject {
  id: string;
  title: string;
  description: string;
  goal: number;         // dollars
  raisedSeed: number;   // hardcoded fallback (dollars) used if Firestore unreachable
  deadline: string;
  color: string;
  impact: (amount: number) => string;
}

/* ─── Donor Tiers (tree metaphor from brand.ts) ──────────────────────────── */

const TIERS: DonorTier[] = [
  {
    key: 'branch',
    amount: 25,
    label: 'Branch Builder',
    color: BRAND.colors.teal,
    impact: 'Camera rental for one student production day',
  },
  {
    key: 'trunk',
    amount: 50,
    label: 'Trunk Supporter',
    color: BRAND.colors.amber,
    impact: 'Enrolls 5 youth in monthly programming',
  },
  {
    key: 'canopy',
    amount: 100,
    label: 'Canopy Creator',
    color: BRAND.colors.gold,
    impact: 'Sponsors a full community screening event',
    popular: true,
  },
  {
    key: 'root',
    amount: 250,
    label: 'Root Sustainer',
    color: BRAND.colors.purple,
    impact: 'Full summer camp scholarship for one youth',
  },
  {
    key: 'grove',
    amount: 500,
    label: 'Grove Grower',
    color: BRAND.colors.blue,
    impact: 'Professional lighting kit for a 2-week production',
  },
  {
    key: 'forest',
    amount: 1000,
    label: 'Forest Builder',
    color: BRAND.colors.crimson,
    impact: 'Complete equipment grant for a student short film',
  },
];

/* ─── Restricted Projects ─────────────────────────────────────────────────── */
// IDs must match Firestore `donor_projects` collection keys (set by stripeWebhook.ts)

const RESTRICTED_PROJECTS: RestrictedProject[] = [
  {
    id: 'film-equipment-fund',
    title: 'Film Equipment Fund',
    description:
      'Professional cinema cameras, lighting rigs, and audio gear so students can tell their stories with broadcast-grade tools.',
    goal: 15000,
    raisedSeed: 0,
    deadline: 'Dec 2026',
    color: BRAND.colors.green,
    impact: (amt) =>
      amt >= 500
        ? 'Full lens kit rental for a student production'
        : amt >= 100
        ? `${Math.floor(amt / 25)} camera rental days for students`
        : `Covers ${Math.round((amt / 15000) * 100)}% of daily equipment costs`,
  },
  {
    id: 'youth-scholarship-fund',
    title: 'Youth Scholarship Fund',
    description:
      'Full tuition coverage for youth who cannot afford our programs. No student is ever turned away due to financial need.',
    goal: 10000,
    raisedSeed: 0,
    deadline: 'Rolling',
    color: BRAND.colors.teal,
    impact: (amt) =>
      amt >= 250
        ? '1 full annual scholarship for a youth filmmaker'
        : `${Math.floor(amt / 50)} months of free enrollment`,
  },
  {
    id: 'summer-camp-launch',
    title: 'Summer Camp Launch',
    description:
      'Fund our inaugural 2-week summer camp serving 30+ youth in Ocoee this July — hands-on Blackmagic and RED camera training.',
    goal: 25000,
    raisedSeed: 0,
    deadline: 'Jul 2026',
    color: BRAND.colors.amber,
    impact: (amt) =>
      amt >= 417
        ? `${Math.floor(amt / 417)} full camper spots funded`
        : `${Math.round((amt / 25000) * 60)} youth days of camp`,
  },
  {
    id: 'film-apalooza-2026',
    title: 'Film-apalooza at Dr. Phillips',
    description:
      'Rebuilt Village sponsors the 3-day film festival at Dr. Phillips High School — May 15–17, 2026. Your gift funds student internships, vendor support, and awards.',
    goal: 8000,
    raisedSeed: 0,
    deadline: 'May 15, 2026',
    color: BRAND.colors.crimson,
    impact: (amt) =>
      amt >= 1000
        ? 'Title sponsor — your name on all festival materials'
        : amt >= 250
        ? 'Funds one full screening program sponsorship'
        : `Covers ${Math.round((amt / 8000) * 100)}% of venue and A/V costs`,
  },
];

/* ─── Impact Calculator ──────────────────────────────────────────────────── */

function generalImpact(amount: number): string {
  if (amount >= 1000) return 'Complete equipment grant for a student short film';
  if (amount >= 500)  return 'Professional lighting kit for a 2-week production';
  if (amount >= 250)  return 'Full summer camp scholarship for one youth';
  if (amount >= 100)  return 'A full community screening event';
  if (amount >= 50)   return '5 youth enrolled in monthly programming';
  if (amount >= 25)   return 'Camera rental for one student production day';
  if (amount >= 10)   return '1 hour of professional instruction time';
  if (amount > 0)     return `${Math.floor(amount * 6)} minutes of professional instruction`;
  return '';
}

function annualImpact(monthly: number): string {
  const annual = monthly * 12;
  if (annual >= 1200) return '12 student equipment grants per year';
  if (annual >= 600)  return '2 lighting kits per semester';
  if (annual >= 300)  return '3 full youth scholarships';
  if (annual >= 120)  return '12 community screenings funded';
  return `${Math.floor((annual / 50) * 5)} youth enrolled per year`;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export const Donate: React.FC = () => {
  usePageMeta(
    'Donate — Rebuilt Village',
    'Support free film education for Ocoee youth. Your tax-deductible gift goes directly to programs. 85¢ of every dollar funds students.'
  );
  const [searchParams]                        = useSearchParams();
  const cancelled                             = searchParams.get('cancelled') === 'true';

  const [fundType, setFundType]               = useState<FundType>('general');
  const [projects, setProjects]               = useState<RestrictedProject[]>(RESTRICTED_PROJECTS);
  const [projectId, setProjectId]             = useState<string>(RESTRICTED_PROJECTS[0].id);
  const [amount, setAmount]                   = useState<number>(100);
  const [customAmount, setCustomAmount]       = useState<string>('');
  const [frequency, setFrequency]             = useState<Frequency>('monthly');
  const [tribute, setTribute]                 = useState(false);
  const [tributeName, setTributeName]         = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  // Load CMS donor projects; falls back to hardcoded RESTRICTED_PROJECTS
  useEffect(() => {
    getDonorProjects().then((cms) => {
      if (cms.length > 0) {
        const mapped: RestrictedProject[] = cms.map((p) => ({
          id: p._id,
          title: p.title,
          description: p.description,
          goal: p.goalAmount ?? 0,
          raisedSeed: p.raisedAmount ?? 0,
          deadline: '',
          color: BRAND.colors.teal,
          impact: (amt: number) => p.description ? `${generalImpact(amt)} toward ${p.title}` : generalImpact(amt),
        }));
        setProjects(mapped);
        setProjectId(mapped[0].id);
      }
    }).catch(() => { /* keep RESTRICTED_PROJECTS */ });
  }, []);

  // Live Firestore balances — polls every 60s; falls back to raisedSeed if unreachable
  const { balances: liveBalances } = useProjectBalances(60_000);

  // Merge live balance (cents → dollars) with static seed
  function getRaised(project: RestrictedProject): number {
    const live = liveBalances[project.id];
    if (live) return Math.round(live.raised / 100);
    return project.raisedSeed;
  }

  const selectedProject = projects.find((p) => p.id === projectId) ?? projects[0];
  const displayAmount   = customAmount ? parseFloat(customAmount) || 0 : amount;
  const selectedCents   = Math.round(displayAmount * 100);
  const donorTier       = displayAmount > 0 ? donorTierForAmount(displayAmount) : null;

  const impactText =
    fundType === 'restricted'
      ? displayAmount > 0 ? selectedProject.impact(displayAmount) : ''
      : generalImpact(displayAmount);

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    setError(null);
  };

  const handleDonate = async () => {
    if (!selectedCents || selectedCents < 100) {
      setError('Minimum donation is $1.00');
      return;
    }
    if (selectedCents > 10_000_000) {
      setError('For gifts above $100,000 please contact us directly.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const body: Record<string, unknown> = {
        amount: selectedCents,
        frequency,
        fundType,
        ...(fundType === 'restricted' && { projectId }),
        ...(tribute && tributeName.trim() && { tributeName: tributeName.trim() }),
      };

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to initialize checkout');
      }

      const { url } = (await response.json()) as { url: string };
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Donation error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <Section bg="black" className="pt-32 pb-16 text-center">
        <p className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
          Call For Producers
        </p>
        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8 leading-none">
          Plant Your<br />Seed
        </h1>
        <div className="h-1 w-24 bg-primary/30 mx-auto mb-10" />
        <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
          Your investment grows the next generation of visual storytellers.
          Every contribution is tax-deductible and directly benefits youth in Ocoee, Florida.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-text-muted">
          <Users size={14} className="text-primary" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            Join our growing community of supporters
          </span>
        </div>
      </Section>

      {/* ── Cancelled banner ──────────────────────────────────────────── */}
      {cancelled && (
        <div className="max-w-5xl mx-auto px-6 mb-4" role="alert">
          <div className="bg-yellow-900/20 border border-yellow-700/40 p-4 text-center">
            <p className="text-yellow-400 font-mono text-xs uppercase tracking-widest">
              Your donation was not completed — no charges were made.
            </p>
          </div>
        </div>
      )}

      {/* ── Fund Type Selector ─────────────────────────────────────────── */}
      <Section bg="black" className="pb-0 pt-4">
        <div className="max-w-6xl mx-auto">
          <div
            className="flex border border-border"
            role="tablist"
            aria-label="Select donation fund type"
          >
            {([
              {
                type: 'general'    as FundType,
                label: 'General Fund',
                sub:   'Where needed most — maximum flexibility',
              },
              {
                type: 'restricted' as FundType,
                label: 'Restricted Projects',
                sub:   'Fund a specific program or initiative',
              },
            ] as const).map(({ type, label, sub }) => (
              <button
                key={type}
                role="tab"
                aria-selected={fundType === type}
                onClick={() => setFundType(type)}
                className={`flex-1 py-5 px-6 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  fundType === type
                    ? 'bg-primary/10 border-b-2 border-primary'
                    : 'hover:bg-surface/50'
                }`}
              >
                <div
                  className={`font-mono text-xs uppercase tracking-widest font-bold transition-colors ${
                    fundType === type ? 'text-primary' : 'text-text-muted'
                  }`}
                >
                  {label}
                </div>
                <div className="text-[10px] text-text-muted mt-1 font-mono uppercase tracking-widest opacity-70">
                  {sub}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <Section bg="black">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-16 items-start">

          {/* ── Donation Form ──────────────────────────────────────── */}
          <div className="lg:col-span-7 bg-surface/50 border border-border shadow-2xl relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-40 h-40 bg-primary/5 -mr-20 -mt-20 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Frequency toggle */}
            <div className="p-8 md:p-12 pb-0">
              <div
                className="flex bg-surface-highlight border border-border mb-8"
                role="group"
                aria-label="Donation frequency"
              >
                {(['once', 'monthly'] as Frequency[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    aria-pressed={frequency === f}
                    className={`flex-1 py-3 text-xs font-mono uppercase tracking-widest transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      frequency === f
                        ? 'bg-primary text-primary-foreground'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    {f === 'once' ? 'One-Time' : 'Monthly Sustainer'}
                  </button>
                ))}
              </div>

              {frequency === 'monthly' && (
                <div className="mb-8 p-4 bg-primary/10 border border-primary/20">
                  <p className="text-xs font-mono text-primary uppercase tracking-widest">
                    Monthly gifts are the heartbeat of our programs — cancel anytime.
                  </p>
                  {displayAmount > 0 && (
                    <p className="text-[10px] font-mono text-primary/70 mt-2 uppercase tracking-widest">
                      That's ${(displayAmount * 12).toLocaleString()}/year — {annualImpact(displayAmount)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Restricted project selector */}
            {fundType === 'restricted' && (
              <div className="px-8 md:px-12 mb-8">
                <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-4 font-bold opacity-60">
                  Choose a Project
                </p>
                <div className="space-y-3" role="group" aria-label="Restricted donation projects">
                  {projects.map((project) => {
                    const raised     = getRaised(project);
                    const pct        = Math.min(100, Math.round((raised / project.goal) * 100));
                    const isSelected = projectId === project.id;
                    return (
                      <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        key={project.id}
                        onClick={() => setProjectId(project.id)}
                        aria-pressed={isSelected}
                        className={`w-full text-left p-4 border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          isSelected
                            ? 'bg-surface/60 shadow-md'
                            : 'border-border bg-surface-highlight hover:border-text-muted/50'
                        }`}
                        style={
                          isSelected
                            ? { borderColor: project.color, borderLeftWidth: 4 }
                            : {}
                        }
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div
                              className="font-mono text-[9px] uppercase tracking-widest mb-1"
                              style={{ color: project.color }}
                            >
                              Deadline: {project.deadline}
                            </div>
                            <div
                              className={`text-sm font-serif italic ${
                                isSelected ? 'text-text' : 'text-text-muted'
                              }`}
                            >
                              {project.title}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div
                              className="text-xs font-mono font-bold"
                              style={{ color: project.color }}
                            >
                              ${raised.toLocaleString()}
                            </div>
                            <div className="text-[9px] font-mono text-text-muted/60 uppercase tracking-widest">
                              of ${(project.goal / 1000).toFixed(0)}k goal
                            </div>
                          </div>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: project.color }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${project.title}: ${pct}% funded`}
                          />
                        </div>
                        <div className="mt-1.5 text-[9px] font-mono text-text-muted/60 uppercase tracking-widest">
                          {pct}% funded
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tier grid */}
            <div className="px-8 md:px-12">
              <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-4 font-bold opacity-60">
                Select Your Tier
              </p>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8"
                role="group"
                aria-label="Donation amount presets"
              >
                {TIERS.map((tier) => {
                  const isSelected = amount === tier.amount && !customAmount;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      key={tier.key}
                      onClick={() => handlePresetSelect(tier.amount)}
                      aria-pressed={isSelected}
                      className={`relative p-4 border transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        isSelected
                          ? 'border-primary shadow-lg shadow-primary/20 glow-gold'
                          : 'border-border bg-surface-highlight hover:border-text-muted hover:bg-surface/80'
                      }`}
                      style={
                        isSelected
                          ? { borderColor: tier.color, backgroundColor: `${tier.color}18` }
                          : {}
                      }
                    >
                      {tier.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground font-mono text-[7px] uppercase tracking-[0.2em] px-2 py-1 shadow-sm font-bold">
                          Popular
                        </div>
                      )}
                      <div
                        className="font-mono text-[8px] uppercase tracking-widest mb-1 transition-colors"
                        style={{ color: isSelected ? tier.color : undefined }}
                      >
                        {tier.label}
                      </div>
                      <div
                        className="text-xl font-serif italic mb-1 transition-colors"
                        style={{ color: isSelected ? tier.color : undefined }}
                      >
                        ${tier.amount}
                      </div>
                      <div className="text-[10px] text-text-muted leading-tight hidden sm:block">
                        {tier.impact}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom amount */}
              <div className="mb-8">
                <label
                  htmlFor="custom-amount"
                  className="block text-[10px] font-mono text-text-muted mb-3 uppercase tracking-widest"
                >
                  Custom Amount
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-serif italic text-xl pointer-events-none"
                    aria-hidden="true"
                  >
                    $
                  </span>
                  <input
                    id="custom-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(0);
                      setError(null);
                    }}
                    className="w-full pl-10 pr-6 py-4 bg-background border border-border text-text focus:border-primary outline-none font-serif italic text-xl transition-all"
                    placeholder="Enter amount"
                    aria-label="Custom donation amount in dollars"
                  />
                </div>
                {customAmount && displayAmount > 0 && donorTier && (
                  <p className="mt-2 text-[10px] font-mono text-text-muted uppercase tracking-widest">
                    Tier:{' '}
                    <span style={{ color: donorTier.color }}>{donorTier.label}</span>
                  </p>
                )}
              </div>

              {/* Impact calculator */}
              {impactText && displayAmount > 0 && (
                <div className="mb-6 p-4 border border-primary/20 bg-primary/5" aria-live="polite">
                  <p className="text-xs font-mono text-primary uppercase tracking-widest mb-1">Your Impact</p>
                  <p className="text-sm text-text-muted">
                    ${displayAmount.toLocaleString()} {frequency === 'monthly' ? '/month ' : ''}={' '}
                    {impactText}
                  </p>
                </div>
              )}

              {/* Tribute toggle */}
              <div className="mb-6 border-t border-border pt-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 border flex-shrink-0 transition-all flex items-center justify-center ${
                      tribute
                        ? 'bg-primary border-primary'
                        : 'border-border group-hover:border-text-muted'
                    }`}
                    aria-hidden="true"
                  >
                    {tribute && <CheckCircle size={10} className="text-primary-foreground" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={tribute}
                    onChange={(e) => setTribute(e.target.checked)}
                    className="sr-only"
                    aria-label="Give this donation in honor or memory of someone"
                  />
                  <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
                    <Heart size={11} className="inline mr-1 text-primary" aria-hidden="true" />
                    Give in honor or memory of someone
                  </span>
                </label>
                {tribute && (
                  <div className="mt-3 ml-7">
                    <label
                      htmlFor="tribute-name"
                      className="block text-[10px] font-mono text-text-muted mb-2 uppercase tracking-widest"
                    >
                      Honoree's Name
                    </label>
                    <input
                      id="tribute-name"
                      type="text"
                      value={tributeName}
                      onChange={(e) => setTributeName(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border text-text focus:border-primary outline-none font-sans text-sm transition-all"
                      placeholder="e.g. In memory of John Doe"
                    />
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-700/40" role="alert">
                  <p className="text-xs font-mono text-red-400 uppercase tracking-widest">{error}</p>
                </div>
              )}

              {/* CTA button */}
              <button
                onClick={handleDonate}
                disabled={isLoading || !displayAmount}
                className={`w-full py-5 font-mono text-sm uppercase tracking-widest transition-all duration-300 mb-4 flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  isLoading || !displayAmount
                    ? 'bg-surface border border-border text-text-muted cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-xl hover:shadow-primary/25'
                }`}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                    Preparing Checkout...
                  </>
                ) : frequency === 'monthly' ? (
                  <>
                    Give ${displayAmount || '—'} / month
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Give ${displayAmount || '—'}
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-6 pb-8 md:pb-12">
                <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  <Shield size={12} className="text-primary" aria-hidden="true" />
                  Secured by Stripe
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

            {/* Selected project detail */}
            {fundType === 'restricted' && (
              <div
                className="border p-6"
                style={{ borderColor: `${selectedProject.color}60` }}
              >
                <p
                  className="font-mono text-[8px] uppercase tracking-[0.4em] mb-3 font-bold"
                  style={{ color: selectedProject.color }}
                >
                  Selected Project
                </p>
                <h3 className="text-xl font-serif italic text-text mb-2">
                  {selectedProject.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-5">
                  {selectedProject.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-text-muted">
                    <span>Raised</span>
                    <span style={{ color: selectedProject.color }}>
                      ${getRaised(selectedProject).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.round((getRaised(selectedProject) / selectedProject.goal) * 100))}%`,
                        backgroundColor: selectedProject.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-text-muted uppercase tracking-widest">
                    <span>
                      {Math.min(100, Math.round((getRaised(selectedProject) / selectedProject.goal) * 100))}% funded
                    </span>
                    <span>Goal: ${selectedProject.goal.toLocaleString()}</span>
                  </div>
                </div>
                <p className="mt-4 text-[10px] font-mono text-text-muted/60 uppercase tracking-widest">
                  Deadline: {selectedProject.deadline}
                </p>
              </div>
            )}

            {/* Fund allocation (general fund only) */}
            {fundType === 'general' && (
              <div>
                <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-6 font-bold opacity-60">
                  Where Your Gift Goes
                </p>
                <div className="space-y-5">
                  {[
                    { pct: 60, label: 'Direct program delivery — equipment, workshops, mentors', color: BRAND.colors.green },
                    { pct: 25, label: 'Scholarships and financial aid for youth participants',    color: BRAND.colors.teal  },
                    { pct: 10, label: 'Community events and public screenings',                   color: BRAND.colors.amber },
                    { pct: 5,  label: 'Administrative and operational overhead',                  color: BRAND.colors.blue  },
                  ].map((row) => (
                    <div key={row.pct}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-muted">{row.label}</span>
                        <span
                          className="text-sm font-serif italic ml-3 shrink-0"
                          style={{ color: row.color }}
                        >
                          {row.pct}%
                        </span>
                      </div>
                      <div className="h-px bg-border relative">
                        <div
                          className="absolute top-0 left-0 h-full"
                          style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transparency panel */}
            <div className="border border-border p-6 space-y-4">
              <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] font-bold opacity-60">
                Transparency
              </p>
              {[
                { label: '501(c)(3) Status', value: 'Verified',              link: null },
                { label: 'EIN',             value: 'On file — request via contact', link: null },
                { label: 'Founded',         value: 'January 2025, Ocoee, FL', link: null },
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
                  'Donor-Advised Funds (DAF) — EIN on file',
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
