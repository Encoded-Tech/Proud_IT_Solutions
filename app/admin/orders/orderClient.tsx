"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { OrderStatus, PaymentStatus } from "@/lib/server/fetchers/fetchOrders";
import { AdminOrderResponse } from "@/lib/server/mappers/MapOrdersForAdmin";
import { adminDeleteOrdersAction } from "@/lib/server/actions/admin/order/orderActionsAdmin";
import EditOrderSheet from "./editsheet";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard
} from "lucide-react";

interface Props {
  initialData: AdminOrderResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export default function OrdersClient({
  initialData,
  total,
  page,
  totalPages,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState<string>(params.get("search") ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [initialData, page]);

  /* ---------------- FILTER ---------------- */
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());

    // If value is "all" or empty, remove the filter
    if (value && value !== "all") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    newParams.set("page", "1");

    startTransition(() => {
      router.push(`?${newParams.toString()}`);
      toast.success("Filter applied");
    });
  };

  const clearFilters = () => {
    router.push(window.location.pathname);
    setSearch("");
    toast.success("Filters cleared");
  };

  /* ---------------- PAGINATION ---------------- */
  const changePage = (p: number) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("page", String(p));
    router.push(`?${newParams.toString()}`);
  };

  const pendingOrders = initialData.filter((order) => order.paymentStatus === "pending");
  const allVisibleSelected =
    pendingOrders.length > 0 && pendingOrders.every((order) => selectedIds.includes(order._id));

  const toggleSelection = (orderId: string) => {
    setSelectedIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(pendingOrders.map((order) => order._id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(true);
    try {
      const result = await adminDeleteOrdersAction(selectedIds);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      router.refresh();
    } finally {
      setBulkActionLoading(false);
    }
  };

  /* ---------------- STATUS BADGES ---------------- */
  const getPaymentMethodBadge = (method: string) => {
    const isCOD = method === "COD";
    
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          isCOD
            ? "bg-orange-100 text-orange-700 border-orange-200"
            : "bg-purple-100 text-purple-700 border-purple-200"
        }`}
      >
        {isCOD ? (
          <>
            <Package className="w-3 h-3" />
            COD
          </>
        ) : (
          <>
            <CreditCard className="w-3 h-3" />
            Online
          </>
        )}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      submitted: "bg-blue-100 text-blue-700 border-blue-200",
      failed: "bg-red-100 text-red-700 border-red-200",
    };

    const icons = {
      paid: <CheckCircle2 className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      submitted: <AlertCircle className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[status]
        }`}
      >
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    const styles = {
      pending: "bg-slate-100 text-slate-700 border-slate-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      failed: "bg-red-100 text-red-700 border-red-200",
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      processing: <Package className="w-3 h-3 animate-pulse" />,
      delivered: <CheckCircle2 className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[status]
        }`}
      >
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const hasActiveFilters =
    params.get("paymentStatus") ||
    params.get("orderStatus") ||
    params.get("paymentMethod") ||
    params.get("search");

  return (
    <div className="space-y-6">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
          <span className="font-semibold text-gray-900">{total}</span> total orders
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={toggleSelectAllVisible}>
            {allVisibleSelected ? "Clear Selection" : "Select All Pending"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setBulkDeleteOpen(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      {/* ---------------- SEARCH & FILTER BAR ---------------- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by Order ID, user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateFilter("search", search);
                }
              }}
              className="pl-9 border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 ${
              hasActiveFilters ? "border-primary text-primary" : ""
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                •
              </span>
            )}
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2">
              Clear all
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Payment Status
              </label>
              <Select
                value={params.get("paymentStatus") ?? "all"}
                onValueChange={(v) => updateFilter("paymentStatus", v)}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Order Status
              </label>
              <Select
                value={params.get("orderStatus") ?? "all"}
                onValueChange={(v) => updateFilter("orderStatus", v)}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Payment Method
              </label>
              <Select
                value={params.get("paymentMethod") ?? "all"}
                onValueChange={(v) => updateFilter("paymentMethod", v)}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="COD">Cash on Delivery</SelectItem>
                  <SelectItem value="OnlineUpload">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- ORDERS TABLE ---------------- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    className="h-4 w-4"
                    aria-label="Select all pending visible orders"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No orders found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your filters
                    </p>
                  </td>
                </tr>
              ) : (
                initialData.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedIds.includes(order._id) ? "bg-rose-50/60" : ""
                    }`}
                    style={{
                      animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                    }}
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order._id)}
                        onChange={() => toggleSelection(order._id)}
                        disabled={order.paymentStatus !== "pending"}
                        className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Select order ${order._id}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          #{order._id.slice(-8).toUpperCase()}
                        </code>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.user?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user?.email || "N/A"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {order.orderItems.length} item
                        {order.orderItems.length !== 1 ? "s" : ""}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        Rs. {order.totalPrice.toLocaleString()}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {getPaymentMethodBadge(order.paymentMethod)}
                    </td>

                    <td className="px-6 py-4">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td>

                    <td className="px-6 py-4">
                      {getOrderStatusBadge(order.orderStatus)}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <EditOrderSheet order={order} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- PAGINATION ---------------- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {(page - 1) * 10 + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-gray-900">
              {Math.min(page * 10, total)}
            </span>{" "}
            of <span className="font-medium text-gray-900">{total}</span> orders
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => changePage(pageNum)}
                    className="w-9 h-9 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => changePage(page + 1)}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected orders?"
        description={`This will permanently delete ${selectedIds.length} selected pending orders. This action cannot be undone.`}
        confirmLabel="Delete Orders"
        onConfirm={handleBulkDelete}
        pending={bulkActionLoading}
        tone="danger"
      />
    </div>
  );
}
