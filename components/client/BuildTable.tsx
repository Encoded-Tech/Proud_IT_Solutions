'use client';

import { useState, useMemo } from "react";
import { X, Clock, Loader2, Search, AlertCircle, CheckCircle2, XCircle, Package } from "lucide-react";
import toast from "react-hot-toast";
import { IBuildRequestMapped } from "@/lib/server/mappers/MapBuildMyPc";
import Pagination from "@/components/shared/Pagination";
import { deleteBuildRequest } from "@/lib/server/actions/public/build-my-pc/buildMyPcactions";
import Link from "next/link";

/* ================= TYPES ================= */
interface BuildRequestsClientProps {
  buildRequests?: IBuildRequestMapped[];
  itemsPerPage?: number;
}

/* ---------------- SEARCH HELPER ---------------- */
function buildRequestMatchesSearch(req: IBuildRequestMapped, query: string) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    req.parts.some(p => p.name.toLowerCase().includes(q)) ||
    req.status.toLowerCase().includes(q) ||
    req.compatibilityStatus.toLowerCase().includes(q)
  );
}

/* ---------------- PARTS GROUP HELPER ---------------- */
function groupPartsByType(parts: IBuildRequestMapped["parts"]) {
  const grouped: Record<string, string[]> = {};
  parts.forEach(p => {
    if (!grouped[p.type]) grouped[p.type] = [];
    grouped[p.type].push(p.name);
  });
  return grouped;
}

/* ---------------- STATUS CONFIG ---------------- */
const STATUS_CONFIG = {
  submitted: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Clock,
    label: "Submitted",
    tooltip: "Build request submitted, awaiting review",
  },
  reviewed: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    icon: AlertCircle,
    label: "Reviewed",
    tooltip: "Build request under review",
  },
  approved: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle2,
    label: "Approved",
    tooltip: "Build request approved",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
    label: "Rejected",
    tooltip: "Build request rejected",
  },
  checked_out: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: Package,
    label: "Checked Out",
    tooltip: "Build checked out and in progress",
  },
};

const COMPATIBILITY_CONFIG = {
  passed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
    label: "Compatible",
    tooltip: "All parts are compatible",
  },
  failed: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle,
    label: "Incompatible",
    tooltip: "Parts have compatibility issues",
  },
};

/* ================= COMPONENT ================= */
export default function BuildRequestsClient({
  buildRequests: initialRequests = [],
  itemsPerPage = 2,
}: BuildRequestsClientProps) {
  const [buildRequests, setBuildRequests] = useState<IBuildRequestMapped[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [hoveredCompatibility, setHoveredCompatibility] = useState<string | null>(null);

  /* ---------------- FILTER & SEARCH ---------------- */
  const filteredRequests = useMemo(() => {
    return buildRequests.filter(req => {
      const matchesSearch = buildRequestMatchesSearch(req, searchQuery);
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [buildRequests, searchQuery, statusFilter]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  /* ---------------- ACTIONS ---------------- */
  const handleDelete = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    try {
      const res = await deleteBuildRequest(id);
      if (res.success) {
        setBuildRequests(prev => prev.filter(req => req.id !== id));
        toast.success("Build request deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete build request");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting build request");
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
      setConfirmDelete({ open: false, id: "" });
    }
  };

  /* ---------------- HELPERS ---------------- */
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  /* ---------------- RENDER ---------------- */
  if (!buildRequests.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No build requests yet</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Your PC build requests will appear here once submitted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by part name, status, or compatibility..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="checked_out">Checked Out</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full ">
            {/* HEADER */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Build ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Parts Configuration
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Compatibility
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Created
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-100">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map(req => {
                  const groupedParts = groupPartsByType(req.parts);
                  const isLoading = loadingStates[req.id];
                  const statusConfig = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.submitted;
                  const compatConfig = COMPATIBILITY_CONFIG[req.compatibilityStatus as keyof typeof COMPATIBILITY_CONFIG] || COMPATIBILITY_CONFIG.failed;
                  const StatusIcon = statusConfig.icon;
                  const CompatIcon = compatConfig.icon;

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-blue-50/30 transition-all duration-200 group"
                    >
                      {/* BUILD ID */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-3 cursor-pointer py-1.5 bg-gray-100 text-gray-800 rounded-lg font-mono text-xs font-semibold">
                          <Link href={`/account/build-requests/${req.id}` } >
                            #{req.id.slice(-8).toUpperCase()}</Link>
                          </span>
                        </div>
                      </td>

                      {/* PARTS */}
                      <td className="px-6 py-5 align-top">
                        <div className="space-y-2 max-w-md">
                          {Object.entries(groupedParts).map(([type, names]) => (
                            <div key={type} className="flex items-start gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold min-w-[90px] justify-center">
                                {type}
                              </span>
                              <span className="text-sm text-gray-700 leading-relaxed">
                                {names.join(", ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5 text-center  align-top">
                        <div className="relative  inline-block">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} shadow-sm cursor-help transition-all`}
                            onMouseEnter={() => setHoveredStatus(req.id)}
                            onMouseLeave={() => setHoveredStatus(null)}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                          {hoveredStatus === req.id && (
                            <div className="absolute  z-10 top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                              {statusConfig.tooltip}
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* COMPATIBILITY */}
                      <td className="px-6 py-5 text-center align-top">
                        <div className="relative inline-block">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${compatConfig.bg} ${compatConfig.text} ${compatConfig.border} shadow-sm cursor-help transition-all`}
                            onMouseEnter={() => setHoveredCompatibility(req.id)}
                            onMouseLeave={() => setHoveredCompatibility(null)}
                          >
                            <CompatIcon className="w-3.5 h-3.5" />
                            {compatConfig.label}
                          </span>
                          {hoveredCompatibility === req.id && (
                            <div className="absolute z-10 top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                              {compatConfig.tooltip}
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* CREATED DATE */}
                      <td className="px-6 py-5 align-top">
                        <span className="text-sm text-gray-600 font-medium">
                          {formatDate(req.createdAt)}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5 text-center align-top">
                        <button
                          disabled={isLoading}
                          onClick={() => setConfirmDelete({ open: true, id: req.id })}
                          className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 hover:shadow-md rounded-lg border border-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" />
                              Delete
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Delete Build Request</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete this build request? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmDelete({ open: false, id: "" })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={loadingStates[confirmDelete.id]}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingStates[confirmDelete.id] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={page => setCurrentPage(page)}
        />
      )}
    </div>
  );
}