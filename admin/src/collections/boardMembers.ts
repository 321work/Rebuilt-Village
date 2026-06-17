import { buildCollection, buildProperty } from "@firecms/core";

/** Mirrors BoardMemberDoc in types/firestore.ts. */
export type BoardMemberEntity = {
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

export const boardMembersCollection = buildCollection<BoardMemberEntity>({
  id: "boardMembers",
  name: "Board Members",
  singularName: "Board Member",
  path: "boardMembers",
  icon: "AccountBalance",
  description: "Board of directors displayed on the Board page.",
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
        storagePath: "public/board",
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
    linkedIn: buildProperty({
      name: "LinkedIn URL",
      dataType: "string",
      url: true,
    }),
    email: buildProperty({
      name: "Email",
      dataType: "string",
      email: true,
    }),
    committees: buildProperty({
      name: "Committees",
      dataType: "array",
      of: buildProperty({ dataType: "string" }),
    }),
    termStart: buildProperty({
      name: "Term start",
      description: "Year term began, e.g. 2024.",
      dataType: "string",
    }),
    termEnd: buildProperty({
      name: "Term end",
      description: "Year term ends, or leave blank if ongoing.",
      dataType: "string",
    }),
    _updatedAt: buildProperty({
      name: "Last updated",
      dataType: "date",
      readOnly: true,
      autoValue: "on_update",
    }),
  },
});
