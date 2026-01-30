// server/services/blogService.ts
import { calculateReadingTime } from "@/lib/helpers/calculateReadTime";
import { generateSlug } from "@/lib/helpers/slugify";
import { Blog } from "@/models/blogModel";
import { BlogDocument, BlogStatus } from "@/types/blog";


export interface CreateBlogInput {
  title: string;
  mdxContent: string;
  authorId: string;

  slug?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  status?: BlogStatus;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
  };
}

/**
 * Create a new blog (DB-layer only)
 * - Validates inputs
 * - Generates slug, excerpt, reading time
 * - Ensures slug uniqueness
 */
export async function createBlog(input: CreateBlogInput): Promise<BlogDocument> {
  /* ------------------ Hard validations ------------------ */
  if (!input.title?.trim()) {
    throw new Error("Blog title is required");
  }

  if (!input.mdxContent?.trim()) {
    throw new Error("Blog content cannot be empty");
  }

  if (!input.authorId) {
    throw new Error("Author ID is required");
  }

  /* ------------------ Normalize inputs ------------------ */
  const title = input.title.trim();
  const mdxContent = input.mdxContent.trim();
  const status: BlogStatus = input.status ?? "draft";

  if (!["draft", "published", "archived"].includes(status)) {
    throw new Error("Invalid blog status");
  }

  /* ------------------ Slug generation ------------------ */
  const slug = (input.slug?.trim() || generateSlug(title)).toLowerCase();

  const existingSlug = await Blog.findOne({ slug });
  if (existingSlug) {
    throw new Error("Slug already exists. Please use a different title or slug.");
  }

  /* ------------------ Reading time ------------------ */
  const readingTime = calculateReadingTime(mdxContent);

  /* ------------------ Excerpt ------------------ */
 const safeContent = typeof mdxContent === "string" ? mdxContent : "";
const excerpt =
  input.excerpt?.trim() ||
  (safeContent
    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
    .replace(/\n+/g, " ")           // Replace line breaks
    .slice(0, 200)                  // Limit to 200 chars
    .trim() + "...");


  /* ------------------ Publish guard ------------------ */
  if (status === "published" && !mdxContent) {
    throw new Error("Cannot publish a blog without content");
  }

  /* ------------------ Final DB payload ------------------ */
  const blogPayload = {
    title,
    slug,
    excerpt,
    mdxContent,

    coverImage: input.coverImage,
    tags: input.tags ?? [],

    authorId: input.authorId,
    status,

    seo: {
      metaTitle: input.seo?.metaTitle,
      metaDescription: input.seo?.metaDescription,
      ogImage: input.seo?.ogImage,
      keywords: input.seo?.keywords ?? [],
    },

    readingTime,
    views: 0,

    publishedAt: status === "published" ? new Date() : undefined,
  };

  /* ------------------ DB write ------------------ */
  try {
    const createdBlog = await Blog.create(blogPayload);
    return createdBlog;
  } catch (err) {
    const errroMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to create blog: ${errroMessage}`);
  }
}
