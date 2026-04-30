"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Pagination from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminUsersResponse,
  getAllUsersAdmin,
  GetUsersFilters,
  GetUsersOptions,
  resetUserHardLock,
} from "@/lib/server/actions/admin/customers/customerActions";
import {
  getEmailMarketingOverview,
  type CampaignTargetOptions,
  sendCustomEmailToUserAction,
  updateUserNewsletterStatusAction,
} from "@/lib/server/actions/admin/customers/emailMarketingActions";
import { AdminTableRevealStyles, getAdminRowReveal } from "@/components/admin/admin-table-reveal";

interface UsersTableProps {
  initialData: AdminUsersResponse;
}

type UserDTO = AdminUsersResponse["data"][number];

function getClientErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

const avatar = (name: string) =>
  name
    .split(" ")
    .map((item) => item[0])
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

  const index =
    name.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0) %
    palette.length;

  return palette[index];
};

const fmtDate = (value: string | Date | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const fmtDateTime = (value: string | Date | null | undefined) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function RoleBadge({ role }: { role: string }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-red-700">
      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.3L6 8.4l-3.1 1.6.6-3.3L1 4.3l3.6-.5L6 1z" />
      </svg>
      Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-slate-500">
      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="6" cy="4" r="2.5" />
        <path d="M1.5 10.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      </svg>
      User
    </span>
  );
}

function LockBadge({ locked }: { locked: boolean }) {
  return locked ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-red-600">
      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="currentColor">
        <rect x="2" y="5" width="8" height="6" rx="1" />
        <path d="M4 5V3.5a2 2 0 1 1 4 0V5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      Locked
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-700">
      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="4.5" />
        <path d="M4 6l1.5 1.5L8 4.5" />
      </svg>
      Active
    </span>
  );
}

function NewsletterBadge({ subscribed }: { subscribed: boolean }) {
  return subscribed ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-sky-700">
      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="currentColor">
        <path d="M1.5 3.5h9v5h-9z" />
        <path d="M1.5 3.5L6 7l4.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      Subscribed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-slate-500">
      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.1">
        <path d="M1.5 3.5h9v5h-9z" />
        <path d="M1.5 3.5L6 7l4.5-3.5" />
        <path d="M2 10L10 2" />
      </svg>
      Opted Out
    </span>
  );
}

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
    <div className={`relative overflow-hidden rounded-2xl border ${border} bg-white p-4 shadow-sm transition-shadow hover:shadow-md`}>
      <div className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-black tracking-tight text-slate-800 tabular-nums">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <span className="min-w-[110px] text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-sm leading-relaxed text-slate-700">{value}</span>
    </div>
  );
}

