import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Site-wide singleton settings (hero copy, contact info, social links, SEO defaults).
 * Admins only — these are global and breaking changes are high-impact.
 */
export type SiteSettingsEntity = {
  heroHeadline?: string;
  heroSubheading?: string;
  heroCtaLabel?: string;
  heroCtaUrl?: string;
  heroImage?: string;
  missionStatement?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  _updatedAt?: unknown;
};

const permissions = ({ user }: { user: { roles?: Array<{ id: string }> } | null }) => {
  const roles = user?.roles ?? [];
  const isAdmin = roles.some((r) => r.id === "admin");
  return {
    read: isAdmin,
    create: isAdmin,
    edit: isAdmin,
    delete: false,
  };
};

export const siteSettingsCollection = buildCollection<SiteSettingsEntity>({
  id: "siteSettings",
  name: "Site Settings",
  singularName: "Site Setting",
  path: "siteSettings",
  icon: "Settings",
  description: "Global site settings — hero copy, contact info, social links, SEO defaults.",
  permissions,
  defaultSize: "m",
  properties: {
    heroHeadline: buildProperty({
      name: "Hero headline",
      description: "Primary headline shown in the homepage hero section.",
      dataType: "string",
      validation: { max: 120 },
    }),
    heroSubheading: buildProperty({
      name: "Hero subheading",
      description: "Supporting text below the hero headline.",
      dataType: "string",
      multiline: true,
      validation: { max: 300 },
    }),
    heroCtaLabel: buildProperty({
      name: "Hero CTA label",
      description: 'Button label, e.g. "Get Involved".',
      dataType: "string",
      validation: { max: 60 },
    }),
    heroCtaUrl: buildProperty({
      name: "Hero CTA URL",
      description: "Destination path or full URL for the hero button.",
      dataType: "string",
    }),
    heroImage: buildProperty({
      name: "Hero image",
      dataType: "string",
      storage: {
        storagePath: "public/site",
        acceptedFiles: ["image/jpeg", "image/png", "image/webp"],
        maxSize: 8 * 1024 * 1024,
        metadata: { cacheControl: "max-age=31536000, immutable" },
        fileName: (context) => `hero-${Date.now()}-${context.file.name}`,
      },
    }),
    missionStatement: buildProperty({
      name: "Mission statement",
      description: "Short mission copy used in the about section and meta descriptions.",
      dataType: "string",
      multiline: true,
      validation: { max: 500 },
    }),
    contactEmail: buildProperty({
      name: "Contact email",
      dataType: "string",
    }),
    contactPhone: buildProperty({
      name: "Contact phone",
      dataType: "string",
    }),
    contactAddress: buildProperty({
      name: "Contact address",
      description: "Mailing or physical address displayed on the Contact page.",
      dataType: "string",
      multiline: true,
    }),
    socialFacebook: buildProperty({
      name: "Facebook URL",
      dataType: "string",
    }),
    socialInstagram: buildProperty({
      name: "Instagram URL",
      dataType: "string",
    }),
    socialTwitter: buildProperty({
      name: "Twitter / X URL",
      dataType: "string",
    }),
    socialYoutube: buildProperty({
      name: "YouTube URL",
      dataType: "string",
    }),
    seoTitle: buildProperty({
      name: "Default SEO title",
      description: "Fallback <title> tag when no page-specific title is set.",
      dataType: "string",
      validation: { max: 70 },
    }),
    seoDescription: buildProperty({
      name: "Default SEO description",
      description: "Fallback meta description.",
      dataType: "string",
      multiline: true,
      validation: { max: 160 },
    }),
    seoImage: buildProperty({
      name: "Default OG image",
      description: "Fallback Open Graph image for social sharing.",
      dataType: "string",
      storage: {
        storagePath: "public/site",
        acceptedFiles: ["image/jpeg", "image/png", "image/webp"],
        maxSize: 2 * 1024 * 1024,
        metadata: { cacheControl: "max-age=31536000, immutable" },
        fileName: (context) => `og-${Date.now()}-${context.file.name}`,
      },
    }),
    _updatedAt: buildProperty({
      name: "Last updated",
      dataType: "date",
      readOnly: true,
      autoValue: "on_update",
    }),
  },
});
