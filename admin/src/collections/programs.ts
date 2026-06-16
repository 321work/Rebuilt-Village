import { buildCollection, buildProperty } from "@firecms/core";

/** Mirrors ProgramDoc in types/firestore.ts. */
export type ProgramEntity = {
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

export const programsCollection = buildCollection<ProgramEntity>({
  id: "programs",
  name: "Programs",
  singularName: "Program",
  path: "programs",
  icon: "School",
  description: "Youth film education programs offered by Rebuilt Village.",
  permissions,
  defaultSize: "m",
  properties: {
    title: buildProperty({
      name: "Title",
      dataType: "string",
      validation: { required: true, min: 3, max: 150 },
    }),
    slug: buildProperty({
      name: "Slug",
      description: "URL-safe identifier. Lowercase letters, numbers, hyphens only.",
      dataType: "string",
      validation: {
        required: true,
        matches: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        matchesMessage: "Lowercase letters, numbers, and single hyphens between words only",
      },
    }),
    shortLabel: buildProperty({
      name: "Short label",
      description: "Badge text shown on cards, e.g. \"Flagship Program\".",
      dataType: "string",
      validation: { max: 40 },
    }),
    description: buildProperty({
      name: "Description",
      description: "Lead paragraph shown on the program card.",
      dataType: "string",
      multiline: true,
      validation: { required: true, min: 20, max: 500 },
    }),
    details: buildProperty({
      name: "Details",
      description: "Extended description shown on the program detail page.",
      dataType: "string",
      multiline: true,
      validation: { max: 2000 },
    }),
    category: buildProperty({
      name: "Category",
      dataType: "string",
      enumValues: {
        "summer-camp": "Summer Camp",
        storytelling: "Storytelling / Open to All",
        masterclass: "Masterclass",
        afterschool: "After-School",
        community: "Community",
      },
      validation: { required: true },
    }),
    ageGroup: buildProperty({
      name: "Age group",
      description: 'Who the program is for, e.g. "Youth ages 14–18".',
      dataType: "string",
    }),
    schedule: buildProperty({
      name: "Schedule",
      description: 'Human-readable schedule, e.g. "July 13–24, 2026 · Weekdays, 9 AM – 3 PM".',
      dataType: "string",
    }),
    location: buildProperty({
      name: "Location",
      dataType: "string",
    }),
    cost: buildProperty({
      name: "Cost",
      description: 'e.g. "Free" or "$50 deposit".',
      dataType: "string",
    }),
    highlights: buildProperty({
      name: "Highlights",
      description: "Bullet points shown on the program card.",
      dataType: "array",
      of: buildProperty({ dataType: "string" }),
    }),
    enrollmentUrl: buildProperty({
      name: "Enrollment URL",
      description: "Link to enrollment form or internal path (e.g. /contact).",
      dataType: "string",
    }),
    image: buildProperty({
      name: "Program image",
      dataType: "string",
      storage: {
        storagePath: "public/programs",
        acceptedFiles: ["image/jpeg", "image/png", "image/webp"],
        maxSize: 5 * 1024 * 1024,
        metadata: { cacheControl: "max-age=31536000, immutable" },
        fileName: (context) => `${Date.now()}-${context.file.name}`,
      },
    }),
    partnerInstitution: buildProperty({
      name: "Partner institution",
      dataType: "string",
    }),
    featured: buildProperty({
      name: "Featured",
      description: "Show this program in the homepage carousel.",
      dataType: "boolean",
      defaultValue: false,
    }),
    active: buildProperty({
      name: "Active",
      description: "Uncheck to hide from the public site without deleting.",
      dataType: "boolean",
      defaultValue: true,
    }),
    _updatedAt: buildProperty({
      name: "Last updated",
      dataType: "date",
      readOnly: true,
      autoValue: "on_update",
    }),
  },
});
