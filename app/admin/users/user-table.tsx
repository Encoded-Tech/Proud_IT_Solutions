"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/shared/Pagination";
import {
  AdminUsersResponse,
  getAllUsersAdmin,
  GetUsersFilters,
  GetUsersOptions,
  resetUserHardLock,
} from "@/lib/server/actions/admin/customers/customerActions";
import toast from "react-hot-toast";

interface UsersTableProps {
  initialData: AdminUsersResponse;
}

type UserDTO = AdminUsersResponse["data"][number];

// ─── helpers ─────────────────────────────────────────────────────────────────
const avatar = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const avatarColor = (name: string) => {
  const palette = [
    "from-rose-500 to-red-600",
    "from-red-400 to-rose-600",
    "from-orange-400 to-red-500",
    "from-pink-500 to-rose-600",
    "from-red-500 to-orange-600",
    "from-rose-400 to-pink-600",
    "from-red-600 to-rose-700",
  ];
  const idx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  return palette[idx];
};

const fmtDate = (d: string | Date | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const fmtDateTime = (d: string | Date | null | undefined) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// ─── role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-red-100 text-red-700 border border-red-200">
      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.3L6 8.4l-3.1 1.6.6-3.3L1 4.3l3.6-.5L6 1z" />
      </svg>
      Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="6" cy="4" r="2.5" />
        <path d="M1.5 10.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      </svg>
      User
    </span>
  );
}

// ─── lock badge ───────────────────────────────────────────────────────────────
function LockBadge({ locked }: { locked: boolean }) {
  return locked ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-red-50 text-red-600 border border-red-200">
      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor">
        <rect x="2" y="5" width="8" height="6" rx="1" />
        <path
          d="M4 5V3.5a2 2 0 1 1 4 0V5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      Locked
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
      <svg
        className="w-2.5 h-2.5"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="6" cy="6" r="4.5" />
        <path d="M4 6l1.5 1.5L8 4.5" />
      </svg>
      Active
    </span>
  );
}

