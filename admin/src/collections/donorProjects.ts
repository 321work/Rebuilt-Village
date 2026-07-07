import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Donor-facing fundraising projects / campaigns (e.g. "Summer Camp Scholarship Fund").
 * Public site reads these to show goals and progress. Admin-only write —
 * editors do not manage fundraising targets. Firestore rules enforce this.
 */
export type DonorProjectEntity = {
  title: string;
  slug: string;
  description: string;
  goalAmount?: number;
  raisedAmount?: number;
  coverImage?: string;
  donateUrl?: string;
  program?: string;
  featured: boolean;
  active: boolean;
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

export const donorProjectsCollection = buildCollection<DonorProjectEntity>({
  id: "donorProjects",
  name: "Donor Projects",
  singularName: "Donor Project",
  path: "donorProjects",
  icon: "Campaign",
  description: "Fundraising campaigns shown to donors. Admin only — editors cannot manage targets.",
  permissions,
  defaultSize: "m",
  properties: {
    title: buildProperty({
      name: "Project title",
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
    description: buildProperty({
      name: "Description",
      description: "Why donors should give to this project.",
      dataType: "string",
      multiline: true,
      validation: { required: true, min: 20, max: 1000 },
    }),
    goalAmount: buildProperty({
      name: "Fundraising goal ($)",
      description: "Target dollar amount for this campaign.",
      dataType: "number",
    }),
    raisedAmount: buildProperty({
      name: "Amount raised ($)",
      description: "Current total raised. Can be updated manually or via Cloud Function.",
      dataType: "number",
    }),
    coverImage: buildProperty({
      name: "Cover image",
      dataType: "string",
      storage: {
        storagePath: "public/donor-projects",
        acceptedFiles: ["image/jpeg", "image/png", "image/webp"],
        maxSize: 5 * 1024 * 1024,
        metadata: { cacheControl: "max-age=31536000, immutable" },
        fileName: (context) => `${Date.now()}-${context.file.name}`,
      },
    }),
    donateUrl: buildProperty({
      name: "Donate URL",
      description: "External link to the donation form for this specific project.",
      dataType: "string",
    }),
    program: buildProperty({
      name: "Linked program",
      description: "Optional program this campaign supports.",
      dataType: "string",
    }),
    featured: buildProperty({
      name: "Featured",
      description: "Show this project prominently on the Donate page.",
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
