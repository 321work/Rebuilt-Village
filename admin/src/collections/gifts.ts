import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Gifts collection — read-only in the UI.
 * Admins and editors can read. All writes go through Cloud Functions.
 */
export type GiftEntity = {
  donorId?: string;
  amount: number;
  currency?: string;
  date?: string;
  source?: string;
  projectId?: string;
  stripePaymentIntentId?: string;
  giverbutterId?: string;
  anonymous?: boolean;
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

export const giftsCollection = buildCollection<GiftEntity>({
  id: "gifts",
  name: "Gifts",
  singularName: "Gift",
  path: "gifts",
  icon: "CardGiftcard",
  description: "Individual gift / donation records — read only. Populated by Cloud Functions.",
  permissions,
  defaultSize: "m",
  properties: {
    donorId: buildProperty({
      name: "Donor ID",
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
    date: buildProperty({
      name: "Date",
      dataType: "string",
    }),
    source: buildProperty({
      name: "Source",
      description: "e.g. stripe, givebutter",
      dataType: "string",
    }),
    projectId: buildProperty({
      name: "Project ID",
      dataType: "string",
    }),
    stripePaymentIntentId: buildProperty({
      name: "Stripe payment intent ID",
      dataType: "string",
    }),
    giverbutterId: buildProperty({
      name: "Givebutter ID",
      dataType: "string",
    }),
    anonymous: buildProperty({
      name: "Anonymous",
      dataType: "boolean",
    }),
    notes: buildProperty({
      name: "Notes",
      dataType: "string",
      multiline: true,
    }),
  },
});
