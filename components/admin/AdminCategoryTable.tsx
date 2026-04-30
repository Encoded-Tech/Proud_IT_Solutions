"use client";

import Image from "@/components/ui/optimized-image";
import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Search, Edit } from "lucide-react";
import toast from "react-hot-toast";

import { CategoryType } from "@/types/product";
import { deleteCategory, updateCategory } from "@/lib/server/actions/admin/category/categoryAction";
import EditCategoryForm from "@/app/admin/category/add-category/edit-form";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { AdminTableRevealStyles, getAdminRowReveal } from "@/components/admin/admin-table-reveal";

export default function AdminCategoryTable({ categories }: { categories: CategoryType[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isPending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<CategoryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryType | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const itemsPerPage = 6;

  // 🔍 Filter
  const filtered = useMemo(() => {
    return categories.filter(c =>
      c.categoryName.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  // 🔃 Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      sortDir === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filtered, sortDir]);

  // 📄 Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const allVisibleSelected =
    paginated.length > 0 && paginated.every((item) => selectedIds.includes(item.id));

  const toggleSelection = (categoryId: string) => {
    setSelectedIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(paginated.map((item) => item.id));
  };

  // 🗑 Delete
  const confirmDelete = () => {
    const targets = deleteTarget
      ? [deleteTarget]
      : paginated.filter((item) => selectedIds.includes(item.id));

    if (targets.length === 0) return;
    
    startTransition(async () => {
      const results = await Promise.all(targets.map((item) => deleteCategory(item.id)));
      const failed = results.find((result) => !result.success);

      if (failed) {
        toast.error(failed.message || "Failed to delete");
        return;
      }
      
      toast.success(
        targets.length === 1
          ? results[0].message || "Category deleted successfully"
          : `${targets.length} categories deleted successfully`
      );
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      setDeleteTarget(null);
      
      // Force a complete refresh
      router.refresh();
      
      // Optional: Force a hard navigation after a short delay
      setTimeout(() => {
        router.push("/admin/category");
      }, 100);
    });
  };

  return (
    <>
      <AdminTableRevealStyles />
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-sm text-gray-500">
              Showing {paginated.length} of {sorted.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={toggleSelectAllVisible}
                  className="px-4 py-4 rounded-lg text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                >
                  {allVisibleSelected ? "Clear Selection" : "Select All Visible"}
                </button>
                <button
                  onClick={() => setBulkDeleteOpen(true)}
                  className="px-4 py-4 rounded-lg text-sm border border-red-300 text-red-600 hover:bg-red-50 transition"
                >
                  Delete Selected ({selectedIds.length})
                </button>
              </>
            )}
            <div className="relative">
              <input
                placeholder="Search category by name..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="border px-12 py-4 rounded-lg text-lg w-80 focus:outline-none"
              />
              <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    className="h-4 w-4"
                    aria-label="Select all visible categories"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Category</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Image</th>
                <th
                  className="px-6 py-4 text-right text-xs font-semibold uppercase cursor-pointer"
                  onClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
                >
                  Created {sortDir === "asc" ? "↑" : "↓"}
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No categories found</td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50" style={getAdminRowReveal(index)}>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="h-4 w-4"
                        aria-label={`Select ${item.categoryName}`}
                      />
                    </td>
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
                        <Image src={item.categoryImage} alt={item.categoryName} fill className="object-cover" />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-right text-sm">
                      <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleTimeString()}</div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-8 text-center flex justify-center gap-2">
                      <button
                        onClick={() => setEditTarget(item)}
                        className="p-2 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-2 rounded bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <span className="text-sm">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >Prev</button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <EditCategoryForm
            category={editTarget}
            categories={categories}
            onCancel={() => setEditTarget(null)}
            onSubmit={async (formData) => {
              const res = await updateCategory(editTarget.id, formData);
              if (res.success) router.refresh();
              setEditTarget(null);
              return res;
            }}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget || bulkDeleteOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
          if (!open) setBulkDeleteOpen(false);
        }}
        title={deleteTarget ? "Delete category?" : "Delete selected categories?"}
        description={
          deleteTarget
            ? `This will permanently delete ${deleteTarget.categoryName}. This action cannot be undone.`
            : `This will permanently delete ${selectedIds.length} selected categories. This action cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        pending={isPending}
        tone="danger"
      />
    </>
  );
}
