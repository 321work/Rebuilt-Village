import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Impact statistics shown on the homepage / about page (e.g. "500+ Youth Served",
 * "$1.2M in Scholarships"). Ordered by the `order` field.
 */
export type ImpactStatEntity = {
  label: string;
  value: string;
  description?: string;
  icon?: string;
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

export const impactStatsCollection = buildCollection<ImpactStatEntity>({
  id: "impactStats",
  name: "Impact Stats",
  singularName: "Impact Stat",
  path: "impactStats",
  icon: "BarChart",
  description: "Quantified impact metrics displayed on the homepage and about page.",
  permissions,
  defaultSize: "m",
  properties: {
    label: buildProperty({
      name: "Label",
      description: 'Short metric name, e.g. "Youth Served" or "Scholarships Awarded".',
      dataType: "string",
      validation: { required: true, max: 80 },
    }),
    value: buildProperty({
      name: "Value",
      description: 'The headline number or figure, e.g. "500+" or "$1.2M".',
      dataType: "string",
      validation: { required: true, max: 30 },
    }),
    description: buildProperty({
      name: "Description",
      description: "Optional supporting sentence shown beneath the value.",
      dataType: "string",
      multiline: true,
      validation: { max: 200 },
    }),
    icon: buildProperty({
      name: "Icon name",
      description: 'Material icon name (optional), e.g. "School", "Favorite".',
      dataType: "string",
    }),
    order: buildProperty({
      name: "Display order",
      description: "Lower numbers appear first.",
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
