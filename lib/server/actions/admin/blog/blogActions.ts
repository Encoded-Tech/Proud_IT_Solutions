
"use server";
import { requireAdmin } from "@/lib/auth/requireSession";
import { createBlog } from "@/lib/server/services/blogService";
import {CreateBlogActionInput} from "@/types/blog";
import { revalidatePath } from "next/cache";


export async function createBlogAction(input: CreateBlogActionInput) {
  try {
    /* ------------------ Auth ------------------ */
    const admin = await requireAdmin();

    if (typeof input.mdxContent !== "string" || !input.mdxContent.trim()) {
  throw new Error("Blog content must be a string and not empty");
}


    /* ------------------ Call service ------------------ */
    const blog = await createBlog({
      ...input,
      authorId: admin.id, 
    });

    revalidatePath("/blogs");
    revalidatePath("/admin/blogs")

    /* ------------------ Success response ------------------ */
    return {
      success: true,
      message: "Blog created successfully",
      data: blog,
    };
  } catch (err) {
    /* ------------------ Error handling ------------------ */
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to create blog. Please try again.",
    };
  }
}
