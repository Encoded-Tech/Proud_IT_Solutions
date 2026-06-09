"use client";

import {
  adminDeleteCctvInstallationRequests,
  adminUpdateCctvInstallationRequest,
} from "@/lib/server/actions/admin/cctv/cctvAdminActions";
import { CctvInstallationRequestMapped } from "@/lib/server/mappers/MapCctv";
import { Camera, Save, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "site_inspection_required",
  "installation_scheduled",
  "completed",
  "cancelled",
] as const;

const PAYMENT_OPTIONS = ["pending", "submitted", "paid", "failed"] as const;

function money(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function label(value: string) {
  return value.replace(/_/g, " ");
}

export default function CctvRequestsAdminTable({
  initialRequests,
}: {
  initialRequests: CctvInstallationRequestMapped[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return requests;
    return requests.filter(
      (request) =>
        request.id.toLowerCase().includes(q) ||
        request.customerDetails.name.toLowerCase().includes(q) ||
        request.customerDetails.email.toLowerCase().includes(q) ||
        request.customerDetails.phone.toLowerCase().includes(q) ||
        request.items.some((item) => item.name.toLowerCase().includes(q))
    );
  }, [requests, search]);

  const updateLocal = (
    id: string,
    patch: Partial<CctvInstallationRequestMapped>
  ) => {
    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, ...patch } : request))
    );
  };

  const saveRequest = async (request: CctvInstallationRequestMapped) => {
    setSaving((current) => ({ ...current, [request.id]: true }));
    try {
      const res = await adminUpdateCctvInstallationRequest({
        id: request.id,
        status: request.status,
        paymentStatus: request.paymentStatus,
        adminRemarks: request.adminRemarks,
      });

      if (!res.success || !res.data) {
        toast.error(res.message);
        return;
      }

      updateLocal(request.id, res.data);
      toast.success(res.message);
    } finally {
      setSaving((current) => ({ ...current, [request.id]: false }));
    }
  };

  const deleteRequest = async (id: string) => {
    const res = await adminDeleteCctvInstallationRequests([id]);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setRequests((current) => current.filter((request) => request.id !== id));
    toast.success(res.message);
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Installation Requests</h2>
          <p className="text-sm text-slate-500">Showing {filtered.length} requests</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer, phone, item..."
            className="h-11 w-full rounded-lg border pl-10 pr-3 text-sm"
          />
        </div>
      </div>

      <div className="divide-y">
        {filtered.map((request) => (
          <article key={request.id} className="p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-mono text-xs font-semibold text-slate-500">
                      #{request.id.slice(-8).toUpperCase()}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      {request.customerDetails.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {request.customerDetails.phone} · {request.customerDetails.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {request.customerDetails.siteAddress}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-slate-500">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {money(request.grandTotal)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Unit</th>
                        <th className="px-4 py-2 text-right">Line</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {request.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.typeLabel}</p>
                          </td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{money(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {money(item.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {request.customerDetails.notes && (
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Customer notes:</span>{" "}
                    {request.customerDetails.notes}
                  </p>
                )}
              </div>

              <div className="space-y-3 rounded-xl border bg-slate-50 p-4">
                <label className="block text-sm font-medium text-slate-700">
                  Order status
                  <select
                    value={request.status}
                    onChange={(event) =>
                      updateLocal(request.id, {
                        status: event.target.value as CctvInstallationRequestMapped["status"],
                      })
                    }
                    className="mt-1 h-10 w-full rounded-lg border bg-white px-3 text-sm capitalize"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {label(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Payment status
                  <select
                    value={request.paymentStatus}
                    onChange={(event) =>
                      updateLocal(request.id, {
                        paymentStatus:
                          event.target.value as CctvInstallationRequestMapped["paymentStatus"],
                      })
                    }
                    className="mt-1 h-10 w-full rounded-lg border bg-white px-3 text-sm capitalize"
                  >
                    {PAYMENT_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Admin remarks
                  <textarea
                    value={request.adminRemarks || ""}
                    onChange={(event) =>
                      updateLocal(request.id, { adminRemarks: event.target.value })
                    }
                    className="mt-1 min-h-24 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={() => saveRequest(request)}
                    disabled={saving[request.id]}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving[request.id] ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => deleteRequest(request.id)}
                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Camera className="mb-3 h-10 w-10 text-slate-300" />
            No CCTV installation requests found.
          </div>
        )}
      </div>
    </div>
  );
}
