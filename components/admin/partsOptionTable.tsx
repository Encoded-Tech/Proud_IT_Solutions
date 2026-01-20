"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Search, Trash2 } from "lucide-react";

import {
  PartOptionInput,
  deletePartOption,
} from "@/lib/server/actions/admin/BuildMyPc/partsAction";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PartForm, { PartType } from "./parts-option-form";


interface Props {
  initialParts: (PartOptionInput & { _id?: string; imageUrl?: string })[];
  partTypes: readonly PartType[];
}

export default function PartsTable({ initialParts, partTypes }: Props) {
  const [parts, setParts] = useState(initialParts);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [editingPart, setEditingPart] =
    useState<(typeof initialParts)[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // ================= FILTER =================
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return parts.filter((p) => {
      const matchesSearch =
        !q || [p.name, p.brand, p.type].some((v) => v?.toLowerCase().includes(q));
      const matchesType = selectedType === "all" || p.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [parts, search, selectedType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ================= EDIT =================
  const handleEdit = (part: (typeof initialParts)[0]) => {
    setEditingPart(part);
    setShowModal(true);
  };

  const handleUpdate = (updated: (typeof initialParts)[0]) => {
    setParts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setEditingPart(null);
    setShowModal(false);
  };

  // ================= DELETE =================
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    try {
      setLoadingDelete(true);
      const res = await deletePartOption(confirmDeleteId);
      if (!res.success) {
        toast.error(res.message || "Failed to delete part");
        return;
      }
      setParts((prev) => prev.filter((p) => p._id !== confirmDeleteId));
      toast.success("Part deleted");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error";
      toast.error(errorMessage);
    } finally {
      setLoadingDelete(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">PC Parts</h2>
          <p className="text-sm text-gray-500">
            Showing {paginated.length} of {filtered.length} parts
          </p>
        </div>

      <div className="flex flex-wrap items-center gap-3">
  {/* Search */}
  <div className="relative">
            <input
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search build parts by name..."
              className="border px-10 py-2.5 rounded-lg text-lg w-80"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

  {/* Type Filter */}
  <Select
    value={selectedType}
    onValueChange={(value) => {
      setSelectedType(value);
      setPage(1);
    }}
  >
    <SelectTrigger className="w-[200px] h-10 rounded-lg border text-sm">
      <SelectValue placeholder="Filter by type" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">All Types</SelectItem>

      {partTypes.map((type) => (
        <SelectItem
          key={type}
          value={type}
          className="capitalize"
        >
          {type.replace(/([A-Z])/g, " $1").trim()}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

      </div>

      {/* Edit Modal */}
      {showModal && editingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-xl font-bold text-gray-500"
            >
              &times;
            </button>
            <PartForm part={editingPart} onSuccess={handleUpdate} partTypes={partTypes} />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Delete Part</h3>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loadingDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
              >
                {loadingDelete ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Part</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Type</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Brand</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Active</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  No parts found
                </td>
              </tr>
            ) : (
              paginated.map((part) => (
                <tr key={part._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex gap-3 items-center">
                    <div className="w-14 h-14 border rounded overflow-hidden relative">
                      {part.imageUrl ? (
                        <Image
                          src={part.imageUrl}
                          alt={part.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{part.name}</span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {part.type ? (
                      <span className="px-3 py-1 rounded bg-green-50 text-green-700 text-sm capitalize">
                        {part.type}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded bg-red-50 text-red-700 text-sm">
                        Not Provided
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {part.brand ? (
                      <span className="px-3 py-1 rounded bg-blue-50 text-blue-800 text-sm">
                        {part.brand}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded bg-red-50 text-red-700 text-sm">
                        Not Provided
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {part.isActive ? (
                      <span className="px-3 py-1 rounded bg-green-50 text-green-700 text-sm">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded bg-gray-100 text-gray-500 text-sm">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center flex justify-center gap-2">
                    <button
                      className="p-2 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      onClick={() => handleEdit(part)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded bg-red-50 text-red-700 hover:bg-red-100"
                      onClick={() => setConfirmDeleteId(part._id!)}
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
          <span className="text-sm text-gray-600">
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
  );
}
