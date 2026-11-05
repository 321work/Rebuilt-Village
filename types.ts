export enum View {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  PROGRAMS = 'PROGRAMS',
  GALLERY = 'GALLERY',
  DONATE = 'DONATE',
  CONTACT = 'CONTACT',
  BLOG = 'BLOG',
  EVENTS = 'EVENTS',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
  BOARD = 'BOARD',
  DOCUMENTS = 'DOCUMENTS',
  FAQ = 'FAQ',
}

export interface StudentFilm {
  id: string;
  title: string;
  studentName: string;
  grade: string;
  thumbnailUrl: string;
  description: string;
  tags: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface Program {
  title: string;
  description: string;
  ageGroup: string;
  duration: string;
  imageUrl: string;
  features: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  imageUrl: string;
  category: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;        // ISO date for sorting/comparison (YYYY-MM-DD)
  dateEnd?: string;    // ISO end date for multi-day events
  day: string;
  month: string;
  year?: string;
  time: string;
  location: string;
  description: string;
  type: 'workshop' | 'screening' | 'community' | 'festival' | 'fundraiser';
  registrationUrl?: string;
  featured?: boolean;
  sponsoredBy?: string;
  accentColor?: string; // hex override — bypasses CSS variable bug
  tags?: string[];
  datesTba?: boolean;   // season is known but the dates are not (card shows "TBA")
}
