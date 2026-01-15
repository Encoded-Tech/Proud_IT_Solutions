"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  PartOptionInput,
  deletePartOption,
} from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import PartForm from "./parts-option-form";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  initialParts: (PartOptionInput & { _id?: string; imageUrl?: string })[];
}

const PAGE_SIZES = [5, 10, 20, 50];

export default function PartsTable({ initialParts }: Props) {
  /* ================= STATE ================= */
  const [parts, setParts] = useState(initialParts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editingPart, setEditingPart] =
    useState<(typeof initialParts)[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return parts;

    return parts.filter((p) =>
      [p.name, p.brand, p.type]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [parts, search]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ================= EDIT ================= */
  const handleEdit = (part: (typeof initialParts)[0]) => {
    setEditingPart(part);
    setShowModal(true);
  };

  const handleUpdate = (updated: (typeof initialParts)[0]) => {
    setParts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
    setEditingPart(null);
    setShowModal(false);
  };

  /* ================= DELETE ================= */
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
      {/* ================= HEADER ================= */}
      <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">PC Parts</h2>
          <p className="text-sm text-gray-500">
            Showing {paginated.length} of {filtered.length} parts
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <input
            placeholder="Search parts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-4 py-2 w-full md:w-64"
          />

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {showModal && editingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-xl font-bold text-gray-500"
            >
              &times;
            </button>
            <PartForm part={editingPart} onSuccess={handleUpdate} />
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Delete Part</h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone.
            </p>

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

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Part</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Brand</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Price</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Active</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  No parts found
                </td>
              </tr>
            ) : (
              paginated.map((part) => (
                <tr key={part._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg border overflow-hidden">
                        {part.imageUrl ? (
                          <Image
                            src={part.imageUrl}
                            alt={part.name}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{part.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 capitalize">{part.type}</td>
                  <td className="px-6 py-4">{part.brand || "-"}</td>
                  <td className="px-6 py-4 text-right">{part.price}</td>
                  <td className="px-6 py-4  text-center">
                    {part.isActive ? "Yes" : "No"}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(part)}
                         className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(part._id!)}
                       className="p-2 rounded-lg text-red-600 hover:bg-red-50"
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

      {/* ================= PAGINATION ================= */}
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
