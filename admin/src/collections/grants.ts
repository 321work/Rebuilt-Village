import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Grants collection - read-only in the UI.
 * Admins and editors can read. All writes go through Cloud Functions.
 */
export type GrantEntity = {
  funder?: string;
  amount?: number;
  currency?: string;
  awardDate?: string;
  expiryDate?: string;
  status?: string;
  projectId?: string;
  reportDue?: string;
  notes?: string;
};

const permissions = ({ user }: { user: { roles?: Array<{ id: string }> } | null }) => {
  const roles = user?.roles ?? [];
  const isAdmin = roles.some((r) => r.id === "admin");
  const isEditor = roles.some((r) => r.id === "editor");
  const canRead = isAdmin || isEditor;
  return {
    read: canRead,
    create: false,
    edit: false,
    delete: false,
  };
};

export const grantsCollection = buildCollection<GrantEntity>({
  id: "grants",
  name: "Grants",
  singularName: "Grant",
  path: "grants",
  icon: "AssuredWorkload",
  description: "Grant awards and tracking - read only. Populated by Cloud Functions.",
  permissions,
  defaultSize: "m",
  properties: {
    funder: buildProperty({
      name: "Funder",
      dataType: "string",
    }),
    amount: buildProperty({
      name: "Amount ($)",
      dataType: "number",
    }),
    currency: buildProperty({
      name: "Currency",
      dataType: "string",
    }),
    awardDate: buildProperty({
      name: "Award date",
      dataType: "string",
    }),
    expiryDate: buildProperty({
      name: "Expiry date",
      dataType: "string",
    }),
    status: buildProperty({
      name: "Status",
      dataType: "string",
      enumValues: {
        active: "Active",
        pending: "Pending",
        closed: "Closed",
        "report-due": "Report due",
      },
    }),
    projectId: buildProperty({
      name: "Project ID",
      dataType: "string",
    }),
    reportDue: buildProperty({
      name: "Report due date",
      dataType: "string",
    }),
    notes: buildProperty({
      name: "Notes",
      dataType: "string",
      multiline: true,
    }),
  },
});