function SectionHeading({
  children,
  badge,
  color = "text-slate-400",
}: {
  children: React.ReactNode;
  badge?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <p className={`text-[11px] font-semibold uppercase tracking-widest ${color}`}>{children}</p>
      {badge}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: 8 }).map((_, index) => (
        <td key={index} className="px-4 py-4">
          <div
            className="h-3.5 animate-pulse rounded-full bg-slate-100"
            style={{ width: `${50 + ((index * 17) % 40)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

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
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [mailLoading, setMailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [emailDraft, setEmailDraft] = useState({
    subject: "",
    previewText: "",
    body: "",
    ctaLabel: "",
    targetType: "none",
    targetValue: "",
  });
  const [campaignTargetOptions, setCampaignTargetOptions] = useState<CampaignTargetOptions>({
    pages: [],
    categories: [],
    brands: [],
    products: [],
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    tone?: "default" | "danger";
    action: "newsletter" | "email" | "hardlock";
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search: search || undefined }));
      setOptions((current) => ({ ...current, page: 1 }));
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsersAdmin(filters, options);
      if (response.success) {
        setData(response.data);
        setPagination(response.pagination);
        return;
      }

      toast.error(response.message || "Unable to load users.");
    } catch (error) {
      toast.error(getClientErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filters, options]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const loadTargetOptions = async () => {
      try {
        const response = await getEmailMarketingOverview();
        if (response.success && response.data) {
          setCampaignTargetOptions(response.data.targetOptions);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadTargetOptions();
  }, []);

  useEffect(() => {
    if (selectedUser === null) {
      setEmailDraft({
        subject: "",
        previewText: "",
        body: "",
        ctaLabel: "",
        targetType: "none",
        targetValue: "",
      });
    }
  }, [selectedUser]);

  const lockedCount = useMemo(() => data.filter((user) => user.hardLock).length, [data]);
  const adminCount = useMemo(() => data.filter((user) => user.role === "admin").length, [data]);
  const newsletterCount = useMemo(
    () => data.filter((user) => user.newsletter?.subscribed).length,
    [data]
  );

  const selectedUserData = selectedUser !== null ? data[selectedUser] : null;
  const customEmailTargetOptions =
    emailDraft.targetType === "page"
      ? campaignTargetOptions.pages
      : emailDraft.targetType === "category"
        ? campaignTargetOptions.categories
        : emailDraft.targetType === "brand"
          ? campaignTargetOptions.brands
          : emailDraft.targetType === "product"
            ? campaignTargetOptions.products
            : [];
  const selectedCustomEmailTarget = customEmailTargetOptions.find(
    (option) => option.value === emailDraft.targetValue
  );

  return (
    <div className="space-y-5">
      <AdminTableRevealStyles />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard
          label="Total Users"
          value={pagination.total}
          border="border-slate-200"
          accent="bg-red-50 text-red-500"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0 1 10 0v2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm8-2v2H7V7a3 3 0 0 1 6 0z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
        <StatCard
          label="Subscribed"
          value={newsletterCount}
          border="border-sky-100"
          accent="bg-sky-50 text-sky-600"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.5 5.5h15v9h-15z" />
              <path d="M2.5 5.5L10 11l7.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="relative min-w-[200px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:border-red-300 focus-visible:ring-red-400"
          />
        </div>

        <Select
          onValueChange={(value) => {
            setFilters((current) => ({
              ...current,
              role: value === "all" ? undefined : (value as "user" | "admin"),
            }));
            setOptions((current) => ({ ...current, page: 1 }));
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
          onValueChange={(value) => {
            setFilters((current) => ({
              ...current,
              newsletterSubscribed: value === "all" ? undefined : value === "true",
            }));
            setOptions((current) => ({ ...current, page: 1 }));
          }}
        >
          <SelectTrigger className="h-9 w-44 rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-red-400">
            <SelectValue placeholder="Newsletter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscribers</SelectItem>
            <SelectItem value="true">Subscribed</SelectItem>
            <SelectItem value="false">Opted Out</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => {
            setFilters((current) => ({
              ...current,
              hardLock: value === "all" ? undefined : value === "true",
            }));
            setOptions((current) => ({ ...current, page: 1 }));
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
          onValueChange={(value) =>
            setOptions((current) => ({
              ...current,
              sortBy: value as "newest" | "oldest" | "lastLogin",
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

        <span className="ml-auto whitespace-nowrap text-xs tabular-nums text-slate-400">
          {pagination.total} total · page {pagination.page}/{pagination.totalPages}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {["User", "Email", "Phone", "Role", "Newsletter", "Status", "Last Login", ""].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <svg
                          className="h-7 w-7 opacity-50"
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
                      <p className="text-xs text-slate-300">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((user, index) => (
                  <tr
                    key={user.id}
                    className="group border-b border-slate-100 transition-colors duration-150 last:border-0 hover:bg-red-50/30"
                    style={getAdminRowReveal(index)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarColor(user.name)} text-[12px] font-bold text-white shadow-sm`}
                        >
                          {avatar(user.name)}
                        </div>
                        <span className="whitespace-nowrap font-semibold text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-500">{user.email}</td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-500">{user.phone || "—"}</td>
                    <td className="px-4 py-3.5">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3.5">
                      <NewsletterBadge subscribed={user.newsletter.subscribed} />
                    </td>
                    <td className="px-4 py-3.5">
                      <LockBadge locked={user.hardLock} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-slate-400">
                      {fmtDate(user.lastLogin)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedUser(index)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition-all duration-150 hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow-red-100"
                      >
                        <svg
                          className="h-3.5 w-3.5"
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

        {!loading && data.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span>{" "}
              of <span className="font-semibold text-slate-600">{pagination.total}</span> users
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setOptions((current) => ({ ...current, page }))}
            />
          </div>
        )}
      </div>

      {selectedUserData && (
        <Sheet open onOpenChange={() => setSelectedUser(null)}>
          <SheetContent className="flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-white p-0 sm:max-w-2xl">
            <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-rose-800 px-6 pb-7 pt-10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-sm" />
              <div className="pointer-events-none absolute right-4 top-16 h-20 w-20 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-red-900/30" />

              <SheetHeader className="relative z-10">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarColor(selectedUserData.name)} text-xl font-black text-white shadow-xl ring-4 ring-white/20`}
                  >
                    {avatar(selectedUserData.name)}
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-xl font-black tracking-tight text-white">
                      {selectedUserData.name}
                    </SheetTitle>
                    <SheetDescription className="mt-0.5 truncate text-xs text-red-200">
                      {selectedUserData.email}
                    </SheetDescription>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <RoleBadge role={selectedUserData.role} />
                  <NewsletterBadge subscribed={selectedUserData.newsletter.subscribed} />
                  <LockBadge locked={selectedUserData.hardLock} />
                  {selectedUserData.lastLogin && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white/90">
                      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="currentColor">
                        <circle cx="6" cy="6" r="5" opacity="0.3" />
                        <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                      </svg>
                      {fmtDate(selectedUserData.lastLogin)}
                    </span>
                  )}
                </div>
              </SheetHeader>
            </div>

            <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
              <div className="px-6 py-5">
                <SectionHeading>Contact Info</SectionHeading>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/60 px-4">
                  <DetailRow label="Email" value={selectedUserData.email} />
                  <DetailRow label="Phone" value={selectedUserData.phone || "—"} />
                  <DetailRow label="Last Login" value={fmtDateTime(selectedUserData.lastLogin)} />
                </div>
              </div>

              <div className="px-6 py-5">
                <SectionHeading>Newsletter</SectionHeading>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedUserData.newsletter.subscribed ? "Subscribed" : "Opted out"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Source: {selectedUserData.newsletter.source} · Subscribed {fmtDateTime(selectedUserData.newsletter.subscribedAt)}
                      </p>
                      {selectedUserData.newsletter.unsubscribedAt && !selectedUserData.newsletter.subscribed && (
                        <p className="mt-1 text-xs text-slate-400">
                          Unsubscribed {fmtDateTime(selectedUserData.newsletter.unsubscribedAt)}
                        </p>
                      )}
                      {selectedUserData.newsletter.lastCampaignSubject && (
                        <p className="mt-1 text-xs text-slate-400">
                          Last campaign: {selectedUserData.newsletter.lastCampaignSubject}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={newsletterLoading}
                      className="rounded-xl border-slate-200"
                      onClick={() => {
                        setConfirmConfig({
                          action: "newsletter",
                          title: selectedUserData.newsletter.subscribed
                            ? "Unsubscribe this user?"
                            : "Resubscribe this user?",
                          description: `This will ${
                            selectedUserData.newsletter.subscribed ? "stop" : "restore"
                          } newsletter delivery for ${selectedUserData.email}.`,
                          tone: selectedUserData.newsletter.subscribed ? "danger" : "default",
                        });
                        setConfirmOpen(true);
                      }}
                    >
                      {newsletterLoading
                        ? "Updating..."
                        : selectedUserData.newsletter.subscribed
                          ? "Unsubscribe User"
                          : "Subscribe User"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <SectionHeading>Address</SectionHeading>
                {selectedUserData.address ? (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/60 px-4">
                    <DetailRow label="Full Name" value={selectedUserData.address.fullName} />
                    <DetailRow
                      label="Street"
                      value={`${selectedUserData.address.street || "—"}, ${selectedUserData.address.municipality || "—"}`}
                    />
                    <DetailRow
                      label="Region"
                      value={`${selectedUserData.address.district || "—"}, ${selectedUserData.address.province || "—"}`}
                    />
                    <DetailRow label="Postal" value={selectedUserData.address.postalCode || "—"} />
                    <DetailRow label="Country" value={selectedUserData.address.country || "—"} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-400">
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
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

              <div className="px-6 py-5">
                <SectionHeading
                  badge={
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {selectedUserData.loginHistory.length}
                    </span>
                  }
                >
                  Login History
                </SectionHeading>

                {selectedUserData.loginHistory.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-400">
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
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
                    {selectedUserData.loginHistory.map((log, index) => (
                      <div
                        key={index}
                        className={`relative rounded-xl border px-4 py-3 text-sm ${
                          log.isSuspicious
                            ? "border-red-200 bg-red-50/70"
                            : "border-slate-200 bg-slate-50/60"
                        }`}
                      >
                        {log.isSuspicious && (
                          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M6 1L11 10H1L6 1z" />
                              <path d="M5.5 4.5h1v3h-1zM5.5 8.5h1v1h-1z" fill="white" />
                            </svg>
                            Suspicious
                          </span>
                        )}
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                            <p className="min-w-0 text-[12px] text-slate-600">
                              <span className="font-semibold">IP: </span>
                              <span className="break-all">{log.ip}</span>
                            </p>
                            <p className="shrink-0 text-[12px] text-slate-600">
                              <span className="font-semibold">Device: </span>
                              {log.device || "—"}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400">{fmtDateTime(log.at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedUserData.role !== "admin" && (
              <div className="px-6 py-5">
                <SectionHeading>Send Custom Email</SectionHeading>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Subject
                      </label>
                      <Input
                        value={emailDraft.subject}
                        onChange={(event) =>
                          setEmailDraft((current) => ({ ...current, subject: event.target.value }))
                        }
                        placeholder="Custom subject"
                        className="border-slate-200 bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Preview Text
                      </label>
                      <Input
                        value={emailDraft.previewText}
                        onChange={(event) =>
                          setEmailDraft((current) => ({ ...current, previewText: event.target.value }))
                        }
                        placeholder="Short inbox preview"
                        className="border-slate-200 bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Message
                      </label>
                      <Textarea
                        rows={7}
                        value={emailDraft.body}
                        onChange={(event) =>
                          setEmailDraft((current) => ({ ...current, body: event.target.value }))
                        }
                        placeholder="Write the email message here."
                        className="border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        CTA Label
                      </label>
                      <Input
                        value={emailDraft.ctaLabel}
                        onChange={(event) =>
                          setEmailDraft((current) => ({ ...current, ctaLabel: event.target.value }))
                        }
                        placeholder="Learn more"
                        className="border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Target
                      </label>
                      <select
                        value={emailDraft.targetType}
                        onChange={(event) =>
                          setEmailDraft((current) => ({
                            ...current,
                            targetType: event.target.value,
                            targetValue: "",
                          }))
                        }
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200"
                      >
                        <option value="none">No destination link</option>
                        <option value="page">Site page</option>
                        <option value="category">Shop category</option>
                        <option value="brand">Brand page</option>
                        <option value="product">Product page</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Destination
                      </label>
                      <select
                        value={emailDraft.targetValue}
                        onChange={(event) =>
                          setEmailDraft((current) => ({ ...current, targetValue: event.target.value }))
                        }
                        disabled={emailDraft.targetType === "none"}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        <option value="">
                          {emailDraft.targetType === "none" ? "No destination selected" : "Select destination"}
                        </option>
                        {customEmailTargetOptions.map((option) => (
                          <option key={`custom-email-${emailDraft.targetType}-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedCustomEmailTarget && (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Destination Preview
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedCustomEmailTarget.label}
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {selectedCustomEmailTarget.path}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button
                      disabled={mailLoading}
                      className="rounded-xl bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        const normalizedSubject = emailDraft.subject.trim();
                        const normalizedBody = emailDraft.body.trim();
                       
                        if (normalizedSubject.length < 3) {
                          toast.error("Subject must be at least 3 characters.");
                          return;
                        }

                        if (normalizedBody.length < 10) {
                          toast.error("Message must be at least 10 characters.");
                          return;
                        }

                        if (emailDraft.targetType !== "none" && !emailDraft.targetValue) {
                          toast.error("Select the campaign destination before sending.");
                          return;
                        }
                        setConfirmConfig({
                          action: "email",
                          title: "Send direct email to this user?",
                          description: `This will send "${normalizedSubject}" directly to ${selectedUserData.email}.`,
                          tone: "default",
                        });
                        setConfirmOpen(true);
                      }}
                    >
                      {mailLoading ? "Sending..." : "Send Email"}
                    </Button>
                  </div>
                </div>
              </div>
              )}

              {selectedUserData.hardLock && (
                <div className="px-6 py-5">
                  <SectionHeading color="text-red-400">Danger Zone</SectionHeading>
                  <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0 1 10 0v2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm8-2v2H7V7a3 3 0 0 1 6 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-red-800">Account Hard Locked</p>
                        <p className="mt-1 text-xs leading-relaxed text-red-500">
                          Locked due to repeated failed login attempts. Reset to restore full access for this user.
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-3 h-9 w-full rounded-xl bg-red-600 text-xs font-semibold shadow-sm shadow-red-200 hover:bg-red-700"
                          disabled={resetLoading}
                          onClick={() => {
                            setConfirmConfig({
                              action: "hardlock",
                              title: "Reset hard lock for this account?",
                              description: `This will restore login access for ${selectedUserData.email}. Use this only after verifying the account owner.`,
                              tone: "danger",
                            });
                            setConfirmOpen(true);
                          }}
                        >
                          {resetLoading ? "Resetting..." : "Reset Hard Lock"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-6" />
            </div>
          </SheetContent>
        </Sheet>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setConfirmConfig(null);
        }}
        title={confirmConfig?.title || ""}
        description={confirmConfig?.description || ""}
        tone={confirmConfig?.tone || "default"}
        pending={newsletterLoading || mailLoading || resetLoading}
        confirmLabel={
          confirmConfig?.action === "hardlock"
            ? "Reset Lock"
            : confirmConfig?.action === "newsletter"
              ? selectedUserData?.newsletter.subscribed
                ? "Unsubscribe"
                : "Resubscribe"
              : "Send Email"
        }
        onConfirm={async () => {
          if (!confirmConfig || !selectedUserData) return;

          if (confirmConfig.action === "newsletter") {
            try {
              setNewsletterLoading(true);
              const response = await updateUserNewsletterStatusAction(
                selectedUserData.id,
                !selectedUserData.newsletter.subscribed
              );
              if (!response.success) {
                toast.error(response.message || "Unable to update newsletter status.");
                return;
              }
              toast.success(response.message);
              await fetchUsers();
            } catch (error) {
              toast.error(getClientErrorMessage(error));
            } finally {
              setNewsletterLoading(false);
              setConfirmOpen(false);
              setConfirmConfig(null);
            }
            return;
          }

          if (confirmConfig.action === "email") {
            try {
              setMailLoading(true);
              const formData = new FormData();
              formData.set("userId", selectedUserData.id);
              formData.set("subject", emailDraft.subject.trim());
              formData.set("previewText", emailDraft.previewText.trim());
              formData.set("body", emailDraft.body.trim());
              formData.set("ctaLabel", emailDraft.ctaLabel.trim());
              formData.set("targetType", emailDraft.targetType);
              formData.set("targetValue", emailDraft.targetValue);
              formData.set("ctaUrl", "");

              const response = await sendCustomEmailToUserAction(formData);
              if (!response.success) {
                toast.error(response.message || "Unable to send custom email.");
                return;
              }

              toast.success(response.message);
              setEmailDraft({
                subject: "",
                previewText: "",
                body: "",
                ctaLabel: "",
                targetType: "none",
                targetValue: "",
              });
              await fetchUsers();
            } catch (error) {
              toast.error(getClientErrorMessage(error));
            } finally {
              setMailLoading(false);
              setConfirmOpen(false);
              setConfirmConfig(null);
            }
            return;
          }

          try {
            setResetLoading(true);
            const response = await resetUserHardLock(selectedUserData.id);
            if (!response.success) {
              toast.error(response.message || "Unable to reset hard lock.");
              return;
            }

            toast.success("Hard lock reset successfully");
            await fetchUsers();
            setSelectedUser(null);
          } catch (error) {
            toast.error(getClientErrorMessage(error));
          } finally {
            setResetLoading(false);
            setConfirmOpen(false);
            setConfirmConfig(null);
          }
        }}
      />
    </div>
  );
}
