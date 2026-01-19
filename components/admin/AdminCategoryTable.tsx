"use client";

import Image from "next/image";
import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CategoryType } from "@/types/product";

import { Trash2, Loader2, Search, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { deleteCategory, updateCategory } from "@/lib/server/actions/admin/category/categoryAction";
import EditCategoryForm from "@/app/admin/category/add-category/edit-form";


export default function AdminCategoryTable({
  categories,
}: {
  categories: CategoryType[];
}) {
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isPending, startTransition] = useTransition();
const [editTarget, setEditTarget] = useState<CategoryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryType | null>(null);

  const itemsPerPage = 6;

  // 🔍 Search
  const filtered = useMemo(() => {
    return categories.filter((c) =>
      c.categoryName.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  // 🔃 Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      sortDir === "asc"
        ? new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
    );
  }, [filtered, sortDir]);

  // 📄 Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // 🗑 Confirm delete
  const confirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const res = await deleteCategory(deleteTarget.id);

      if (!res.success) {
        toast.error("Failed to delete category");
        return;
      }

      toast.success("Category deleted successfully");
      setDeleteTarget(null);
      router.refresh(); // 🔥 SAME PATTERN AS BUILD-MY-PC
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-sm text-gray-500">
              Showing {paginated.length} of {sorted.length}
            </p>
          </div>

       <div className="relative">
           <input
            placeholder="Search category by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
           className="border px-12 py-4 rounded-lg text-lg w-80 focus:outline-none"
          />
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
       </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">
                  Image
                </th>
                <th
                  className="px-6 py-4 text-right text-xs font-semibold uppercase cursor-pointer"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                >
                  Created {sortDir === "asc" ? "↑" : "↓"}
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center font-bold text-red-600">
                          {item.categoryName[0].toUpperCase()}
                        </div>
                        {item.categoryName}
                      </div>
                    </td>

                    {/* Image */}
                    <td className="px-6 py-4 text-center">
                      <div className="relative w-14 h-14 mx-auto rounded-lg overflow-hidden border">
                        <Image
                          src={item.categoryImage}
                          alt={item.categoryName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>

                    {/* Date */}
                   <td className="px-6 py-4 text-right text-sm">
  <div>{new Date(item.createdAt).toLocaleDateString()}</div>
  <div className="text-xs text-gray-500">
    {new Date(item.createdAt).toLocaleTimeString()}
  </div>
</td>

                    {/* Actions */}
                     <td className="px-6 py-8 text-center flex justify-center gap-2">
                
                       
                       <div className="flex items-center">

                        <button
  onClick={() => setEditTarget(item)}
     className="p-2 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
>
    <Edit  className="w-4 h-4" />
</button>


                        {/* DELETE */}
                        <button
                          onClick={() => setDeleteTarget(item)}
                            className="p-2 rounded bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                       </div>
                      
                    </td>


                   
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

{editTarget && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <EditCategoryForm
      category={editTarget}
      categories={categories}
      onCancel={() => setEditTarget(null)}
      onSubmit={async (formData) => {
  const res = await updateCategory(editTarget.id, formData);

  // Normalize the response
  const result = {
    success: res.success,
    message: res.message || (res.success ? "Category Updated successfully" : "Failed to update"),
  };

  if (res.success) router.refresh();
  setEditTarget(null);

  return result;
}}

    />
  </div>
)}

      {/* 🔥 DELETE CONFIRMATION DIALOG */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">
              Delete category?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete{" "}
              <span className="font-medium">
                {deleteTarget.categoryName}
              </span>
              . This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border text-sm"
                disabled={isPending}
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm flex items-center gap-2 disabled:opacity-60"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
