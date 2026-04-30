"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { AdminOrderResponse } from "@/lib/server/mappers/MapOrdersForAdmin";
import { OrderStatus, PaymentStatus } from "@/lib/server/fetchers/fetchOrders";
import { adminUpdateOrderAction } from "@/lib/server/actions/admin/order/orderActionsAdmin";
import {
  Edit3,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Image from "@/components/ui/optimized-image";

interface Props {
  order: AdminOrderResponse;
}

export default function EditOrderSheet({ order }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    order.paymentStatus
  );

  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.orderStatus);

  const [isPending, startTransition] = useTransition();

  const updateOrder = () => {
    if (paymentStatus === order.paymentStatus && orderStatus === order.orderStatus) {
      toast.error("No changes made");
      return;
    }

    startTransition(async () => {
      const result = await adminUpdateOrderAction({
        orderId: order._id,
        paymentStatus,
        orderStatus,
      });

      if (result.success) {
        toast.success(result.message || "Order updated successfully!", {
          icon: "✅",
          duration: 3000,
        });
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update order", {
          icon: "❌",
          duration: 4000,
        });
      }
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    return method === "COD" ? "Cash on Delivery" : "Online Payment";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 hover:bg-primary hover:text-white transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-[900px] overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            Order Details
          </SheetTitle>
          <p className="text-sm text-gray-500 mt-2">
            Order ID:{" "}
            <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">
              #{order._id.slice(-8).toUpperCase()}
            </code>
          </p>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Customer Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Customer Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Name
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {order.user?.name || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </label>
                <p className="text-sm text-gray-900">{order.user?.email || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Delivery Information</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Recipient
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {order.deliveryInfo.name}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Phone
                </label>
                <p className="text-sm text-gray-900">{order.deliveryInfo.phone}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Address
                </label>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {order.deliveryInfo.address}, {order.deliveryInfo.city},{" "}
                  {order.deliveryInfo.postalCode}, {order.deliveryInfo.country}
                </p>
              </div>

              {order.deliveryInfo.instructions && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Delivery Instructions
                  </label>
                  <p className="text-sm text-gray-700 italic bg-white/50 p-3 rounded-lg">
                    {order.deliveryInfo.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Order Items</h3>
              <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  {item.product.images?.[0] && (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover border border-gray-200"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Variant: {item.variant.sku}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Qty: {item.quantity} × Rs.{item.price}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      Rs.{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-primary">
                  Rs.{order.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Payment Information</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="text-sm font-medium text-gray-900">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Status</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      order.paymentStatus === "paid"
                        ? "bg-green-500"
                        : order.paymentStatus === "pending"
                        ? "bg-yellow-500"
                        : order.paymentStatus === "submitted"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order Status</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          {order.paymentProof && (
            <div className="bg-white rounded-xl p-5 border-2 border-dashed border-gray-300">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Payment Proof</h3>
                <a
                  href={order.paymentProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View Full Size
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative aspect-video w-full max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={order.paymentProof}
                  alt="Payment proof"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Order Metadata */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Order Timeline</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created At</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.updatedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Update Order Status */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-orange-600" />
              Update Order Status
            </h3>

            <div className="space-y-4">
              {/* Payment Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Status
                </label>

                <Select
                  value={paymentStatus}
                  onValueChange={(v: PaymentStatus) => setPaymentStatus(v)}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="submitted">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Submitted
                      </div>
                    </SelectItem>
                    <SelectItem value="paid">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Paid
                      </div>
                    </SelectItem>
                    <SelectItem value="failed">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Failed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Order Status
                </label>

                <Select
                  value={orderStatus}
                  onValueChange={(v: OrderStatus) => setOrderStatus(v)}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Warning Message */}
              {(paymentStatus !== order.paymentStatus ||
                orderStatus !== order.orderStatus) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ You have unsaved changes. Click &quot;Update Order&quot; to save.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-6">
            <Button
              onClick={updateOrder}
              disabled={isPending}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90 h-12 text-base font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Update Order
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="gap-2 h-12 px-8"
            >
              <XCircle className="w-5 h-5" />
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
