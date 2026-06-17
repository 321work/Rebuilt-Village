import { buildCollection, buildProperty } from "@firecms/core";

/**
 * Mirrors PostDoc in types/firestore.ts.
 * body is stored as markdown string (FireCMS markdown editor);
 * the service layer converts it to portable-text-compatible blocks for the frontend.
 */
export type PostEntity = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  mainImage?: string;
  publishedAt: string; // ISO date YYYY-MM-DD
  body: string;        // Markdown; stored flat, not as portable-text blocks
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
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

export const postsCollection = buildCollection<PostEntity>({
  id: "posts",
  name: "Blog Posts",
  singularName: "Blog Post",
  path: "posts",
  icon: "Article",
  description: "Blog posts and news articles published on the site.",
  permissions,
  defaultSize: "m",
  initialSort: ["publishedAt", "desc"],
  properties: {
    title: buildProperty({
      name: "Title",
      dataType: "string",
      validation: { required: true, min: 5, max: 200 },
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
    excerpt: buildProperty({
      name: "Excerpt",
      description: "Short summary shown in the blog listing.",
      dataType: "string",
      multiline: true,
      validation: { required: true, min: 10, max: 400 },
    }),
    category: buildProperty({
      name: "Category",
      dataType: "string",
      enumValues: {
        News: "News",
        "Student Work": "Student Work",
        "Program Update": "Program Update",
        "Impact Story": "Impact Story",
        Announcement: "Announcement",
      },
      validation: { required: true },
    }),
    author: buildProperty({
      name: "Author",
      dataType: "string",
      validation: { required: true },
    }),
    mainImage: buildProperty({
      name: "Cover image",
      dataType: "string",
      storage: {
        storagePath: "public/posts",
        acceptedFiles: ["image/jpeg", "image/png", "image/webp"],
        maxSize: 5 * 1024 * 1024,
        metadata: { cacheControl: "max-age=31536000, immutable" },
        fileName: (context) => `${Date.now()}-${context.file.name}`,
      },
    }),
    publishedAt: buildProperty({
      name: "Published date",
      description: "ISO date (YYYY-MM-DD).",
      dataType: "string",
      validation: {
        required: true,
        matches: /^\d{4}-\d{2}-\d{2}$/,
        matchesMessage: "Format: YYYY-MM-DD",
      },
    }),
    body: buildProperty({
      name: "Body",
      description: "Full post content in Markdown.",
      dataType: "string",
      markdown: true,
      validation: { required: true, min: 50 },
    }),
    seo: buildProperty({
      name: "SEO",
      dataType: "map",
      properties: {
        metaTitle: buildProperty({
          name: "Meta title",
          description: "Override the page <title>. Leave blank to use the post title.",
          dataType: "string",
          validation: { max: 70 },
        }),
        metaDescription: buildProperty({
          name: "Meta description",
          description: "Override the meta description. Leave blank to use the excerpt.",
          dataType: "string",
          validation: { max: 160 },
        }),
      },
    }),
    active: buildProperty({
      name: "Published",
      description: "Uncheck to unpublish without deleting.",
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
