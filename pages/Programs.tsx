import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Camera, Clock, Clapperboard, Film, MapPin, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';
import { getProgramsFull, SanityProgramFull } from '../services/sanityService';

// ─── Program data ─────────────────────────────────────────────────────────────
// Hardcoded from verified Drive docs. Replace with Sanity CMS in Phase 4.

interface Program {
  id: string;
  label: string;       // short tag (mono uppercase)
  title: string;
  description: string;
  details: string;
  who: string;
  when: string;
  where: string;
  cost: string;
  accentColor: string;
  icon: React.ReactNode;
  cta: { label: string; path: string };
  highlights: string[];
}

// ─── Category → visual style map ─────────────────────────────────────────────
// Sanity stores category as a string key; accentColor and icon are frontend-only.
const CATEGORY_STYLE: Record<string, { accentColor: string; icon: React.ReactNode; defaultLabel: string }> = {
  'summer-camp':   { accentColor: '#E5A916', icon: <Camera size={24} />,     defaultLabel: 'Flagship Program'    },
  'filmmaking':    { accentColor: '#E5A916', icon: <Camera size={24} />,     defaultLabel: 'Filmmaking'          },
  'storytelling':  { accentColor: '#2DBFA0', icon: <Film size={24} />,       defaultLabel: 'Open to All'         },
  'editing':       { accentColor: '#7C3AED', icon: <Clapperboard size={24} />, defaultLabel: 'Post-Production'  },
  'career-skills': { accentColor: '#2DBFA0', icon: <Users size={24} />,      defaultLabel: 'Career Prep'         },
  'acting':        { accentColor: '#2DBFA0', icon: <Film size={24} />,       defaultLabel: 'Performance'         },
};
const DEFAULT_STYLE = { accentColor: '#C9A84C', icon: <Clapperboard size={24} />, defaultLabel: 'Specialty Sessions' };

function mapSanityProgram(p: SanityProgramFull): Program {
  const style = CATEGORY_STYLE[p.category] ?? DEFAULT_STYLE;
  return {
    id: p._id,
    label: p.shortLabel ?? style.defaultLabel,
    title: p.title,
    description: p.description,
    details: p.details ?? p.description,
    who: p.ageGroup ?? 'All ages',
    when: p.schedule ?? 'See Events calendar',
    where: p.location ?? 'John H. Jackson Community Center, Orlando, FL',
    cost: p.cost ?? 'Free',
    accentColor: style.accentColor,
    icon: style.icon,
    cta: p.enrollmentUrl
      ? { label: 'Learn More', path: p.enrollmentUrl }
      : { label: 'Express Interest', path: '/contact' },
    highlights: p.highlights ?? [],
  };
}