// ─── skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-3.5 rounded-full bg-slate-100 animate-pulse"
            style={{ width: `${50 + ((i * 17) % 40)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  accent,
  border,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  border: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${border} bg-white p-4 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}
      >
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-black text-slate-800 tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

// ─── detail row ───────────────────────────────────────────────────────────────
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="min-w-[110px] text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-sm text-slate-700 leading-relaxed">{value}</span>
    </div>
  );
}

// ─── section heading ──────────────────────────────────────────────────────────
function SectionHeading({
  children,
  color = "text-slate-400",
  badge,
}: {
  children: React.ReactNode;
  color?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <p className={`text-[11px] font-semibold uppercase tracking-widest ${color}`}>
        {children}
      </p>
      {badge}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function UsersTable({ initialData }: UsersTableProps) {
  const [data, setData] = useState<UserDTO[]>(initialData.data);
  const [pagination, setPagination] = useState(initialData.pagination);
  const [filters, setFilters] = useState<GetUsersFilters>({});
  const [options, setOptions] = useState<GetUsersOptions>({
    page: 1,
    limit: 6,
    sortBy: "newest",
  });
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [search, setSearch] = useState("");

  // debounced search
  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((f) => ({ ...f, search: search || undefined }));
      setOptions((o) => ({ ...o, page: 1 }));
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const response = await getAllUsersAdmin(filters, options);
    if (response.success) {
      setData(response.data);
      setPagination(response.pagination);
    }
    setLoading(false);
  }, [filters, options]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const lockedCount = data.filter((u) => u.hardLock).length;
  const adminCount = data.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-5">
      {/* ── stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Users"
          value={pagination.total}
          border="border-slate-200"
          accent="bg-red-50 text-red-500"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM17 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 0 0-1.5-4.33A5 5 0 0 1 19 16v1h-6.07zM6 11a5 5 0 0 1 5 5v1H1v-1a5 5 0 0 1 5-5z" />
            </svg>
          }
        />
        <StatCard
          label="Showing"
          value={`${data.length} / ${pagination.limit}`}
          border="border-slate-200"
          accent="bg-slate-100 text-slate-500"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
        <StatCard
          label="Admins"
          value={adminCount}
          border="border-orange-100"
          accent="bg-orange-50 text-orange-500"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 1.944A11.954 11.954 0 0 1 2.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.224 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0 1 10 1.944z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
        <StatCard
          label="Hard Locked"
          value={lockedCount}
          border="border-red-100"
          accent="bg-red-100 text-red-600"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0 1 10 0v2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm8-2v2H7V7a3 3 0 0 1 6 0z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
      </div>

      {/* ── filter bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 10.89 3.476l4.817 4.817a1 1 0 0 1-1.414 1.414l-4.816-4.816A6 6 0 0 1 2 8z"
              clipRule="evenodd"
            />
          </svg>
          <Input
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 border-slate-200 bg-slate-50 focus-visible:ring-red-400 focus-visible:border-red-300 rounded-xl text-sm"
          />
        </div>

        <Select
          onValueChange={(v) => {
            setFilters((f) => ({
              ...f,
              role: v === "all" ? undefined : (v as "user" | "admin"),
            }));
            setOptions((o) => ({ ...o, page: 1 }));
          }}
        >
          <SelectTrigger className="h-9 w-36 rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-red-400">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) => {
            setFilters((f) => ({
              ...f,
              hardLock: v === "all" ? undefined : v === "true",
            }));
            setOptions((o) => ({ ...o, page: 1 }));
          }}
        >
          <SelectTrigger className="h-9 w-36 rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-red-400">
            <SelectValue placeholder="Lock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Locked</SelectItem>
            <SelectItem value="false">Active</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue="newest"
          onValueChange={(v) =>
            setOptions((o) => ({
              ...o,
              sortBy: v as "newest" | "oldest" | "lastLogin",
              page: 1,
            }))
          }
        >
          <SelectTrigger className="h-9 w-40 rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-red-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="lastLogin">Last Login</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-slate-400 whitespace-nowrap tabular-nums">
          {pagination.total} total · page {pagination.page}/{pagination.totalPages}
        </span>
      </div>

      {/* ── table ───────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {["User", "Email", "Phone", "Role", "Status", "Last Login", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <svg
                          className="w-7 h-7 opacity-50"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">No users match your filters</p>
                      <p className="text-xs text-slate-300">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="group border-b border-slate-100 transition-colors duration-150 last:border-0 hover:bg-red-50/30"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarColor(user.name)} text-[12px] font-bold text-white shadow-sm`}
                        >
                          {avatar(user.name)}
                        </div>
                        <span className="font-semibold text-slate-800 whitespace-nowrap">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-[13px]">{user.email}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-[13px]">{user.phone || "—"}</td>
                    <td className="px-4 py-3.5"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3.5"><LockBadge locked={user.hardLock} /></td>
                    <td className="px-4 py-3.5 text-slate-400 text-[13px] whitespace-nowrap">
                      {fmtDate(user.lastLogin)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedUser(idx)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition-all duration-150 hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow-red-100"
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* table footer + pagination */}
        {!loading && data.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">{pagination.total}</span>{" "}
              users
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setOptions((o) => ({ ...o, page }))}
            />
          </div>
        )}
      </div>

      {/* ── user detail sheet ────────────────────────────────────────────────── */}
      {selectedUser !== null && (
        <Sheet open onOpenChange={() => setSelectedUser(null)}>
          {/*
           * SCROLL FIX ARCHITECTURE:
           * SheetContent = flex column, h-full, overflow-hidden (clips nothing escapes)
           *   ├── Hero header  → flex-shrink-0  (fixed height, never squishes)
           *   └── Body wrapper → flex-1, min-h-0, overflow-y-auto  (scrolls independently)
           *
           * min-h-0 is critical — without it, flex children won't shrink below
           * their intrinsic content size, causing the body to overflow the sheet.
           */}
          <SheetContent
            className="
              w-full sm:max-w-[480px]
              flex flex-col
              h-full
              p-0
              border-l border-slate-200
              bg-white
              overflow-hidden
            "
          >
            {/* ── HERO HEADER — never scrolls, always visible ── */}
            <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-rose-800 px-6 pb-7 pt-10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-sm" />
              <div className="pointer-events-none absolute right-4 top-16 h-20 w-20 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-red-900/30" />

              <SheetHeader className="relative z-10">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarColor(data[selectedUser].name)} text-xl font-black text-white shadow-xl ring-4 ring-white/20`}
                  >
                    {avatar(data[selectedUser].name)}
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-xl font-black text-white tracking-tight truncate">
                      {data[selectedUser].name}
                    </SheetTitle>
                    <SheetDescription className="text-red-200 text-xs mt-0.5 truncate">
                      {data[selectedUser].email}
                    </SheetDescription>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <RoleBadge role={data[selectedUser].role} />
                  <LockBadge locked={data[selectedUser].hardLock} />
                  {data[selectedUser].lastLogin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-white/20 text-white/90 border border-white/20">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor">
                        <circle cx="6" cy="6" r="5" opacity="0.3" />
                        <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                      </svg>
                      {fmtDate(data[selectedUser].lastLogin)}
                    </span>
                  )}
                </div>
              </SheetHeader>
            </div>

            {/* ── SCROLLABLE BODY — takes all remaining height, scrolls ── */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">

              {/* contact */}
              <div className="px-6 py-5">
                <SectionHeading>Contact Info</SectionHeading>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 divide-y divide-slate-100">
                  <DetailRow label="Email" value={data[selectedUser].email} />
                  <DetailRow label="Phone" value={data[selectedUser].phone || "—"} />
                  <DetailRow label="Last Login" value={fmtDateTime(data[selectedUser].lastLogin)} />
                </div>
              </div>

              {/* address */}
              <div className="px-6 py-5">
                <SectionHeading>Address</SectionHeading>
                {data[selectedUser].address ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 divide-y divide-slate-100">
                    <DetailRow label="Full Name" value={data[selectedUser].address.fullName} />
                    <DetailRow
                      label="Street"
                      value={`${data[selectedUser].address.street}, ${data[selectedUser].address.municipality}`}
                    />
                    <DetailRow
                      label="Region"
                      value={`${data[selectedUser].address.district}, ${data[selectedUser].address.province}`}
                    />
                    <DetailRow label="Postal" value={data[selectedUser].address.postalCode} />
                    <DetailRow label="Country" value={data[selectedUser].address.country} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-400">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 1 1 9.9 9.9L10 18.9l-4.95-4.95a7 7 0 0 1 0-9.9zM10 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    No address on file
                  </div>
                )}
              </div>

              {/* login history — no inner max-h, parent scrolls */}
              <div className="px-6 py-5">
                <SectionHeading
                  badge={
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {data[selectedUser].loginHistory.length}
                    </span>
                  }
                >
                  Login History
                </SectionHeading>

                {data[selectedUser].loginHistory.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-400">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm2 0v8h10V5H5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    No login history recorded
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data[selectedUser].loginHistory.map((log, i) => (
                      <div
                        key={i}
                        className={`relative rounded-xl border px-4 py-3 text-sm ${
                          log.isSuspicious
                            ? "border-red-200 bg-red-50/70"
                            : "border-slate-200 bg-slate-50/60"
                        }`}
                      >
                        {log.isSuspicious && (
                          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 border border-red-200">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M6 1L11 10H1L6 1z" />
                              <path d="M5.5 4.5h1v3h-1zM5.5 8.5h1v1h-1z" fill="white" />
                            </svg>
                            Suspicious
                          </span>
                        )}
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                            <p className="text-slate-600 text-[12px] min-w-0">
                              <span className="font-semibold">IP: </span>
                              <span className="break-all">{log.ip}</span>
                            </p>
                            <p className="text-slate-600 text-[12px] shrink-0">
                              <span className="font-semibold">Device: </span>
                              {log.device || "—"}
                            </p>
                          </div>
                          <p className="text-slate-400 text-[11px]">
                            {fmtDateTime(log.at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* danger zone — only if hard locked */}
              {data[selectedUser].hardLock && (
                <div className="px-6 py-5">
                  <SectionHeading color="text-red-400">Danger Zone</SectionHeading>
                  <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0 1 10 0v2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm8-2v2H7V7a3 3 0 0 1 6 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-red-800">Account Hard Locked</p>
                        <p className="mt-1 text-xs text-red-500 leading-relaxed">
                          Locked due to repeated failed login attempts. Reset to restore full access for this user.
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-3 w-full h-9 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200"
                          disabled={resetLoading}
                          onClick={async () => {
                            setResetLoading(true);
                            const res = await resetUserHardLock(data[selectedUser].id);
                            setResetLoading(false);
                            if (res.success) {
                              toast.success("Hard lock reset successfully");
                              fetchUsers();
                              setSelectedUser(null);
                            } else {
                              toast.error(res.message);
                            }
                          }}
                        >
                          {resetLoading ? (
                            <span className="flex items-center gap-2">
                              <svg
                                className="w-3.5 h-3.5 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <circle cx="12" cy="12" r="10" opacity="0.25" />
                                <path d="M12 2a10 10 0 0 1 10 10" />
                              </svg>
                              Resetting…
                            </span>
                          ) : (
                            "Reset Hard Lock"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* bottom breathing room so last item isn't flush against edge */}
              <div className="h-6" />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}