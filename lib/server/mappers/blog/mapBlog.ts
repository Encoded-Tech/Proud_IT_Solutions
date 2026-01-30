import { BlogDocument, BlogEditorInput } from "@/types/blog";


import { BlogDTO, BlogListItem } from "@/types/blog";

export function mapBlogToDTO(blog: BlogDocument): BlogDTO {
  return {
    _id: blog._id.toString(),

    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,

    coverImage: blog.coverImage,
    tags: blog.tags ?? [],

    status: blog.status,
    readingTime: blog.readingTime ?? 0,
    views: blog.views ?? 0,

    seo: blog.seo,

    publishedAt: blog.publishedAt?.toISOString(),
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  };
}

export function mapBlogToListItem(blog: BlogDocument): BlogListItem {
  return {
    _id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    coverImage: blog.coverImage,
    tags: blog.tags ?? [],
    publishedAt: blog.publishedAt?.toISOString(),
  };
}


export function mapBlogToEditorInput(blog: BlogDocument): BlogEditorInput {
  return {
    _id: blog._id.toString(),

    title: blog.title ?? "",
    slug: blog.slug ?? "",
    excerpt: blog.excerpt ?? "",

    coverImage: blog.coverImage ?? undefined,
    tags: blog.tags ?? [],
    mdxContent: blog.mdxContent ?? "",

    status: blog.status ?? "draft",

    seo: {
      metaTitle: blog.seo?.metaTitle ?? "",
      metaDescription: blog.seo?.metaDescription ?? "",
      ogImage: blog.seo?.ogImage ?? "",
      keywords: blog.seo?.keywords ?? [],
    },
  };
}
