import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { Button } from '../components/Button';
import { announceToScreenReader } from '../src/utils/a11y';
import { VideoPlayer } from '../components/VideoPlayer';
import { getSiteSettings, getTestimonials } from '../services/sanityService';
import type { SanityTestimonial } from '../services/sanityService';
import { urlFor } from '../services/sanityClient';

// ─── Testimonials data ──────────────────────────────────────────────────────
const FALLBACK_TESTIMONIALS = [
  {
    quote: 'Rebuilt Village gave me a camera and, more importantly, a reason to use it. I went from never touching film equipment to directing my first short in eight weeks.',
    name: 'Marcus Thompson',
    role: 'Night at the Cinema ’ 24 · Student filmmaker, Ocoee HS',
    initials: 'MT',
    avatar: null,
  },
  {
    quote: "As a parent, I was blown away by how seriously the mentors took the kids. This isn't daycare \u2014 it's a real professional environment.",
    name: 'Diane Ramos',
    role: 'Parent of program participant \u00b7 Ocoee, FL',
    initials: 'DR',
    avatar: null,
  },
  {
    quote: "The stories coming out of Rebuilt Village are exactly what our community needs. They're honest, local, and permanent.",
    name: 'Pastor James Okafor',
    role: 'Community partner \u00b7 West Orange area',
    initials: 'JO',
    avatar: null,
  },
];

type TestimonialShape = { quote: string; name: string; role: string; initials: string; avatar: string | null };

function testimonialsFromCMS(raw: SanityTestimonial[]): TestimonialShape[] {
  return raw.map((t) => ({
    quote: t.quote,
    name: t.author,
    role: [t.role, t.organization].filter(Boolean).join(' · '),
    initials: t.author.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase(),
    avatar: t.avatar ? (t.avatar as string) : null,
  }));
}

// Original Rebuilt Village photo of the students at the Hollywood sign. Overridden by
// siteSettings.heroImage in FireCMS when set.
const DEFAULT_HERO_IMAGE = '/assets/hero/hollywood-students.jpg';

