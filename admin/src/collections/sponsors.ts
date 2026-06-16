import { buildCollection, buildProperty } from "@firecms/core";

/** Mirrors SponsorDoc in types/firestore.ts. */
export type SponsorEntity = {
  name: string;
  tier: string;
  logo?: string;
  url?: string;
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

export const sponsorsCollection = buildCollection<SponsorEntity>({
  id: "sponsors",
  name: "Sponsors",
  singularName: "Sponsor",
  path: "sponsors",
  icon: "Favorite",
  description: "Organizational sponsors displayed on the site.",
  permissions,
  defaultSize: "m",
  initialSort: ["order", "asc"],
  properties: {
    name: buildProperty({
      name: "Organization name",
      dataType: "string",
      validation: { required: true, min: 2, max: 150 },
    }),
    tier: buildProperty({
      name: "Tier",
      dataType: "string",
      enumValues: {
        platinum: "Platinum",
        gold: "Gold",
        silver: "Silver",
        bronze: "Bronze",
        "in-kind": "In-kind",
        community: "Community Partner",
      },
      validation: { required: true },
    }),
    logo: buildProperty({
      name: "Logo",
      dataType: "string",
      storage: {
        storagePath: "public/sponsors",
        acceptedFiles: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
        maxSize: 2 * 1024 * 1024,
        metadata: { cacheControl: "max-age=31536000, immutable" },
        fileName: (context) => `${Date.now()}-${context.file.name}`,
      },
    }),
    url: buildProperty({
      name: "Website URL",
      dataType: "string",
      url: true,
    }),
    order: buildProperty({
      name: "Order",
      description: "Lower numbers appear first within each tier.",
      dataType: "number",
      validation: { required: true, min: 0, integer: true },
      defaultValue: 100,
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
