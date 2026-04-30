"use client";

import { useState, useMemo } from "react";
import { Search, Package, X, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Pagination from "../shared/Pagination";
import ConfirmDialog from "@/components/ui/confirm-dialog";

/* ================= TYPES ================= */
interface OrderResponse {
  _id: string;
  totalPrice: number;
  orderStatus: "pending" | "processing" | "delivered" | "cancelled" | "failed";
  paymentStatus: "pending" | "submitted" | "paid" | "failed";
  paymentMethod: "COD" | "OnlineUpload";
  createdAt: string;
  deliveryInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  orderItems: Array<{
    product: { name: string };
    quantity: number;
    price: number;
  }>;
}

interface OrdersClientProps {
  orders: OrderResponse[];
  cancelOrderAction: (id: string) => Promise<{ success: boolean }>;
  deleteOrderAction: (id: string) => Promise<{ success: boolean }>;
  itemsPerPage?: number; // how many orders per page
}

function orderMatchesSearch(order: OrderResponse, query: string): boolean {
  if (!query.trim()) return true;

  const q = query.toLowerCase();

  return (
    // Order ID
    order._id.toLowerCase().includes(q) ||

    // Order status
    order.orderStatus.toLowerCase().includes(q) ||

    // Payment
    order.paymentStatus.toLowerCase().includes(q) ||
    order.paymentMethod.toLowerCase().includes(q) ||

    // Customer / delivery info
    order.deliveryInfo.name.toLowerCase().includes(q) ||
    order.deliveryInfo.phone.toLowerCase().includes(q) ||
    order.deliveryInfo.city.toLowerCase().includes(q) ||

    // Products
    order.orderItems.some((item) =>
      item.product.name.toLowerCase().includes(q)
    )
  );
}


/* ================= COMPONENT ================= */
export default function OrdersClient({
  orders: initialOrders,
  cancelOrderAction,
  deleteOrderAction,
  itemsPerPage = 5,
}: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderResponse[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: "cancel" | "delete"; orderId: string }>({ open: false, type: "cancel", orderId: "" });
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------------- FILTER & SEARCH ---------------- */
const filteredOrders = useMemo(() => {
  return orders.filter((order) => {
    const matchesSearch = orderMatchesSearch(order, searchQuery);
    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });
}, [orders, searchQuery, statusFilter]);


  /* ---------------- CLIENT-SIDE PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  /* ---------------- ACTIONS ---------------- */
  const handleCancel = async (orderId: string) => {
    setLoadingStates((prev) => ({ ...prev, [orderId]: true }));
    try {
      const result = await cancelOrderAction(orderId);
      if (result.success) {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? { ...order, orderStatus: "cancelled" } : order))
        );
      }
    } catch (error) {
      console.error("Cancel failed:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [orderId]: false }));
      setConfirmDialog({ open: false, type: "cancel", orderId: "" });
    }
  };

  const handleDelete = async (orderId: string) => {
    setLoadingStates((prev) => ({ ...prev, [orderId]: true }));
    try {
      const result = await deleteOrderAction(orderId);
      if (result.success) {
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [orderId]: false }));
      setConfirmDialog({ open: false, type: "delete", orderId: "" });
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  /* ---------------- HELPERS ---------------- */
  const getStatusConfig = (status: OrderResponse["orderStatus"]) => {
    const configs = {
      pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: <Clock className="w-4 h-4" />, label: "Pending" },
      processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <Package className="w-4 h-4" />, label: "Processing" },
      delivered: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: <CheckCircle2 className="w-4 h-4" />, label: "Delivered" },
      cancelled: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: <X className="w-4 h-4" />, label: "Cancelled" },
      failed: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <AlertCircle className="w-4 h-4" />, label: "Failed" },
    };
    return configs[status];
  };

  const getPaymentStatusConfig = (status: OrderResponse["paymentStatus"]) => {
    const configs = {
      pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: <Clock className="w-4 h-4" />, label: "Pending" },
      submitted: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <Package className="w-4 h-4" />, label: "Submitted" },
      paid: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: <CheckCircle2 className="w-4 h-4" />, label: "Paid" },
      failed: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <AlertCircle className="w-4 h-4" />, label: "Failed" },
    };
    return configs[status];
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  /* ---------------- RENDER ---------------- */
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Package className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No orders yet</p>
        <p className="text-sm">Your orders will appear here once you place them</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order/payment status, product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.map((order) => {
                const statusConfig = getStatusConfig(order.orderStatus);
                const paymentStatusConfig = getPaymentStatusConfig(order.paymentStatus);
                const isLoading = loadingStates[order._id];

                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${paymentStatusConfig.bg} ${paymentStatusConfig.text} ${paymentStatusConfig.border}`}>
                        {paymentStatusConfig.icon} {paymentStatusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-xs font-semibold text-gray-900">Rs. {order.totalPrice.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.orderStatus === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setConfirmDialog({ open: true, type: "cancel", orderId: order._id })} disabled={isLoading} className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cancel"}
                          </button>
                          <button onClick={() => setConfirmDialog({ open: true, type: "delete", orderId: order._id })} disabled={isLoading} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, type: "cancel", orderId: "" });
        }}
        title={confirmDialog.type === "delete" ? "Delete order?" : "Cancel order?"}
        description={
          confirmDialog.type === "delete"
            ? "Are you sure you want to delete this order? This action cannot be undone."
            : "Are you sure you want to cancel this order? You can place a new order anytime."
        }
        cancelLabel="Keep Order"
        confirmLabel={confirmDialog.type === "delete" ? "Delete" : "Cancel Order"}
        onConfirm={() =>
          confirmDialog.type === "delete"
            ? handleDelete(confirmDialog.orderId)
            : handleCancel(confirmDialog.orderId)
        }
        pending={!!loadingStates[confirmDialog.orderId]}
        tone={confirmDialog.type === "delete" ? "danger" : "default"}
      />

      {/* PAGINATION */}
      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
