// app/admin/users/page.tsx
import {
  AdminUsersResponse,
  getAllUsersAdmin,
  GetUsersFilters,
  GetUsersOptions,
} from "@/lib/server/actions/admin/customers/customerActions";
import React from "react";
import UsersTable from "./user-table";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const filters: GetUsersFilters = {};
  const options: GetUsersOptions = { page: 1, limit: 6, sortBy: "newest" };

  const usersResponse: AdminUsersResponse = await getAllUsersAdmin(
    filters,
    options
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto container px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* ── page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              {/* red accent dot */}
              <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-300" />
              <span className="text-xs font-semibold uppercase tracking-widest text-red-500">
                Admin Panel
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              User Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View, filter, and manage all registered users.
            </p>
          </div>

          {/* right-side decorative tag */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 1.944A11.954 11.954 0 0 1 2.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.224 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0 1 10 1.944z"
                clipRule="evenodd"
              />
            </svg>
            Secure Admin Area
          </div>
        </div>

        {/* ── divider ── */}
        <div className="h-px bg-gradient-to-r from-red-200 via-red-100 to-transparent" />

        {/* ── content ── */}
        {usersResponse.success ? (
          <UsersTable initialData={usersResponse} />
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium">{usersResponse.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}