const FALLBACK_PROGRAMS: Program[] = [
  {
    id: 'summer-camp',
    label: 'Flagship Program',
    title: 'Summer Cinematography Camp',
    description:
      'Our two-week intensive for high school students who want to learn filmmaking by doing it. No experience required — just curiosity and commitment.',
    details:
      'Students train on the same Blackmagic Cinema and RED cameras used on professional productions. Every day blends theory with hands-on work: camera operation, lighting design, color grading, and sound. The camp closes with a public premiere of student-produced short films.',
    who: 'Youth ages 14–18',
    when: 'July 13–24, 2026 · Weekdays, 9 AM – 3 PM',
    where: 'John H. Jackson Community Center, Orlando, FL',
    cost: 'Free',
    accentColor: '#E5A916',
    icon: <Camera size={24} />,
    cta: { label: 'Express Interest', path: '/contact' },
    highlights: [
      'Blackmagic & RED camera training',
      'Professional lighting & grip',
      'Color grading lab',
      'Sound design fundamentals',
      'Public closing premiere',
      'Certificate of completion',
    ],
  },
  {
    id: 'narrative-workshop',
    label: 'Open to All',
    title: 'Narrative Preservation Workshop',
    description:
      'A recurring community workshop on documentary filmmaking and the art of telling stories that matter. Open to all ages and experience levels.',
    details:
      'These workshops focus on the craft of capturing real stories — interviewing techniques, observational shooting, ethical storytelling, and basic post-production. Participants leave with the skills and confidence to document their own community.',
    who: 'All ages and experience levels',
    when: 'Ongoing — see Events calendar for upcoming dates',
    where: 'John H. Jackson Community Center, Orlando, FL',
    cost: 'Free',
    accentColor: '#2DBFA0',
    icon: <Film size={24} />,
    cta: { label: 'View Events Calendar', path: '/events' },
    highlights: [
      'Documentary storytelling techniques',
      'Interview and observational shooting',
      'Ethical narrative practices',
      'Mobile filmmaking included',
      'Mentorship from working filmmakers',
      'Community screening opportunities',
    ],
  },
  {
    id: 'masterclass',
    label: 'Specialty Sessions',
    title: 'Director\'s Masterclass Series',
    description:
      'Periodic deep-dive sessions on specific technical and creative disciplines, led by professionals working in the Florida film industry.',
    details:
      'Each masterclass runs 4–6 hours and focuses on one topic: lighting and grip, directing for social impact, cinematography composition, or production design. Past sessions have included guest speakers from the Orlando production community, including our partners at Rebuilt Minds and All The Line Studio.',
    who: 'Open to current program participants and community members',
    when: 'Scheduled periodically — check Events',
    where: 'John H. Jackson Community Center or partner studios',
    cost: 'Free',
    accentColor: '#7C3AED',
    icon: <Clapperboard size={24} />,
    cta: { label: 'View Upcoming Sessions', path: '/events' },
    highlights: [
      'Single-day intensive format',
      'Industry professional instructors',
      'Topics: lighting, directing, cinematography',
      'Hands-on with professional gear',
      'Limited seats — priority for enrolled students',
      'Post-session Q&A',
    ],
  },
];

// ─── (end FALLBACK_PROGRAMS) ─────────────────────────────────────────────────

// ─── Partner institutions ─────────────────────────────────────────────────────
const PARTNERS = [
  { name: 'John H. Jackson Community Center', role: 'Primary programming venue', location: 'Orlando, FL' },
  { name: 'Dr. Phillips High School', role: 'Film-apalooza partner', location: 'Orlando, FL' },
  { name: 'Rebuilt Minds', role: 'Founding production partner', location: 'Orlando, FL' },
  { name: 'All The Line Studio', role: 'Guest instruction & equipment', location: 'Orlando, FL' },
  { name: 'JC Lighting', role: 'Equipment support', location: 'Orlando area' },
];

