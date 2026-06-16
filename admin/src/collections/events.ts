import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Mirrors EventDoc in types/firestore.ts + the app Event interface in types.ts.
 * Doc ID == Event.id (slug-shaped string).
 */
export type EventEntity = {
  // Core display fields (from app Event)
  id: string;
  title: string;
  date: string;         // YYYY-MM-DD ISO date
  dateEnd?: string;     // YYYY-MM-DD ISO end date for multi-day events
  day: string;          // display day ("05")
  month: string;        // display month ("APR")
  year?: string;        // display year ("2026")
  time: string;         // human-readable time string
  location: string;
  description: string;
  type: "workshop" | "screening" | "community" | "festival" | "fundraiser";
  registrationUrl?: string;
  featured?: boolean;
  sponsoredBy?: string;
  tags?: string[];
  // CMS management fields
  active: boolean;
  _updatedAt?: unknown;
};

const permissions = ({ user }: { user: { roles?: Array<{ id: string }> } | null }) => {
  const roles = user?.roles ?? [];
  const isAdmin = roles.some((r) => r.id === "admin");
  const isEditor = roles.some((r) => r.id === "editor");
  return {
    read: true,
    create: isAdmin || isEditor,
    edit: isAdmin || isEditor,
    delete: isAdmin,
  };
};

export const eventsCollection = buildCollection<EventEntity>({
  id: "events",
  name: "Events",
  singularName: "Event",
  path: "events",
  icon: "Event",
  description: "Workshops, screenings, community events, festivals, and fundraisers.",
  permissions,
  defaultSize: "m",
  properties: {
    title: buildProperty({
      name: "Title",
      dataType: "string",
      validation: { required: true, min: 3, max: 120 },
    }),
    id: buildProperty({
      name: "ID / Slug",
      description: "Unique slug used as document ID. Lowercase letters, numbers, and hyphens.",
      dataType: "string",
      validation: {
        required: true,
        matches: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        matchesMessage: "Lowercase letters, numbers, and single hyphens only",
      },
    }),
    type: buildProperty({
      name: "Event type",
      dataType: "string",
      enumValues: {
        workshop: "Workshop",
        screening: "Screening",
        community: "Community event",
        festival: "Festival",
        fundraiser: "Fundraiser",
      },
      validation: { required: true },
    }),
    date: buildProperty({
      name: "Start date",
      description: "ISO date (YYYY-MM-DD). Used for sorting.",
      dataType: "string",
      validation: {
        required: true,
        matches: /^\d{4}-\d{2}-\d{2}$/,
        matchesMessage: "Format: YYYY-MM-DD",
      },
    }),
    dateEnd: buildProperty({
      name: "End date",
      description: "ISO end date for multi-day events (YYYY-MM-DD). Leave blank for single-day.",
      dataType: "string",
      validation: {
        matches: /^\d{4}-\d{2}-\d{2}$/,
        matchesMessage: "Format: YYYY-MM-DD",
      },
    }),
    day: buildProperty({
      name: "Day (display)",
      description: 'Display day number, e.g. "05".',
      dataType: "string",
      validation: { required: true },
    }),
    month: buildProperty({
      name: "Month (display)",
      description: 'Display month abbreviation, e.g. "APR".',
      dataType: "string",
      validation: { required: true },
    }),
    year: buildProperty({
      name: "Year (display)",
      description: 'Four-digit year, e.g. "2026".',
      dataType: "string",
    }),
    time: buildProperty({
      name: "Time",
      description: 'Human-readable time string, e.g. "10:00 AM – 2:00 PM".',
      dataType: "string",
      validation: { required: true },
    }),
    location: buildProperty({
      name: "Location",
      dataType: "string",
      validation: { required: true },
    }),
    description: buildProperty({
      name: "Description",
      dataType: "string",
      multiline: true,
      validation: { required: true, min: 10, max: 2000 },
    }),
    featured: buildProperty({
      name: "Featured",
      description: "Pin this event to the top of the events page.",
      dataType: "boolean",
      defaultValue: false,
    }),
    active: buildProperty({
      name: "Active",
      description: "Uncheck to hide from the public site without deleting.",
      dataType: "boolean",
      defaultValue: true,
    }),
    registrationUrl: buildProperty({
      name: "Registration URL",
      description: "Link to registration page or internal path (e.g. /contact).",
      dataType: "string",
    }),
    sponsoredBy: buildProperty({
      name: "Sponsored by",
      dataType: "string",
    }),
    tags: buildProperty({
      name: "Tags",
      dataType: "array",
      of: buildProperty({ dataType: "string" }),
    }),
    _updatedAt: buildProperty({
      name: "Last updated",
      dataType: "date",
      readOnly: true,
      autoValue: "on_update",
    }),
  },
});
