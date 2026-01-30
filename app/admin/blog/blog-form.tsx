"use client";

import { createBlogAction } from "@/lib/server/actions/admin/blog/blogActions";
import { useState, useTransition } from "react";

import toast from "react-hot-toast";
import { BlogRichTextEditor } from "./mdx-editor";

export function BlogForm() {
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const excerpt = (formData.get("excerpt") as string) || "";
    const tags = ((formData.get("tags") as string) || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const coverImage = (formData.get("coverImage") as string) || "";
    const status = (formData.get("status") as string) as "draft" | "published";

    startTransition(async () => {
      try {
        const response = await createBlogAction({
          title,
          mdxContent: content, // HTML from TipTap; later convert to MDX if needed
          excerpt,
          tags,
          status,
          coverImage,
        });

        if (response.success) {
          toast.success("Blog created successfully!");
          setTitle("");
          setContent("");
          e.currentTarget.reset();
        } else {
          toast.error(response.message);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unexpected error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Blog title"
        className="input w-full"
        required
      />

      <BlogRichTextEditor value={content} onChange={setContent} />

      <textarea
        name="excerpt"
        placeholder="Excerpt (optional)"
        className="w-full"
      />

      <input
        name="tags"
        placeholder="Tags (comma separated)"
        className="w-full"
      />

      <input
        name="coverImage"
        placeholder="Cover image URL"
        className="w-full"
      />

      <select name="status" defaultValue="draft" className="w-full">
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <button
        type="submit"
        disabled={pending}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        {pending ? "Creating..." : "Create Blog"}
      </button>
    </form>
  );
}
