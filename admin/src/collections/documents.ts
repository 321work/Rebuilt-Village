import { buildCollection, buildProperty } from "@firecms/core";

/** Mirrors DocumentDoc in types/firestore.ts. Public transparency documents
 * (Form 990, IRS determination letter, bylaws, COI, financials) shown on the
 * site's /documents page. Editors upload PDFs here; no developer needed. */
export type DocumentEntity = {
  title: string;
  category: "tax" | "financial" | "governance" | "annual";
  file?: string;
  externalUrl?: string;
  description?: string;
  year?: string;
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

export const documentsCollection = buildCollection<DocumentEntity>({
  id: "documents",
  name: "Documents",
  singularName: "Document",
  path: "documents",
  icon: "Description",
  description:
    "Public transparency documents (990s, determination letter, bylaws) shown on the /documents page.",
  permissions,
  defaultSize: "m",
  initialSort: ["order", "asc"],
  properties: {
    title: buildProperty({
      name: "Title",
      dataType: "string",
      validation: { required: true, min: 2, max: 200 },
    }),
    category: buildProperty({
      name: "Category",
      dataType: "string",
      enumValues: {
        tax: "Tax (990, determination letter)",
        financial: "Financial (statements, reports)",
        governance: "Governance (bylaws, COI, articles)",
        annual: "Annual report",
      },
      validation: { required: true },
    }),
    file: buildProperty({
      name: "PDF file",
      description:
        "Upload the document PDF. Leave empty if linking to an external URL instead.",
      dataType: "string",
      storage: {
        storagePath: "public/documents",
        acceptedFiles: ["application/pdf"],
        maxSize: 25 * 1024 * 1024,
        metadata: { cacheControl: "max-age=31536000, immutable" },
        fileName: (context) => `${Date.now()}-${context.file.name}`,
      },
    }),
    externalUrl: buildProperty({
      name: "External URL",
      description: "Optional link used when the document is hosted elsewhere (e.g. ProPublica).",
      dataType: "string",
      url: true,
    }),
    description: buildProperty({
      name: "Description",
      dataType: "string",
      multiline: true,
      validation: { max: 500 },
    }),
    year: buildProperty({
      name: "Record year",
      description: "Displayed on the tile, e.g. 2024.",
      dataType: "string",
      validation: { max: 12 },
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
    _updatedAt: buildProperty({
      name: "Last updated",
      dataType: "date",
      readOnly: true,
      autoValue: "on_update",
    }),
  },
});
