// Content service. Reads the six content collections from Firestore and maps
// the stored documents to the page-facing shapes below. Named `sanityService`
// for historical reasons (the page import paths predate the FireCMS migration);
// the data source is now Firestore, not Sanity.
//
// Safety: every getter is wrapped so a Firestore error (offline, empty project,
// missing emulator in dev) returns []/null and the pages keep rendering from
// their FALLBACK_* arrays. A 60s in-memory cache mirrors projectBalancesService.

import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseClient';
import { COLLECTIONS } from '../types/firestore';
import type {
  BoardMemberDoc,
  EventDoc,
  PostDoc,
  ProgramDoc,
  TeamMemberDoc,
} from '../types/firestore';
import { Event } from '../types';

// ─── Page-facing interfaces (retained so page imports do not change) ──────────

export interface SanityProgram {
    _id: string;
    title: string;
    description: string;
    image: any;
    category: string;
    featured: boolean;
}

export interface SanityPost {
    _id: string;
    title: string;
    slug: { current: string };
    excerpt: string;
    category: string;
    author: string;
    mainImage: any;
    publishedAt: string;
    body: string;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
    };
}

export interface SanityEvent {
    _id: string;
    title: string;
    date: string;
    dateEnd?: string;
    time: string;
    location: string;
    description: string;
    type: Event['type'];
    featured?: boolean;
    registrationUrl?: string;
    sponsoredBy?: string;
    tags?: string[];
}

export interface SanityTeamMember {
    _id: string;
    name: string;
    role: string;
    bio: string;
    headshot?: any;
    order: number;
    active: boolean;
    socialLinks?: Array<{
        platform: string;
        url: string;
    }>;
}

export interface SanityBoardMember {
    _id: string;
    name: string;
    role: string;
    bio: string;
    headshot?: any;
    order: number;
    active: boolean;
    linkedIn?: string;
    email?: string;
    committees?: string[];
    termStart?: string;
    termEnd?: string;
}

export interface SanityProgramFull {
    _id: string;
    title: string;
    slug: { current: string };
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
    image?: any;
    partnerInstitution?: string;
    featured: boolean;
    active: boolean;
}

// ─── 60s in-memory cache (mirrors projectBalancesService polling TTL) ─────────

const CACHE_TTL_MS = 60_000;
interface CacheEntry<T> { at: number; value: T; }
const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Reads a whole (small) collection once per TTL window. On error, serves the
 * last good value if we have one, otherwise the provided fallback. Collections
 * are tiny, so we fetch all docs and filter/sort in JS — this avoids any
 * composite-index requirement in production.
 */
async function loadCollection<TDoc>(name: string): Promise<Array<TDoc & { _id: string }>> {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ _id: d.id, ...(d.data() as TDoc) }));
}

async function cached<T>(key: string, loader: () => Promise<T>, fallback: T): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  try {
    const value = await loader();
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (err) {
    console.warn(`[content] "${key}" load failed, using fallback:`, err);
    return hit ? hit.value : fallback;
  }
}

const byOrder = (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0);

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getEvents = async (): Promise<Event[]> =>
  cached('events', async () => {
    const docs = await loadCollection<EventDoc>(COLLECTIONS.events);
    return docs
      .map(({ _id, _updatedAt, ...rest }) => rest as unknown as Event)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, []);

export const getTeamMembers = async (): Promise<SanityTeamMember[]> =>
  cached('teamMembers', async () => {
    const docs = await loadCollection<TeamMemberDoc>(COLLECTIONS.teamMembers);
    return docs
      .filter((d) => d.active !== false)
      .sort(byOrder)
      .map((d) => ({
        _id: d._id,
        name: d.name,
        role: d.role,
        bio: d.bio,
        headshot: d.headshot,
        order: d.order,
        active: d.active,
        socialLinks: d.socialLinks,
      }));
  }, []);

export const getBoardMembers = async (): Promise<SanityBoardMember[]> =>
  cached('boardMembers', async () => {
    const docs = await loadCollection<BoardMemberDoc>(COLLECTIONS.boardMembers);
    return docs
      .filter((d) => d.active !== false)
      .sort(byOrder)
      .map((d) => ({
        _id: d._id,
        name: d.name,
        role: d.role,
        bio: d.bio,
        headshot: d.headshot,
        order: d.order,
        active: d.active,
        linkedIn: d.linkedIn,
        email: d.email,
        committees: d.committees,
        termStart: d.termStart,
        termEnd: d.termEnd,
      }));
  }, []);

export const getProgramsFull = async (): Promise<SanityProgramFull[]> =>
  cached('programs', async () => {
    const docs = await loadCollection<ProgramDoc>(COLLECTIONS.programs);
    return docs
      .filter((d) => d.active !== false)
      .map((d) => ({
        _id: d._id,
        title: d.title,
        slug: { current: d.slug },
        shortLabel: d.shortLabel,
        description: d.description,
        details: d.details,
        category: d.category,
        ageGroup: d.ageGroup,
        schedule: d.schedule,
        location: d.location,
        cost: d.cost,
        highlights: d.highlights,
        enrollmentUrl: d.enrollmentUrl,
        image: d.image,
        partnerInstitution: d.partnerInstitution,
        featured: d.featured,
        active: d.active,
      }));
  }, []);

export const getPrograms = async (): Promise<SanityProgram[]> => {
  const full = await getProgramsFull();
  return full.map((p) => ({
    _id: p._id,
    title: p.title,
    description: p.description,
    image: p.image,
    category: p.category,
    featured: p.featured,
  }));
};

export const getPosts = async (): Promise<SanityPost[]> =>
  cached('posts', async () => {
    const docs = await loadCollection<PostDoc>(COLLECTIONS.posts);
    return docs
      .map((d) => ({
        _id: d._id,
        title: d.title,
        slug: { current: d.slug },
        excerpt: d.excerpt,
        category: d.category,
        author: d.author,
        mainImage: d.mainImage,
        publishedAt: d.publishedAt,
        body: d.body,
        seo: d.seo,
      }))
      .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
  }, []);

export const getPostBySlug = async (slug: string): Promise<SanityPost | null> => {
  const posts = await getPosts();
  return posts.find((p) => p.slug.current === slug) ?? null;
};
