import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Frequently asked questions shown on the FAQ / About page.
 * Grouped by optional category and ordered by `order`.
 */
export type FaqEntity = {
  question: string;
  answer: string;
  category?: string;
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

export const faqsCollection = buildCollection<FaqEntity>({
  id: "faqs",
  name: "FAQs",
  singularName: "FAQ",
  path: "faqs",
  icon: "QuestionAnswer",
  description: "Frequently asked questions displayed on the public site.",
  permissions,
  defaultSize: "m",
  properties: {
    question: buildProperty({
      name: "Question",
      dataType: "string",
      validation: { required: true, min: 5, max: 250 },
    }),
    answer: buildProperty({
      name: "Answer",
      description: "Supports markdown for basic formatting.",
      dataType: "string",
      multiline: true,
      validation: { required: true, min: 10, max: 2000 },
    }),
    category: buildProperty({
      name: "Category",
      description: 'Optional grouping header, e.g. "Programs", "Donations", "Volunteering".',
      dataType: "string",
      validation: { max: 80 },
    }),
    order: buildProperty({
      name: "Display order",
      description: "Lower numbers appear first within the same category.",
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
