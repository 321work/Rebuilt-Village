import { FileText, Milestone, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Section } from '../components/Section';
import { getTeamMembers } from '../services/sanityService';
import { urlFor } from '../services/sanityClient';

/* ─── Team data ──────────────────────────────────────────────────────────── */

// DisplayMember is a normalized shape used for rendering regardless of source
interface DisplayMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

const FALLBACK_TEAM: DisplayMember[] = [
  {
    name:  'Tony Golden',
    role:  'Executive Director',
    image: '/assets/brand/placeholder-team.png',
    bio:   'Tony leads Rebuilt Village\'s day-to-day operations and programming, bringing deep film production experience to build real pathways for the next generation of Orlando storytellers.',
  },
  {
    name:  'Steve Kohn',
    role:  'President',
    image: '/assets/brand/placeholder-team.png',
    bio:   'Steve co-founded Rebuilt Village with Tony and oversees organizational strategy, board governance, and long-term vision for film education in Central Florida.',
  },
  {
    name:  'Amanda Baez',
    role:  'Vice President',
    image: '/assets/brand/placeholder-team.png',
    bio:   'Amanda drives grant strategy and program development, ensuring Rebuilt Village\'s work is funded and that every initiative produces measurable impact for youth.',
  },
  {
    name:  'Kenya Fulton',
    role:  'Treasurer',
    image: '/assets/brand/placeholder-team.png',
    bio:   'Kenya manages Rebuilt Village\'s financial stewardship and ensures every donor dollar is invested with transparency and accountability.',
  },
  {
    name:  'Jess Ayala',
    role:  'Secretary',
    image: '/assets/brand/placeholder-team.png',
    bio:   'Jess keeps the organization organized and accountable — managing meeting records, board documentation, and organizational communications.',
  },
  {
    name:  'Aaron Tanyhill',
    role:  'Board Member',
    image: '/assets/brand/placeholder-team.png',
    bio:   'Aaron brings creative vision and community voice to Rebuilt Village\'s mission, helping shape programs and messaging that resonate with the people they serve.',
  },
  {
    name:  'Karen Rugerio',
    role:  'Board Member',
    image: '/assets/brand/placeholder-team.png',
    bio:   'Karen brings expertise in youth internship development and career pathways, guiding how students transition from Rebuilt Village programs into working in the arts.',
  },
  {
    name:  'Nef Alexander',
    role:  'Social Media & Marketing',
    image: '/assets/brand/placeholder-team.png',
    bio:   'Nef leads Rebuilt Village\'s digital presence and brand storytelling — telling the organization\'s story to Central Florida and beyond.',
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export const About: React.FC = () => {
  usePageMeta(
    'Our Story — Rebuilt Village',
    'Learn how Rebuilt Village is rebuilding community through the art of film. Meet our team and read our origin story.'
  );
  const [team, setTeam] = useState<DisplayMember[]>(FALLBACK_TEAM);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTeamMembers()
      .then((members) => {
        if (members.length > 0) {
          setTeam(
            members.map((m) => ({
              name: m.name,
              role: m.role,
              bio: m.bio,
              image: m.headshot
                ? urlFor(m.headshot).width(400).auto('format').url()
                : '/assets/brand/placeholder-team.png',
            }))
          );
        }
        // If Sanity has no team members yet, keep hardcoded fallback
      })
      .catch(() => {
        // Silently keep fallback if Sanity is unreachable
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <Section bg="black" className="text-center pt-32">
        <div className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
          Origin Story
        </div>
        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8">
          Rebuilding The Frame
        </h1>
        <div className="h-1 w-24 bg-primary/30 mx-auto mb-10" />
        <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed font-light">
          Founded in January 2025 in Ocoee, Florida — born from the Orlando production company{' '}
          <span className="text-primary">Rebuilt Minds</span> — with a simple belief:{' '}
          talent is universal, but opportunity is not.
        </p>
      </Section>

      {/* ── Mission & Vision ──────────────────────────────────────────── */}
      <Section bg="black">
        <div className="max-w-6xl mx-auto">
          {/* Vision Block */}
          <div className="text-center mb-32">
            <div className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
              The Vision
            </div>
            <h2 className="text-4xl md:text-6xl font-serif italic text-text mb-4">
              Rebuilding Community through Art
            </h2>
            <p className="font-serif text-text-muted/60 italic text-lg max-w-xl mx-auto mt-4">
              "It takes a village to tell a story, and stories to rebuild a village."
            </p>
            <div className="h-px w-32 bg-border mx-auto mt-8" />
          </div>

          {/* Mission + photo */}
          <div className="grid md:grid-cols-2 gap-16 items-start mb-32">
            <div className="relative group overflow-hidden border border-border p-2">
              <img
                src="/assets/hero/studio-students.jpg"
                alt="Rebuilt Village students learning in a film studio beneath overhead production lights"
                width={1350}
                height={1800}
                loading="lazy"
                decoding="async"
                className="w-full h-auto"
              />
              {/* Film strip decoration */}
              <div className="absolute top-0 left-0 w-8 h-full bg-surface/20 flex flex-col justify-around py-4 border-r border-border">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-3 h-4 bg-surface/40 mx-auto rounded-sm" />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Milestone size={20} className="text-primary" />
                <h2 className="text-sm font-mono uppercase tracking-widest text-text">
                  Our Mission Statement
                </h2>
              </div>
              <p className="text-text-muted mb-6 leading-relaxed font-light text-xl italic font-serif">
                "Our mission is to enrich the community by telling stories through the art of film and media."
              </p>
              <p className="text-text-muted mb-6 leading-relaxed font-light text-lg">
                We empower our local community to capture and share stories that are deeply personal,
                ensuring that these narratives are preserved for future generations.
              </p>
              <p className="text-text-muted mb-8 leading-relaxed font-light">
                We strive to use art as a medium to foster community connections through events, arts
                programming, and education — giving young people in Central Florida the tools to
                define their own legacy without leaving home to chase their dreams.
              </p>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-8">
                <div>
                  <div className="text-2xl font-serif italic text-text">01</div>
                  <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-1">
                    Preserving Narratives
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-serif italic text-text">02</div>
                  <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-1">
                    Fostering Connection
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Cast & Crew ──────────────────────────────────────────────── */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif italic text-text">Cast &amp; Crew</h2>
          <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest mt-4">
            The people behind the lens
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" aria-busy={isLoading}>
          {isLoading
            ? [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-border/40" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-border/60 rounded w-2/3" />
                    <div className="h-3 bg-border/40 rounded w-1/2" />
                    <div className="h-3 bg-border/30 rounded w-full mt-3" />
                    <div className="h-3 bg-border/30 rounded w-5/6" />
                  </div>
                </div>
              ))
            : team.map((member) => (
                <Card
                  key={member.name}
                  title={member.name}
                  subtitle={member.role}
                  image={member.image}
                >
                  <p className="text-sm leading-relaxed text-text-muted">{member.bio}</p>
                </Card>
              ))
          }
        </div>
      </Section>

      {/* ── Vision 2026: Production Pipeline ─────────────────────────── */}
      <Section bg="black" className="border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
              Act II
            </div>
            <h2 className="text-4xl md:text-6xl font-serif italic text-text mb-6">
              Vision 2026: The Production Pipeline
            </h2>
            <div className="h-1 w-24 bg-primary/30 mx-auto mb-6" />
            <p className="text-text-muted font-light leading-relaxed max-w-2xl mx-auto">
              The script is being written. These milestones represent our commitment to building
              a sustainable creative ecosystem in Central Florida.
            </p>
          </div>

          <div className="space-y-16">
            {/* Scene 01: Infrastructure */}
            <div className="relative border-l-2 border-primary/30 pl-12">
              <div className="absolute -left-[29px] top-0 w-14 h-14 bg-background border-2 border-primary/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-serif italic text-primary">01</span>
              </div>
              <div className="font-mono text-[9px] text-primary mb-3 uppercase tracking-[0.3em] font-bold">
                Scene 01: Infrastructure
              </div>
              <h3 className="text-3xl font-serif italic text-text mb-4">Establishing the Studio</h3>
              <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-6">By End of 2026</p>
              <ul className="space-y-4">
                <li className="flex items-start text-text-muted">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-4 shrink-0" />
                  <div>
                    <span className="font-semibold text-text">Dedicated Studio Space:</span>{' '}
                    Secure a permanent hub for operations, classes, and film production in the Ocoee area —
                    a home base where creativity flourishes without constraints.
                  </div>
                </li>
                <li className="flex items-start text-text-muted">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-4 shrink-0" />
                  <div>
                    <span className="font-semibold text-text">Expanding the Crew:</span>{' '}
                    Grow the team to include an Outreach Coordinator, Social Media Lead, and
                    administrative support to amplify our capacity and program reach.
                  </div>
                </li>
              </ul>
            </div>

            {/* Scene 02: Community Engagement */}
            <div className="relative border-l-2 pl-12" style={{ borderColor: '#2DBFA040' }}>
              <div
                className="absolute -left-[29px] top-0 w-14 h-14 bg-background border-2 rounded-full flex items-center justify-center"
                style={{ borderColor: '#2DBFA040' }}
              >
                <span className="text-2xl font-serif italic" style={{ color: '#2DBFA0' }}>02</span>
              </div>
              <div
                className="font-mono text-[9px] mb-3 uppercase tracking-[0.3em] font-bold"
                style={{ color: '#2DBFA0' }}
              >
                Scene 02: Community Engagement
              </div>
              <h3 className="text-3xl font-serif italic text-text mb-4">Lights, Camera, Connection</h3>
              <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-6">2026 Season</p>
              <ul className="space-y-4">
                <li className="flex items-start text-text-muted">
                  <span className="w-2 h-2 rounded-full mt-2 mr-4 shrink-0" style={{ backgroundColor: '#2DBFA0' }} />
                  <div>
                    <span className="font-semibold text-text">Film-apalooza at Dr. Phillips High School</span>{' '}
                    <span className="font-mono text-xs" style={{ color: '#2DBFA0' }}>(May 15–17, 2026)</span>
                    {': '}
                    A 3-day student film festival at the Dr. Phillips Film & Television Magnet Program,
                    sponsored by Rebuilt Village. Day 1: Senior Film Showcase with talk-back.
                    Day 2: Workshops and industry panels. Day 3: Award Ceremony with senior passdown
                    and inaugural student internship announcement.
                  </div>
                </li>
                <li className="flex items-start text-text-muted">
                  <span className="w-2 h-2 rounded-full mt-2 mr-4 shrink-0" style={{ backgroundColor: '#2DBFA0' }} />
                  <div>
                    <span className="font-semibold text-text">Summer Camp Launch</span>{' '}
                    <span className="font-mono text-xs" style={{ color: '#2DBFA0' }}>(Summer 2026)</span>
                    {': '}
                    The inaugural Rebuilt Village Summer Camp — youth programs integrating film, theatre,
                    and visual art at John H. Jackson Community Center in Ocoee. A space where young
                    voices learn to frame their own stories.
                  </div>
                </li>
              </ul>
            </div>

            {/* Scene 03: Sustainable Funding */}
            <div className="relative border-l-2 border-primary/30 pl-12 pb-8">
              <div className="absolute -left-[29px] top-0 w-14 h-14 bg-background border-2 border-primary/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-serif italic text-primary">03</span>
              </div>
              <div className="font-mono text-[9px] text-primary mb-3 uppercase tracking-[0.3em] font-bold">
                Scene 03: Sustainable Funding
              </div>
              <h3 className="text-3xl font-serif italic text-text mb-4">The Long Take</h3>
              <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-6">Late 2026</p>
              <ul className="space-y-4">
                <li className="flex items-start text-text-muted">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-4 shrink-0" />
                  <div>
                    <span className="font-semibold text-text">Rebuilt Village Gala</span>{' '}
                    <span className="text-primary font-mono text-xs">(Winter 2026)</span>
                    {': '}
                    An evening dedicated to generating vital funds for legacy projects and long-term
                    sustainability. Bringing together supporters, artists, and community leaders to
                    invest in the future of storytelling in Ocoee.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center border-t border-border pt-12">
            <p className="text-text-muted font-mono text-sm italic mb-12">
              "The script is being written. Every frame matters."
            </p>
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-serif italic text-text mb-4">
                  Be Part of Vision 2026
                </h3>
                <p className="text-text-muted font-light leading-relaxed mb-8">
                  Your support brings these milestones to life. Help us build a permanent home for
                  storytelling, launch transformative programs, and create lasting impact in our community.
                </p>
                <Link to="/donate">
                  <Button variant="secondary" size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    Support Vision 2026
                  </Button>
                </Link>
                <p className="text-text-muted font-mono text-xs uppercase tracking-widest mt-6">
                  Every contribution moves us closer to action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Transparency ─────────────────────────────────────────────── */}
      <Section bg="dark" className="border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <ShieldCheck size={32} className="text-primary mb-6" />
            <h2 className="text-3xl font-serif italic text-text mb-4">Produced With Integrity</h2>
            <p className="text-text-muted font-light leading-relaxed max-w-2xl">
              Rebuilt Village is committed to the highest standards of financial stewardship.
              As a 501(c)(3) nonprofit, our "box office" is open for public review.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <a
              href="#"
              className="flex items-center justify-between p-6 bg-surface border border-border hover:border-primary transition-all group"
            >
              <div className="flex items-center text-text-muted">
                <FileText className="w-5 h-5 mr-4 text-text-muted group-hover:text-primary transition-colors" />
                <span className="font-mono text-xs uppercase tracking-widest">IRS Determination Letter</span>
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase">PDF Archive</span>
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-6 bg-surface border border-border hover:border-primary transition-all group"
            >
              <div className="flex items-center text-text-muted">
                <ShieldCheck className="w-5 h-5 mr-4 text-text-muted group-hover:text-primary transition-colors" />
                <span className="font-mono text-xs uppercase tracking-widest">501(c)(3) Status</span>
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase">Verified</span>
            </a>
          </div>
        </div>
      </Section>
    </>
  );
};
