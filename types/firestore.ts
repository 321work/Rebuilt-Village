/**
 * Firestore document shapes for the six content collections.
 *
 * These describe what is STORED in Firestore. `services/sanityService.ts` reads
 * these docs and maps them to the page-facing `Sanity*` return types (e.g. a flat
 * `slug` string here becomes `{ current }` there). Keeping storage shapes separate
 * from return shapes lets the CMS schema and the page contracts evolve independently.
 *
 * Image fields hold a Firebase Storage path (or absolute URL); `urlFor()` resolves
 * them. `_updatedAt` is written as a server timestamp by FireCMS / the migration.
 */
import type { Event } from '../types';

/** Canonical content collection names. Mirrors CLAUDE.md's canonical list. */
export const COLLECTIONS = {
  events: 'events',
  teamMembers: 'teamMembers',
  boardMembers: 'boardMembers',
  posts: 'posts',
  programs: 'programs',
  sponsors: 'sponsors',
} as const;

export type ContentCollection = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Marker for the server-managed update timestamp present on every content doc. */
export interface WithUpdatedAt {
  /** Firestore Timestamp on read; serverTimestamp() sentinel on write. */
  _updatedAt?: unknown;
}

/** `events` — stored shape is the app `Event` (doc id === Event.id). */
export interface EventDoc extends Event, WithUpdatedAt {}

/** `teamMembers` */
export interface TeamMemberDoc extends WithUpdatedAt {
  name: string;
  role: string;
  bio: string;
  headshot?: string;
  order: number;
  active: boolean;
  socialLinks?: Array<{ platform: string; url: string }>;
}

/** `boardMembers` */
export interface BoardMemberDoc extends WithUpdatedAt {
  name: string;
  role: string;
  bio: string;
  headshot?: string;
  order: number;
  active: boolean;
  linkedIn?: string;
  email?: string;
  committees?: string[];
  termStart?: string;
  termEnd?: string;
}

/** `posts` — `slug` and `body` are stored flat; the service maps slug → { current }. */
export interface PostDoc extends WithUpdatedAt {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  mainImage?: string;
  publishedAt: string; // ISO date
  body: string; // markdown (authored in the FireCMS markdown editor)
  seo?: { metaTitle?: string; metaDescription?: string };
}

/** `programs` — full shape; `getPrograms()` projects a subset for the home carousel. */
export interface ProgramDoc extends WithUpdatedAt {
  title: string;
  slug: string;
  shortLabel?: string;
  description: string;
  details?: string;
  category: string;
  ageGroup?: string;
  schedule?: string;
  location?: string;
  cost?: string;
  highlights?: string[];
  enrollmentUrl?: string;
  image?: string;
  partnerInstitution?: string;
  featured: boolean;
  active: boolean;
}

/** `sponsors` — no page reads this yet; defined for the FireCMS schema + future use. */
export interface SponsorDoc extends WithUpdatedAt {
  name: string;
  tier: string;
  logo?: string;
  url?: string;
  order: number;
  active: boolean;
}
