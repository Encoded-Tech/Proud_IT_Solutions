"use client";

import ConfirmDialog from "@/components/ui/confirm-dialog";
import { deleteCctvInstallationRequest } from "@/lib/server/actions/public/cctv/cctvActions";
import { CctvInstallationRequestMapped } from "@/lib/server/mappers/MapCctv";
import { Camera, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  requests: CctvInstallationRequestMapped[];
}

function money(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function labelStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function CctvRequestsTable({ requests: initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return requests;

    return requests.filter(
      (request) =>
        request.id.toLowerCase().includes(q) ||
        request.status.toLowerCase().includes(q) ||
        request.paymentStatus.toLowerCase().includes(q) ||
        request.items.some((item) => item.name.toLowerCase().includes(q))
    );
  }, [requests, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await deleteCctvInstallationRequest(deleteId);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setRequests((current) => current.filter((request) => request.id !== deleteId));
      toast.success(res.message);
      setDeleteId("");
    } finally {
      setLoading(false);
    }
  };

  if (!requests.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-white px-4 py-16 text-center">
        <Camera className="mb-4 h-12 w-12 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-900">No CCTV requests yet</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your CCTV installation requests will appear here after submission.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search CCTV requests..."
          className="h-11 w-full rounded-lg border pl-10 pr-3 text-sm"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((request) => (
          <article key={request.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-mono text-xs font-semibold text-slate-500">
                  #{request.id.slice(-8).toUpperCase()}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  CCTV installation package
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(request.createdAt).toLocaleDateString()} ·{" "}
                  {request.customerDetails.siteAddress}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                  {labelStatus(request.status)}
                </span>
                <span className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                  Payment {request.paymentStatus}
                </span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {request.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.typeLabel}</p>
                      </td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{money(item.unitPrice)}</td>
                      <td className="py-3 text-right font-semibold">
                        {money(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-[1fr_auto]">
              <div className="text-sm text-slate-600">
                {request.customerDetails.notes && (
                  <p>
                    <span className="font-semibold text-slate-800">Notes:</span>{" "}
                    {request.customerDetails.notes}
                  </p>
                )}
                {request.adminRemarks && (
                  <p className="mt-1">
                    <span className="font-semibold text-slate-800">Admin remarks:</span>{" "}
                    {request.adminRemarks}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Grand total</p>
                <p className="text-lg font-semibold text-slate-950">
                  {money(request.grandTotal)}
                </p>
              </div>
            </div>

            {request.status === "pending" && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteId(request.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
          No CCTV requests match your search.
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId("");
        }}
        title="Delete CCTV request?"
        description="This will remove the pending CCTV installation request from your dashboard."
        confirmLabel={loading ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        pending={loading}
        tone="danger"
      />
    </div>
  );
}