// ─── Programs page ────────────────────────────────────────────────────────────
export const Programs: React.FC = () => {
  usePageMeta(
    'Programs — Rebuilt Village',
    'Free professional film education programs for Orlando youth ages 14–18. Summer camp, narrative preservation workshops, and director masterclasses.'
  );
  const prefersReduced = useReducedMotion();
  const [programs, setPrograms] = useState<Program[]>(FALLBACK_PROGRAMS);

  useEffect(() => {
    getProgramsFull()
      .then((sanityPrograms) => {
        if (sanityPrograms.length > 0) {
          setPrograms(sanityPrograms.map(mapSanityProgram));
        }
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  return (
    <article aria-label="Rebuilt Village programs">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Section bg="black" className="pt-32">
        <div className="text-center">
          <p className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
            Current Season
          </p>
          <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8">
            Our Programs
          </h1>
          <div className="h-1 w-24 bg-primary/30 mx-auto mb-10" />
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
            All programs are free for youth. No gear. No experience. No excuses.
            Just show up ready to make something.
          </p>
        </div>
      </Section>

      {/* ── Program cards ─────────────────────────────────────────────────── */}
      <Section bg="black">
        <div className="max-w-5xl mx-auto space-y-20">
          {programs.map((program, idx) => (
            <ProgramCard key={program.id} program={program} index={idx} />
          ))}
        </div>
      </Section>

      {/* ── Partner institutions ──────────────────────────────────────────── */}
      <Section bg="dark">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
              Community Infrastructure
            </p>
            <h2 className="text-3xl md:text-4xl font-serif italic text-text">
              Where We Work
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PARTNERS.map((p) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="border border-border p-6 bg-surface/30 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-text font-serif italic text-lg leading-snug mb-1">{p.name}</p>
                    <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">{p.role}</p>
                    <p className="font-mono text-[10px] text-text-muted/50 uppercase tracking-widest">{p.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Apply / Enroll CTA ────────────────────────────────────────────── */}
      <Section bg="black">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[10px] text-primary mb-6 uppercase tracking-[0.4em] font-bold opacity-60">
            Ready to join?
          </p>
          <h2 className="text-4xl font-serif italic text-text mb-6">
            Applications open for Summer Camp 2026
          </h2>
          <p className="text-text-muted font-light leading-relaxed mb-10 max-w-xl mx-auto">
            The Summer Cinematography Camp runs July 13–24, 2026 at John H. Jackson Community Center.
            Seats are limited — express interest now and we'll notify you when enrollment opens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <button className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-8 py-4 bg-primary text-black hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                Express Interest <ArrowRight size={14} />
              </button>
            </Link>
            <Link to="/donate">
              <button className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-8 py-4 border border-border text-text-muted hover:border-primary hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                Fund a Student Seat
              </button>
            </Link>
          </div>
        </div>
      </Section>

    </article>
  );
};

// ─── ProgramCard ──────────────────────────────────────────────────────────────
interface ProgramCardProps { program: Program; index: number; }

const ProgramCard: React.FC<ProgramCardProps> = ({ program, index }) => {
  const isEven = index % 2 === 0;
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: 0.05 }}
      className="border border-border bg-surface/20 hover:border-primary/30 transition-colors duration-500"
      id={program.id}
    >
      {/* Accent top bar */}
      <div className="h-0.5 w-full" style={{ backgroundColor: `${program.accentColor}60` }} />

      <div className={`grid lg:grid-cols-2 gap-0 ${isEven ? '' : 'lg:grid-flow-col-dense'}`}>

        {/* Left/Right: Content */}
        <div className={`p-10 lg:p-12 flex flex-col justify-between ${!isEven ? 'lg:order-2' : ''}`}>
          <div>
            {/* Label + icon */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="font-mono text-[9px] px-2 py-1 border uppercase tracking-widest"
                style={{ borderColor: `${program.accentColor}50`, color: program.accentColor }}
              >
                {program.label}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif italic text-text mb-5 leading-tight">
              {program.title}
            </h2>
            <p className="text-text-muted font-light leading-relaxed mb-6 text-[15px]">
              {program.description}
            </p>
            <p className="text-text-muted/70 font-light leading-relaxed text-sm mb-8">
              {program.details}
            </p>
          </div>

          {/* Meta */}
          <div className="space-y-3 mb-8">
            {[
              { icon: <Users size={13} />, value: program.who },
              { icon: <Clock size={13} />, value: program.when },
              { icon: <MapPin size={13} />, value: program.where },
            ].map(({ icon, value }) => (
              <div key={value} className="flex items-start gap-3 text-text-muted font-mono text-[10px] uppercase tracking-wider">
                <span className="text-primary mt-0.5 shrink-0" aria-hidden="true">{icon}</span>
                {value}
              </div>
            ))}
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider">
              <span className="text-primary shrink-0" aria-hidden="true"><Camera size={13} /></span>
              <span style={{ color: program.accentColor }}>Cost: {program.cost}</span>
            </div>
          </div>

          <Link to={program.cta.path}>
            <button
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-6 py-3 border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 hover:opacity-80"
              style={{ borderColor: program.accentColor, color: program.accentColor }}
            >
              {program.cta.label} <ArrowRight size={12} />
            </button>
          </Link>
        </div>

        {/* Right/Left: Highlights */}
        <div
          className={`p-10 lg:p-12 flex flex-col justify-center border-t lg:border-t-0 border-border ${!isEven ? 'lg:order-1 lg:border-r' : 'lg:border-l'}`}
          style={{ borderColor: `${program.accentColor}20` }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest mb-6" style={{ color: program.accentColor }}>
            What You'll Learn
          </p>
          <ul className="space-y-4" role="list">
            {program.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 text-text-muted text-sm font-light leading-relaxed">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: program.accentColor }}
                  aria-hidden="true"
                />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
