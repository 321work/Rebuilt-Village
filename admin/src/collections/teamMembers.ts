import { buildCollection, buildProperty } from "@firecms/core";

/** Mirrors TeamMemberDoc in types/firestore.ts. */
export type TeamMemberEntity = {
  name: string;
  role: string;
  bio: string;
  headshot?: string;
  order: number;
  active: boolean;
  socialLinks?: Array<{ platform: string; url: string }>;
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

export const teamMembersCollection = buildCollection<TeamMemberEntity>({
  id: "teamMembers",
  name: "Team Members",
  singularName: "Team Member",
  path: "teamMembers",
  icon: "People",
  description: "Staff and leadership displayed on the About page.",
  permissions,
  defaultSize: "m",
  initialSort: ["order", "asc"],
  properties: {
    name: buildProperty({
      name: "Name",
      dataType: "string",
      validation: { required: true, min: 2, max: 100 },
    }),
    role: buildProperty({
      name: "Role / Title",
      dataType: "string",
      validation: { required: true, max: 100 },
    }),
    bio: buildProperty({
      name: "Bio",
      dataType: "string",
      multiline: true,
      validation: { required: true, min: 10, max: 1000 },
    }),
    headshot: buildProperty({
      name: "Headshot",
      dataType: "string",
      storage: {
        storagePath: "public/team",
        acceptedFiles: ["image/jpeg", "image/png", "image/webp"],
        maxSize: 5 * 1024 * 1024,
        metadata: { cacheControl: "max-age=31536000, immutable" },
        fileName: (context) => `${Date.now()}-${context.file.name}`,
      },
    }),
    order: buildProperty({
      name: "Order",
      description: "Lower numbers appear first.",
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
    socialLinks: buildProperty({
      name: "Social links",
      dataType: "array",
      of: buildProperty({
        dataType: "map",
        properties: {
          platform: buildProperty({
            name: "Platform",
            dataType: "string",
            enumValues: {
              linkedin: "LinkedIn",
              instagram: "Instagram",
              twitter: "Twitter / X",
              facebook: "Facebook",
              website: "Website",
            },
          }),
          url: buildProperty({
            name: "URL",
            dataType: "string",
            url: true,
          }),
        },
      }),
    }),
    _updatedAt: buildProperty({
      name: "Last updated",
      dataType: "date",
      readOnly: true,
      autoValue: "on_update",
    }),
  },
});
