/* ------------------ Blog Status ------------------ */

export type BlogStatus = "draft" | "published" | "archived";

/* ------------------ SEO ------------------ */

export interface BlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords: string[];
}

export interface BlogDocument {
  _id: string | { toString(): string };
  title: string;
  slug: string;
  excerpt: string;
  mdxContent: string;
  coverImage?: string;
  tags: string[];
  status: BlogStatus;
  readingTime: number;
 authorId: string | { toString(): string };
  views: number;
  seo?: BlogSEO;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


/* ------------------ Blog DTO (Main) ------------------ */

export interface BlogDTO {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  status: BlogStatus;
  readingTime: number;
  views?: number;
  seo?: BlogSEO;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/* ------------------ Blog List Item (Optimized) ------------------ */

export interface BlogListItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  publishedAt?: string;
}

/* ------------------ Admin Editor Input ------------------ */

export interface BlogEditorInput {
  _id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  mdxContent: string;
  coverImage?: string;
  tags: string[];
  status: BlogStatus;
  seo?: BlogSEO;
}

export interface CreateBlogActionInput {
  title: string;
  mdxContent: string;

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
