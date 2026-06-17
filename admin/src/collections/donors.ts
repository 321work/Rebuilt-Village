import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Donor collection - read-only in the UI.
 * Admins can read; editors can read. All client writes denied (Cloud Functions
 * write these via Admin SDK; Firestore rules enforce this).
 */
export type DonorEntity = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: string;
  firstGiftDate?: string;
  totalGiven?: number;
  giftCount?: number;
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

export const donorsCollection = buildCollection<DonorEntity>({
  id: "donors",
  name: "Donors",
  singularName: "Donor",
  path: "donors",
  icon: "VolunteerActivism",
  description: "Donor CRM records - read only. Populated by Cloud Functions.",
  permissions,
  defaultSize: "m",
  properties: {
    name: buildProperty({
      name: "Name",
      dataType: "string",
    }),
    email: buildProperty({
      name: "Email",
      dataType: "string",
    }),
    phone: buildProperty({
      name: "Phone",
      dataType: "string",
    }),
    address: buildProperty({
      name: "Address",
      dataType: "string",
    }),
    source: buildProperty({
      name: "Source",
      dataType: "string",
    }),
    firstGiftDate: buildProperty({
      name: "First gift date",
      dataType: "string",
    }),
    totalGiven: buildProperty({
      name: "Total given ($)",
      dataType: "number",
    }),
    giftCount: buildProperty({
      name: "Gift count",
      dataType: "number",
    }),
    notes: buildProperty({
      name: "Notes",
      dataType: "string",
      multiline: true,
    }),
  },
});
