/**
 * seed-data.ts — single source of truth for migration content.
 *
 * Contains typed arrays mapping every FALLBACK_* element from the page
 * components to their corresponding Firestore document shapes.
 * No React imports; plain TypeScript only.
 *
 * Field-mapping decisions documented inline where the source and target
 * shapes diverge.
 */

import type {
  EventDoc,
  TeamMemberDoc,
  BoardMemberDoc,
  PostDoc,
  ProgramDoc,
} from '../types/firestore';

// ─── Events ──────────────────────────────────────────────────────────────────
// Source: pages/Events.tsx FALLBACK_EVENTS
// EventDoc extends the app Event type directly; every field is a 1-to-1 copy.
// Doc IDs are the existing Event.id values (already slug-shaped).

export const SEED_EVENTS: Array<EventDoc & { _docId: string }> = [
  {
    _docId: 'workshop-spring-2026',
    id: 'workshop-spring-2026',
    title: 'Spring Cinematography Workshop',
    date: '2026-04-05',
    day: '05',
    month: 'APR',
    year: '2026',
    time: '10:00 AM – 2:00 PM',
    location: 'John H. Jackson Community Center, Ocoee, FL',
    description:
      'Open to all community members. Hands-on training in camera operation, basic lighting, and storytelling fundamentals using Blackmagic Cinema cameras. No experience required — just bring your curiosity.',
    type: 'workshop',
    tags: ['All Ages', 'Free'],
  },
  {
    _docId: 'film-apalooza-2026',
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
    _docId: 'summer-camp-2026',
    id: 'summer-camp-2026',
    title: 'Summer Cinematography Camp',
    date: '2026-07-13',
    dateEnd: '2026-07-24',
    day: '13',
    month: 'JUL',
    year: '2026',
    time: 'July 13–24 · 9:00 AM – 3:00 PM (Weekdays)',
    location: 'John H. Jackson Community Center, Ocoee, FL',
    description:
      'Our flagship two-week summer intensive for youth ages 14–18. Students gain hands-on experience with Blackmagic and RED cameras, lighting rigs, color grading labs, and sound design — then premiere their original short films at a closing screening open to family and community.',
    type: 'workshop',
    featured: false,
    registrationUrl: '/programs',
    tags: ['Ages 14–18', 'Free to Students', '2 Weeks'],
  },
  {
    _docId: 'winter-gala-2026',
    id: 'winter-gala-2026',
    title: 'Annual Fundraising Gala',
    date: '2026-11-14',
    day: '14',
    month: 'NOV',
    year: '2026',
    time: '6:00 PM – 10:00 PM',
    location: 'TBD · Ocoee / Orlando Area',
    description:
      "Rebuilt Village's first annual fundraising gala celebrating one year of impact. An evening of short film screenings, live entertainment, and a silent auction supporting youth program scholarships. Sponsorship packages available.",
    type: 'fundraiser',
    registrationUrl: '/contact',
    tags: ['Fundraiser', '21+', 'Sponsorships Available'],
  },
  {
    _docId: 'inaugural-screening-2026',
    id: 'inaugural-screening-2026',
    title: 'Inaugural Community Screening Night',
    date: '2026-01-25',
    day: '25',
    month: 'JAN',
    year: '2026',
    time: '6:30 PM – 9:00 PM',
    location: 'John H. Jackson Community Center, Ocoee, FL',
    description:
      'Our first public event since founding in January 2025. We screened three short films produced through early programming and introduced Rebuilt Village to the broader Ocoee community. Over 107 attendees.',
    type: 'screening',
    tags: ['Free', 'Community'],
  },
  {
    _docId: 'donor-preview-2026',
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

// ─── Team Members ─────────────────────────────────────────────────────────────
// Source: pages/About.tsx FALLBACK_TEAM
// Display field `image` is a local placeholder path — stored as `headshot` in
// Firestore. Real headshots will be uploaded to Firebase Storage separately.
// Doc IDs are kebab-cased names.

export const SEED_TEAM_MEMBERS: Array<TeamMemberDoc & { _docId: string }> = [
  {
    _docId: 'tony-golden',
    name: 'Tony Golden',
    role: 'Executive Director',
    bio: "Tony leads Rebuilt Village's day-to-day operations and programming, bringing deep film production experience to build real pathways for the next generation of Orlando storytellers.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 1,
    active: true,
  },
  {
    _docId: 'steve-kohn',
    name: 'Steve Kohn',
    role: 'President',
    bio: "Steve co-founded Rebuilt Village with Tony and oversees organizational strategy, board governance, and long-term vision for film education in Central Florida.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 2,
    active: true,
  },
  {
    _docId: 'amanda-baez',
    name: 'Amanda Baez',
    role: 'Vice President',
    bio: "Amanda drives grant strategy and program development, ensuring Rebuilt Village's work is funded and that every initiative produces measurable impact for youth.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 3,
    active: true,
  },
  {
    _docId: 'kenya-fulton',
    name: 'Kenya Fulton',
    role: 'Treasurer',
    bio: "Kenya manages Rebuilt Village's financial stewardship and ensures every donor dollar is invested with transparency and accountability.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 4,
    active: true,
  },
  {
    _docId: 'jess-ayala',
    name: 'Jess Ayala',
    role: 'Secretary',
    bio: "Jess keeps the organization organized and accountable — managing meeting records, board documentation, and organizational communications.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 5,
    active: true,
  },
  {
    _docId: 'aaron-tanyhill',
    name: 'Aaron Tanyhill',
    role: 'Board Member',
    bio: "Aaron brings creative vision and community voice to Rebuilt Village's mission, helping shape programs and messaging that resonate with the people they serve.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 6,
    active: true,
  },
  {
    _docId: 'karen-rugerio',
    name: 'Karen Rugerio',
    role: 'Board Member',
    bio: "Karen brings expertise in youth internship development and career pathways, guiding how students transition from Rebuilt Village programs into working in the arts.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 7,
    active: true,
  },
  {
    _docId: 'nef-alexander',
    name: 'Nef Alexander',
    role: 'Social Media & Marketing',
    bio: "Nef leads Rebuilt Village's digital presence and brand storytelling — telling the organization's story to Central Florida and beyond.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 8,
    active: true,
  },
];

// ─── Board Members ────────────────────────────────────────────────────────────
// Source: pages/Board.tsx FALLBACK_BOARD
// Display field `title` maps to doc `role` (per migration spec).
// `imageUrl` maps to `headshot`.
// Doc IDs are kebab-cased names.

export const SEED_BOARD_MEMBERS: Array<BoardMemberDoc & { _docId: string }> = [
  {
    _docId: 'steve-kohn',
    name: 'Steve Kohn',
    role: 'President',
    bio: "Steve co-founded Rebuilt Village with Tony and oversees organizational strategy, board governance, and long-term vision for film education in Central Florida.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 1,
    active: true,
  },
  {
    _docId: 'amanda-baez',
    name: 'Amanda Baez',
    role: 'Vice President',
    bio: "Amanda drives grant strategy and program development, ensuring Rebuilt Village's work is funded and that every initiative produces measurable impact for youth.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 2,
    active: true,
  },
  {
    _docId: 'kenya-fulton',
    name: 'Kenya Fulton',
    role: 'Treasurer',
    bio: "Kenya manages Rebuilt Village's financial stewardship and ensures every donor dollar is invested with transparency and accountability.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 3,
    active: true,
  },
  {
    _docId: 'jess-ayala',
    name: 'Jess Ayala',
    role: 'Secretary',
    bio: "Jess keeps the organization organized and accountable — managing meeting records, board documentation, and organizational communications.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 4,
    active: true,
  },
  {
    _docId: 'aaron-tanyhill',
    name: 'Aaron Tanyhill',
    role: 'Board Member',
    bio: "Aaron brings creative vision and community voice to Rebuilt Village's mission, helping shape programs and messaging that resonate with the people they serve.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 5,
    active: true,
  },
  {
    _docId: 'karen-rugerio',
    name: 'Karen Rugerio',
    role: 'Board Member',
    bio: "Karen brings expertise in youth internship development and career pathways, guiding how students transition from Rebuilt Village programs into working in the arts.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 6,
    active: true,
  },
  {
    _docId: 'tony-golden',
    name: 'Tony Golden',
    role: 'Executive Director',
    bio: "Tony leads Rebuilt Village's day-to-day operations and programming, bringing deep film production experience to build real pathways for the next generation of Orlando storytellers.",
    headshot: '/assets/brand/placeholder-team.png',
    order: 7,
    active: true,
  },
];

// ─── Programs ─────────────────────────────────────────────────────────────────
// Source: pages/Programs.tsx FALLBACK_PROGRAMS
// Fields NOT stored: `icon` and `accentColor` (derived on the frontend from
//   `category` via CATEGORY_STYLE in Programs.tsx).
// Field mapping:
//   label  → shortLabel
//   who    → ageGroup
//   when   → schedule
//   where  → location
//   cta.path → enrollmentUrl
//   cta.label is discarded (frontend derives it from enrollmentUrl presence)
// Category key choices (must be valid keys in CATEGORY_STYLE or fall through):
//   'summer-camp'       → matches CATEGORY_STYLE key 'summer-camp'
//   'narrative-workshop'→ category 'storytelling' (CATEGORY_STYLE 'storytelling'
//                         has label 'Open to All', matching the source label)
//   'masterclass'       → category 'masterclass' (not in CATEGORY_STYLE; falls
//                         through to DEFAULT_STYLE with 'Specialty Sessions',
//                         matching the source label)
// Doc IDs are the existing Program.id values.

export const SEED_PROGRAMS: Array<ProgramDoc & { _docId: string }> = [
  {
    _docId: 'summer-camp',
    title: 'Summer Cinematography Camp',
    slug: 'summer-camp',
    shortLabel: 'Flagship Program',
    description:
      'Our two-week intensive for high school students who want to learn filmmaking by doing it. No experience required — just curiosity and commitment.',
    details:
      'Students train on the same Blackmagic Cinema and RED cameras used on professional productions. Every day blends theory with hands-on work: camera operation, lighting design, color grading, and sound. The camp closes with a public premiere of student-produced short films.',
    category: 'summer-camp',
    ageGroup: 'Youth ages 14–18',
    schedule: 'July 13–24, 2026 · Weekdays, 9 AM – 3 PM',
    location: 'John H. Jackson Community Center, Ocoee, FL',
    cost: 'Free',
    highlights: [
      'Blackmagic & RED camera training',
      'Professional lighting & grip',
      'Color grading lab',
      'Sound design fundamentals',
      'Public closing premiere',
      'Certificate of completion',
    ],
    enrollmentUrl: '/contact',
    featured: true,
    active: true,
  },
  {
    _docId: 'narrative-workshop',
    title: 'Narrative Preservation Workshop',
    slug: 'narrative-workshop',
    shortLabel: 'Open to All',
    description:
      'A recurring community workshop on documentary filmmaking and the art of telling stories that matter. Open to all ages and experience levels.',
    details:
      'These workshops focus on the craft of capturing real stories — interviewing techniques, observational shooting, ethical storytelling, and basic post-production. Participants leave with the skills and confidence to document their own community.',
    category: 'storytelling',
    ageGroup: 'All ages and experience levels',
    schedule: 'Ongoing — see Events calendar for upcoming dates',
    location: 'John H. Jackson Community Center, Ocoee, FL',
    cost: 'Free',
    highlights: [
      'Documentary storytelling techniques',
      'Interview and observational shooting',
      'Ethical narrative practices',
      'Mobile filmmaking included',
      'Mentorship from working filmmakers',
      'Community screening opportunities',
    ],
    enrollmentUrl: '/events',
    featured: false,
    active: true,
  },
  {
    _docId: 'masterclass',
    title: "Director's Masterclass Series",
    slug: 'masterclass',
    shortLabel: 'Specialty Sessions',
    description:
      'Periodic deep-dive sessions on specific technical and creative disciplines, led by professionals working in the Florida film industry.',
    details:
      'Each masterclass runs 4–6 hours and focuses on one topic: lighting and grip, directing for social impact, cinematography composition, or production design. Past sessions have included guest speakers from the Orlando production community, including our partners at Rebuilt Minds and All The Line Studio.',
    category: 'masterclass',
    ageGroup: 'Open to current program participants and community members',
    schedule: 'Scheduled periodically — check Events',
    location: 'John H. Jackson Community Center or partner studios',
    cost: 'Free',
    highlights: [
      'Single-day intensive format',
      'Industry professional instructors',
      'Topics: lighting, directing, cinematography',
      'Hands-on with professional gear',
      'Limited seats — priority for enrolled students',
      'Post-session Q&A',
    ],
    enrollmentUrl: '/events',
    featured: false,
    active: true,
  },
];

// ─── Posts ────────────────────────────────────────────────────────────────────
// Source: pages/Blog.tsx fallbackPosts (inline, not a named export)
// The source has one entry with no `excerpt` and no `body`.
// `slug` is stored flat (string), not as `{ current }` — the service maps it.
// `body` is a markdown string (authored in the FireCMS markdown editor and
//   rendered on-site via react-markdown). Seeded here from a short summary
//   sentence since the source post had no body text.
// `mainImage` is an external picsum URL — stored as-is for now; will be
//   replaced with a Firebase Storage path when real assets are uploaded.
// Doc ID is the slug string.

export const SEED_POSTS: Array<PostDoc & { _docId: string }> = [
  {
    _docId: 'award',
    title: 'Student Film "Echoes of Ocoee" Wins Regional Award',
    slug: 'award',
    excerpt:
      'A Rebuilt Village student film earned recognition at a regional film competition, marking a milestone for the program and its first cohort of student filmmakers.',
    category: 'News',
    author: 'Sarah Jenkins',
    mainImage: 'https://picsum.photos/seed/award/800/500',
    publishedAt: '2023-10-12',
    body: 'A Rebuilt Village student film earned recognition at a regional film competition, marking a milestone for the program and its first cohort of student filmmakers.',
  },
];
