// app/admin/blogs/add-blogs/page.tsx

import { BlogForm } from "../blog-form";


export default function AddBlogPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Blog</h1>
        <p className="text-gray-500 mt-1">
          Fill in the form below to create a new blog post.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <BlogForm />
      </div>
    </div>
  );
}
