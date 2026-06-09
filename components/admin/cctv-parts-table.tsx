"use client";

import CctvPartForm from "@/components/admin/cctv-part-form";
import Image from "@/components/ui/optimized-image";
import { CCTV_PART_LABELS } from "@/constants/cctv";
import { deleteCctvPart } from "@/lib/server/actions/admin/cctv/cctvAdminActions";
import { CctvPartMapped } from "@/lib/server/mappers/MapCctv";
import { Camera, Edit, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function CctvPartsTable({ initialParts }: { initialParts: CctvPartMapped[] }) {
  const [parts, setParts] = useState(initialParts);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CctvPartMapped | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return parts.filter(
      (part) =>
        !q ||
        [part.name, part.brand, part.modelName, part.typeLabel].some((value) =>
          value?.toLowerCase().includes(q)
        )
    );
  }, [parts, search]);

  const handleDelete = async (part: CctvPartMapped) => {
    const res = await deleteCctvPart(part.id);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setParts((current) => current.filter((item) => item.id !== part.id));
    toast.success(res.message);
  };

  return (
    <div className="space-y-6">
      <CctvPartForm
        onSuccess={(part) => {
          setParts((current) => {
            const exists = current.some((item) => item.id === part.id);
            return exists
              ? current.map((item) => (item.id === part.id ? part : item))
              : [part, ...current];
          });
        }}
      />

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">CCTV Items</h2>
            <p className="text-sm text-slate-500">Showing {filtered.length} items</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search CCTV items..."
              className="h-11 w-full rounded-lg border pl-10 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((part) => (
                <tr key={part.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-lg border bg-slate-100">
                        {part.imageUrl ? (
                          <Image src={part.imageUrl} alt={part.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <Camera className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{part.name}</p>
                        <p className="text-xs text-slate-500">
                          {[part.brand, part.modelName].filter(Boolean).join(" / ") || "No brand"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{CCTV_PART_LABELS[part.type]}</td>
                  <td className="px-5 py-4 text-right font-semibold">
                    Rs. {part.price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        part.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {part.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setEditing(part)}
                      className="mr-2 rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(part)}
                      className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No CCTV items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-slate-500 shadow"
            >
              <X className="h-4 w-4" />
            </button>
            <CctvPartForm
              part={editing}
              onSuccess={(updated) => {
                setParts((current) =>
                  current.map((part) => (part.id === updated.id ? updated : part))
                );
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
