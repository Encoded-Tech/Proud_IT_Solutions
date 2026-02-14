"use client";

import { useState, ChangeEvent, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IBuildRequestMapped } from "@/lib/server/mappers/MapBuildUserPc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  X,
  Package,
  User,
  Calendar,
  IndianRupee
} from "lucide-react";
import BuildRequestSheet from "./build_request_sheet";
import { cn } from "@/lib/utils";

interface BuildRequestsTableProps {
  builds: IBuildRequestMapped[];
  total: number;
  page: number;
  pages: number;
  filters: {
    status?: string;
    compatibilityStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  };
}

type BuildStatus = "draft" | "submitted" | "reviewed" | "approved" | "rejected" | "checked_out";
type CompatibilityStatus = "pending" | "passed" | "failed";

const STATUS_COLORS: Record<BuildStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  reviewed: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  checked_out: "bg-purple-100 text-purple-700 border-purple-200",
};

const COMPATIBILITY_COLORS: Record<CompatibilityStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  passed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function BuildRequestsTable({ 
  builds, 
  page, 
  pages, 
  filters,
  total
}: BuildRequestsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedBuild, setSelectedBuild] = useState<IBuildRequestMapped | null>(null);
  const [searchText, setSearchText] = useState<string>(filters.search || "");
  const [statusFilter, setStatusFilter] = useState<string>(filters.status || "all");
  const [compatibilityFilter, setCompatibilityFilter] = useState<string>(
    filters.compatibilityStatus || "all"
  );

  // Sync local state with URL params when they change
  useEffect(() => {
    setSearchText(filters.search || "");
    setStatusFilter(filters.status || "all");
    setCompatibilityFilter(filters.compatibilityStatus || "all");
  }, [filters.search, filters.status, filters.compatibilityStatus]);

  // Debounced search - FIXED: proper dependency array
  useEffect(() => {
    if (searchText === filters.search) return; // Don't re-apply if it's the same
    
    const timeoutId = setTimeout(() => {
      applyFilters(searchText, statusFilter, compatibilityFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]); // Only searchText triggers this

  const applyFilters = (
    newSearch: string,
    newStatus: string,
    newCompatibility: string
  ): void => {
    const params = new URLSearchParams();
    
    // Add search param
    if (newSearch && newSearch.trim()) {
      params.set("search", newSearch.trim());
    }

    // Add status param
    if (newStatus && newStatus !== "all") {
      params.set("status", newStatus);
    }

    // Add compatibility param
    if (newCompatibility && newCompatibility !== "all") {
      params.set("compatibilityStatus", newCompatibility);
    }

    // Always reset to page 1 when filters change
    params.set("page", "1");

    // Preserve limit if it exists
    if (filters.limit) {
      params.set("limit", filters.limit.toString());
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(newUrl);
    });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value);
  };

  const handleStatusChange = (value: string): void => {
    setStatusFilter(value);
    applyFilters(searchText, value, compatibilityFilter);
  };

  const handleCompatibilityChange = (value: string): void => {
    setCompatibilityFilter(value);
    applyFilters(searchText, statusFilter, value);
  };

  const clearFilters = (): void => {
    setSearchText("");
    setStatusFilter("all");
    setCompatibilityFilter("all");
    
    startTransition(() => {
      router.push(pathname);
    });
  };

  const handlePageChange = (newPage: number): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleLimitChange = (newLimit: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit);
    params.set("page", "1");
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const hasActiveFilters = Boolean(
    (searchText && searchText.trim()) || 
    (statusFilter && statusFilter !== "all") || 
    (compatibilityFilter && compatibilityFilter !== "all")
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Filters Section */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
              {isPending && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </div>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input - Auto applies after 500ms */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by user name or email..."
                className="h-12 pl-10 border-slate-300 focus:border-red-500 focus:ring-red-500"
                value={searchText}
                onChange={handleSearchChange}
                disabled={isPending}
              />
            </div>

            {/* Status Filter */}
            <Select 
              value={statusFilter} 
              onValueChange={handleStatusChange}
              disabled={isPending}
            >
              <SelectTrigger className="border-slate-300 focus:border-red-500 focus:ring-red-500">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
              </SelectContent>
            </Select>

            {/* Compatibility Filter */}
            <Select 
              value={compatibilityFilter} 
              onValueChange={handleCompatibilityChange}
              disabled={isPending}
            >
              <SelectTrigger className="border-slate-300 focus:border-red-500 focus:ring-red-500">
                <SelectValue placeholder="All Compatibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Compatibility</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        {builds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No build requests found</h3>
            <p className="text-slate-600 text-center max-w-md">
              {hasActiveFilters 
                ? "Try adjusting your filters to see more results" 
                : "There are no build requests in the system yet"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Parts
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Compatibility
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {builds.map((build) => (
                <tr 
                  key={build.id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <Package className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm font-mono font-medium text-slate-900">
                        #{build.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {build.user.name || "Unknown User"}
                        </div>
                        {build.user.email && (
                          <div className="text-xs text-slate-500">
                            {build.user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {build.parts.length} {build.parts.length === 1 ? "part" : "parts"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-slate-900">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {build.grandTotal.toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                      STATUS_COLORS[build.status as BuildStatus]
                    )}>
                      {build.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                      COMPATIBILITY_COLORS[build.compatibilityStatus as CompatibilityStatus]
                    )}>
                      {build.compatibilityStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {new Date(build.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setSelectedBuild(build)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all duration-150 hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <circle cx="8" cy="8" r="2.5" />
                        <path d="M1.5 8C3 4.5 5 2.5 8 2.5s5 2 6.5 5.5C13 11.5 11 13.5 8 13.5S3 11.5 1.5 8z" />
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Section */}
      {builds.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Rows per page:</span>
              <Select 
                value={filters.limit?.toString() || "10"} 
                onValueChange={handleLimitChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-20 h-9 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                Showing <span className="font-medium text-slate-900">{((page - 1) * (filters.limit || 10)) + 1}</span> to{" "}
                <span className="font-medium text-slate-900">
                  {Math.min(page * (filters.limit || 10), total)}
                </span> of{" "}
                <span className="font-medium text-slate-900">{total}</span> results
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isPending}
                  onClick={() => handlePageChange(page - 1)}
                  className="border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    let pageNum: number;
                    if (pages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pages - 2) {
                      pageNum = pages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isPending}
                        className={cn(
                          "w-9 h-9",
                          page === pageNum 
                            ? "bg-red-600 hover:bg-red-700 text-white" 
                            : "border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages || isPending}
                  onClick={() => handlePageChange(page + 1)}
                  className="border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      {selectedBuild && (
        <BuildRequestSheet
          build={selectedBuild}
          onClose={() => setSelectedBuild(null)}
        />
      )}
    </div>
  );
}