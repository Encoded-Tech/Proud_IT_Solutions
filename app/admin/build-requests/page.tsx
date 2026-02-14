import { Suspense } from "react";
import { AdminBuildFilters, adminGetAllBuildRequests } from "@/lib/server/actions/admin/BuildMyPc/buildMyPcAction";
import BuildRequestsTable from "./build_request_table";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminBuildsPageProps {
  searchParams: Promise<{
    status?: string;
    compatibilityStatus?: string;
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function AdminBuildRequestsPage({ 
  searchParams 
}: AdminBuildsPageProps) {
  // Await searchParams for Next.js 15+
  const params = await searchParams;
  
  const filters: AdminBuildFilters = {
    status: params?.status as AdminBuildFilters["status"],
    compatibilityStatus: params?.compatibilityStatus as AdminBuildFilters["compatibilityStatus"],
    search: params?.search,
    page: params?.page ? parseInt(params.page, 10) : 1,
    limit: params?.limit ? parseInt(params.limit, 10) : 10,
  };

  const { data, total, page, pages } = await adminGetAllBuildRequests(filters);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Build Requests Management
          </h1>
          <p className="text-slate-600">
            Manage and review customer PC build requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Current Page</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{page} / {pages}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Showing</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{data.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Filters</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {[filters.status, filters.compatibilityStatus, filters.search].filter(Boolean).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Component */}
        <Suspense fallback={<TableSkeleton />}>
          <BuildRequestsTable
            builds={data}
            total={total}
            page={page}
            pages={pages}
            filters={filters}
          />
        </Suspense>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}