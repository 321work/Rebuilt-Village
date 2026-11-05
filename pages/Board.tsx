import React, { useEffect, useState } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';
import { Linkedin, Mail } from 'lucide-react';
import { Button } from '../components/Button';
import { getBoardMembers, SanityBoardMember } from '../services/sanityService';
import { urlFor } from '../services/sanityClient';

// ─── Local display interface ──────────────────────────────────────────────────
interface BoardMember {
    name: string;
    title: string;
    bio: string;
    imageUrl: string;
    linkedin?: string;
    email?: string;
}

// ─── Fallback: matches the active board in the CMS (boardMembers) ─────────────
// Used for the first paint and if the CMS is unreachable. Keep it in step with the CMS.
const FALLBACK_BOARD: BoardMember[] = [
    {
        name: 'Steve Kohn',
        title: 'President',
        bio: 'Steve oversees organizational strategy, board governance, and long-term vision for film education in Central Florida.',
        imageUrl: '/assets/brand/placeholder-team.png',
    },
    {
        name: 'Amanda Baez',
        title: 'Vice President',
        bio: 'Amanda drives grant strategy and program development, ensuring Rebuilt Village\'s work is funded and that every initiative produces measurable impact for youth.',
        imageUrl: '/assets/brand/placeholder-team.png',
    },
    {
        name: 'Jessica Ayala',
        title: 'Secretary',
        bio: 'Jessica keeps the organization organized and accountable — managing meeting records, board documentation, and organizational communications.',
        imageUrl: '/assets/brand/placeholder-team.png',
    },
    {
        name: 'Karen Rugerio',
        title: 'Board Member',
        bio: 'Karen brings expertise in youth internship development and career pathways, guiding how students transition from Rebuilt Village programs into working in the arts.',
        imageUrl: '/assets/brand/placeholder-team.png',
    },
    {
        name: 'Franny Titus',
        title: 'Board Member',
        bio: 'Franny is a Florida-based creative, performer, and content creator with a background in acting, production, and storytelling, currently expanding purpose-driven projects that inspire others.',
        imageUrl: '/assets/brand/placeholder-team.png',
    },
    {
        name: 'Shauna Golden',
        title: 'Board Member',
        bio: 'Shauna brings a blend of theatrical artistry and logistical precision to the team, drawing on her background as an actress and an experienced stage manager.',
        imageUrl: '/assets/brand/placeholder-team.png',
    },
    {
        name: 'Anthony Golden',
        title: 'Executive Director',
        bio: 'Anthony founded Rebuilt Village and leads the day-to-day operations and programming, bringing deep film production experience to build real pathways for the next generation of Orlando storytellers.',
        imageUrl: '/assets/brand/placeholder-team.png',
    },
];

function mapSanityBoardMember(m: SanityBoardMember): BoardMember {
    return {
        name: m.name,
        title: m.role,
        bio: m.bio,
        imageUrl: m.headshot
            ? urlFor(m.headshot).width(400).auto('format').url()
            : '/assets/brand/placeholder-team.png',
        linkedin: m.linkedIn,
        email: m.email,
    };
}

// ─── Board page ───────────────────────────────────────────────────────────────
export const Board: React.FC = () => {
  usePageMeta(
    'Board of Directors — Rebuilt Village',
    'Meet the board of directors of Rebuilt Village. Our nonprofit leadership guides strategy, accountability, and mission impact.'
  );
    const [boardMembers, setBoardMembers] = useState<BoardMember[]>(FALLBACK_BOARD);

    useEffect(() => {
        getBoardMembers()
            .then((members) => {
                if (members.length > 0) {
                    setBoardMembers(members.map(mapSanityBoardMember));
                }
            })
            .catch(() => { /* keep fallback */ });
    }, []);

    return (
        <>
            <Section bg="black" className="pt-32">
                <div className="text-center">
                    <div className="font-mono text-[10px] text-primary-text mb-4 uppercase tracking-[0.4em] font-bold">
                        Executive Committee
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8">
                        Board of Directors
                    </h1>
                    <div className="h-1 w-24 bg-primary/30 mx-auto mb-10" />
                    <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
                        Meet the dedicated leaders guiding Rebuilt Village's mission to empower youth through professional-grade film education.
                    </p>
                </div>
            </Section>

            <Section bg="black">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {boardMembers.map((member) => (
                            <div
                                key={member.name}
                                className="bg-slate-900/40 border border-border p-8 group hover:border-primary transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
                            >
                                {/* Headshot */}
                                <div className="aspect-square bg-black border border-border mb-8 overflow-hidden relative">
                                    <img
                                        src={member.imageUrl}
                                        alt={`${member.name}, ${member.title}`}
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" aria-hidden="true" />
                                </div>

                                {/* Info */}
                                <div>
                                    <div className="font-mono text-[9px] text-primary-text mb-3 uppercase tracking-[0.2em] font-bold">
                                        {member.title}
                                    </div>
                                    <h3 className="text-3xl font-serif italic text-text mb-4 leading-tight group-hover:text-primary-text transition-colors">
                                        {member.name}
                                    </h3>
                                    <p className="text-text-muted text-sm leading-relaxed mb-8 font-light">
                                        {member.bio}
                                    </p>

                                    {/* Links */}
                                    {(member.linkedin || member.email) && (
                                        <div className="flex space-x-6 pt-6 border-t border-border">
                                            {member.linkedin && (
                                                <a
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-text-muted/50 hover:text-text transition-colors"
                                                    aria-label={`${member.name} on LinkedIn`}
                                                >
                                                    <Linkedin size={18} />
                                                </a>
                                            )}
                                            {member.email && (
                                                <a
                                                    href={`mailto:${member.email}`}
                                                    className="text-text-muted/50 hover:text-text transition-colors"
                                                    aria-label={`Email ${member.name}`}
                                                >
                                                    <Mail size={18} />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Join the Board CTA */}
                    <div className="mt-24 text-center border-t border-border pt-20">
                        <div className="max-w-xl mx-auto p-12 bg-surface/20 border border-dashed border-border">
                            <h3 className="text-3xl font-serif italic text-text mb-6">
                                Executive Producer Call
                            </h3>
                            <p className="text-text-muted max-w-md mx-auto mb-10 leading-relaxed font-light">
                                We're always looking for passionate individuals who can contribute their expertise to advance our mission. Interested in a leadership role?
                            </p>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => window.location.href = 'mailto:hello@rebuiltvillage.org?subject=Board of Directors Inquiry'}
                            >
                                Apply to Board
                            </Button>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
};