// ─── Home ───────────────────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState<TestimonialShape[]>(FALLBACK_TESTIMONIALS);
  const [heroImage, setHeroImage] = useState<string>(DEFAULT_HERO_IMAGE);

  useEffect(() => {
    announceToScreenReader('Welcome to Rebuilt Village. Film education nonprofit based in Ocoee, Florida.');
  }, []);

  // Load CMS data
  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s?.heroImage) setHeroImage(urlFor(s.heroImage).url());
    }).catch(() => { /* keep defaults */ });
    getTestimonials().then((raw) => {
      if (raw.length > 0) setTestimonials(testimonialsFromCMS(raw));
    }).catch(() => { /* keep fallback */ });
  }, []);

  usePageMeta(
    'Life, Framed. — Rebuilt Village',
    'Rebuilt Village empowers Ocoee youth through free professional film education. We train the next generation of storytellers. 501(c)(3) nonprofit.'
  );

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <article aria-label="Rebuilt Village homepage">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="relative min-h-svh md:min-h-[max(52rem,76vw,100svh)] flex flex-col justify-center overflow-hidden bg-black"
      >
        <div className="absolute inset-0 bg-black" aria-hidden="true">
          <div
            className="absolute top-[72px] inset-x-0 aspect-[2200/1670] md:inset-0 md:aspect-auto bg-cover bg-top opacity-90"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black md:hidden" />
          </div>
          {/* Gradient scrim for hero text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/55 z-[5]" aria-hidden="true" />
          {/* Soft vignette behind the copy only, so faces at the edges stay visible */}
          <div className="absolute inset-0 z-[5] bg-[radial-gradient(ellipse_55%_50%_at_50%_58%,rgba(0,0,0,0.6),rgba(0,0,0,0)_100%)]" aria-hidden="true" />
        </div>

        <div className="relative z-10 text-center px-6 pt-[calc(70vw+4.5rem)] pb-12 md:pt-40 md:pb-64 max-w-5xl mx-auto">
          <motion.div
            initial={prefersReducedMotion ? {} : { y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-primary font-mono tracking-[0.4em] text-[10px] mb-6 font-bold uppercase">
              Est. 2025 &nbsp;·&nbsp; Ocoee, FL &nbsp;·&nbsp; 501(c)(3)
            </p>
            <h1
              id="hero-heading"
              className="text-6xl md:text-8xl font-bold text-white mb-8 font-display tracking-tighter leading-none"
              style={{ fontSize: 'clamp(3rem, 10vw, 10rem)' }}
            >
              Life, <em className="text-primary not-italic">Framed.</em>
            </h1>
            <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto font-serif mb-10 leading-relaxed">
              Enriching the community through the art of film. We empower local voices to capture
              personal stories and preserve them for future generations.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8" role="group" aria-label="Primary actions">
              <Link to="/donate">
                <Button size="lg" className="w-full sm:w-auto glow-gold-hover border-transparent" aria-label="Donate to support film education programs">
                  Make an Impact
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Sub-navigation Direct Action Pathways ── */}
        <motion.div 
          initial={prefersReducedMotion ? {} : { y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-8 px-6 hidden md:block"
        >
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {[
               { title: "Fund the Arts", sub: "Support Film Education", link: "/donate" },
               { title: "Enroll a Student", sub: "Ages 14-18", link: "/programs" },
               { title: "Attend Screening", sub: "Local Events", link: "/events" }
            ].map((path) => (
              <Link key={path.title} to={path.link} className="group flex flex-col items-center text-center p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                 <h3 className="font-serif italic text-white text-xl group-hover:text-primary transition-colors">{path.title}</h3>
                 <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50 mt-2">{path.sub}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Mission / Video ──────────────────────────────────────────────── */}
      <section aria-labelledby="mission-heading" className="py-28 bg-background">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-4 font-bold opacity-60">
              The Vision
            </p>
            <h2 id="mission-heading" className="text-4xl md:text-5xl font-bold text-text mb-6 font-display tracking-tight">
              The Art of <em className="text-primary not-italic">Connecting.</em>
            </h2>
            <p className="text-lg text-text-muted mb-6 leading-relaxed">
              We believe film is the ultimate medium for community restoration. By providing
              professional-grade tools and mentorship, we bridge the gap between neighbors and
              preserve the living history of Ocoee.
            </p>
            <ul className="space-y-3 mb-10" role="list">
              {[
                'Cinema Camera Access (Blackmagic, RED)',
                'Directorial Mentorships with working filmmakers',
                'Color Grading & Sound Design Labs',
                'Community screening events open to all',
              ].map((item) => (
                <li key={item} className="flex items-center text-text">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/programs">
              <Button variant="outline" className="focus:ring-4 focus:ring-primary/50">
                Explore Programs →
              </Button>
            </Link>
          </div>

          <VideoPlayer
            src="https://storage.googleapis.com/rebuilt-village-assets/promo/village-story-v1.mp4"
            poster="https://storage.googleapis.com/rebuilt-village-assets/promo/poster-01.jpg"
            title="The Art of Connecting — Rebuilt Village 2024"
          />
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section aria-labelledby="testimonials-heading" className="py-24 bg-surface-highlight">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-4 font-bold opacity-60">
            Community Voices
          </p>
          <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-serif italic text-text mb-16">
            In Their Own Words
          </h2>

          <div className="relative" style={{ minHeight: '220px' }} aria-live="polite" aria-atomic="true">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: i === activeTestimonial ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className={`absolute inset-0 ${i === activeTestimonial ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={i !== activeTestimonial}
              >
                <p className="text-xl md:text-2xl font-serif italic text-text leading-relaxed mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full bg-primary/20 border border-primary flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <span className="text-primary text-xs font-mono font-bold">{t.initials}</span>
                  </div>
                  <div>
                    <strong className="block text-sm font-mono uppercase tracking-widest text-primary">{t.name}</strong>
                    <cite className="text-xs text-text-muted not-italic">{t.role}</cite>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-16" role="tablist" aria-label="Testimonial navigation">
            {testimonials.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeTestimonial}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setActiveTestimonial(i)}
                className={`h-0.5 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-primary ${i === activeTestimonial ? 'bg-primary w-8' : 'bg-border hover:bg-text-muted w-4'
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs preview ─────────────────────────────────────────────── */}
      <section aria-labelledby="programs-preview-heading" className="py-28 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-4 font-bold opacity-60">Current Season</p>
              <h2 id="programs-preview-heading" className="text-4xl md:text-5xl font-bold text-text font-display tracking-tight">
                Our Programs
              </h2>
            </div>
            <Link to="/programs">
              <Button variant="outline" className="shrink-0">View All Programs →</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                tag: 'Youth · Ages 14–18',
                title: 'Cinematography Bootcamp',
                desc: 'Eight weeks of hands-on training with Blackmagic cameras, lighting rigs, and post-production labs. No experience required.',
                dot: 'bg-blue-500',
              },
              {
                tag: 'Community · All Ages',
                title: 'Narrative Preservation',
                desc: 'A documentary workshop helping Ocoee families capture and preserve their personal histories before they\'re lost to time.',
                dot: 'bg-amber-500',
              },
              {
                tag: 'Advanced · 18+',
                title: 'Director\'s Masterclass',
                desc: 'A mentorship-intensive program pairing emerging local directors with working professionals in the Florida film industry.',
                dot: 'bg-emerald-500',
              },
            ].map((prog) => (
              <article
                key={prog.title}
                className="group border border-border hover:border-primary transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 p-8 bg-surface"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${prog.dot}`} aria-hidden="true" />
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{prog.tag}</span>
                </div>
                <h3 className="text-2xl font-serif italic text-text mb-3 leading-tight group-hover:text-primary transition-colors duration-300">
                  {prog.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-6">{prog.desc}</p>
                <Link to="/programs" className="text-[10px] font-mono text-primary uppercase tracking-widest hover:underline">
                  Program Details →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Donate CTA ───────────────────────────────────────────────────── */}
      <section aria-labelledby="donate-cta-heading" className="py-24 bg-primary/5 border-t border-primary/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-4 font-bold opacity-60">
            Make It Happen
          </p>
          <h2 id="donate-cta-heading" className="text-4xl md:text-5xl font-serif italic text-text mb-6">
            Every Frame Starts<br />with Your Gift
          </h2>
          <p className="text-lg text-text-muted mb-10 leading-relaxed">
            100% of youth program costs are covered by community donors. Your donation is fully tax-deductible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate">
              <Button size="lg" className="w-full sm:w-auto focus:ring-4 focus:ring-primary/50">Donate Now</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto focus:ring-4 focus:ring-primary/50">Partner With Us</Button>
            </Link>
          </div>
          <p className="mt-6 text-xs font-mono text-text-muted/60 uppercase tracking-widest">
            501(c)(3) · Ocoee, FL · Born from Rebuilt Minds
          </p>
        </div>
      </section>

      {/* ── Partner / Sponsor bar ────────────────────────────────────────── */}
      <section aria-labelledby="sponsors-heading" className="py-16 bg-surface border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 id="sponsors-heading" className="text-center font-mono text-[10px] text-text-muted uppercase tracking-[0.4em] mb-10 opacity-40">
            Supporters &amp; Community Partners
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-50">
            {[
              'Dr. Phillips High School',
              'Rebuilt Minds',
              'JC Lighting',
              'All The Line Studio',
              'John H. Jackson Community Center',
            ].map((name) => (
              <span key={name} className="text-sm font-mono text-text-muted uppercase tracking-widest">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

    </article >
  );
};
