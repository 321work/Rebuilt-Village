import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Testimonials from youth alumni, community members, and partners.
 * Featured testimonials surface on the homepage; all are available on a
 * dedicated testimonials section.
 */
export type TestimonialEntity = {
  quote: string;
  author: string;
  role?: string;
  organization?: string;
  avatar?: string;
  program?: string;
  featured: boolean;
  order: number;
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

export const testimonialsCollection = buildCollection<TestimonialEntity>({
  id: "testimonials",
  name: "Testimonials",
  singularName: "Testimonial",
  path: "testimonials",
  icon: "FormatQuote",
  description: "Quotes from youth, families, and community partners shown on the site.",
  permissions,
  defaultSize: "m",
  properties: {
    quote: buildProperty({
      name: "Quote",
      description: "The testimonial text (no quotation marks needed — the UI adds them).",
      dataType: "string",
      multiline: true,
      validation: { required: true, min: 20, max: 600 },
    }),
    author: buildProperty({
      name: "Author name",
      dataType: "string",
      validation: { required: true, max: 100 },
    }),
    role: buildProperty({
      name: "Role / title",
      description: 'e.g. "Program Alumna, 2024" or "Parent".',
      dataType: "string",
      validation: { max: 100 },
    }),
    organization: buildProperty({
      name: "Organization",
      description: "Optional organization or school affiliation.",
      dataType: "string",
      validation: { max: 120 },
    }),
    avatar: buildProperty({
      name: "Author photo",
      description: "Optional headshot or portrait.",
      dataType: "string",
      storage: {
        storagePath: "public/testimonials",
        acceptedFiles: ["image/jpeg", "image/png", "image/webp"],
        maxSize: 2 * 1024 * 1024,
        metadata: { cacheControl: "max-age=31536000, immutable" },
        fileName: (context) => `${Date.now()}-${context.file.name}`,
      },
    }),
    program: buildProperty({
      name: "Linked program",
      description: "Optional program name this testimonial relates to.",
      dataType: "string",
    }),
    featured: buildProperty({
      name: "Featured",
      description: "Show this testimonial on the homepage.",
      dataType: "boolean",
      defaultValue: false,
    }),
    order: buildProperty({
      name: "Display order",
      description: "Lower numbers appear first.",
      dataType: "number",
      defaultValue: 0,
      validation: { required: true },
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
