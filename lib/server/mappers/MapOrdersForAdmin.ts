     import { CheckoutDeliveryInfo } from "@/components/client/CheckoutForm";
import { Types } from "mongoose";
import { CheckoutDeliveryInput } from "../actions/public/order/orderActions";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../fetchers/fetchOrders";


export interface AdminPopulatedOrder {
  _id: Types.ObjectId;
  totalPrice: number;
  paymentStatus: "pending" | "submitted" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "delivered" | "cancelled" | "failed";
  paymentMethod: "COD" | "OnlineUpload";

  paymentProof?: string;
  codAdvance: number;
  outsideKathmanduCharge: number;

  stockProcessed: boolean;
  totalSalesUpdated: boolean;

  deliveredAt?: Date;
  cancelledAt?: Date;
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  deliveryInfo:CheckoutDeliveryInfo

  user: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };

  orderItems: {
    quantity: number;
    price: number;
    product: {
      _id: Types.ObjectId;
      name: string;
      slug: string;
      price: number;
      images: string[];
    };
    variant?: {
      _id: Types.ObjectId;
      sku: string;
      price: number;
    };
  }[];
}


export interface AdminOrderResponse {
  _id: string;
  totalPrice: number;
   paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;

  paymentProof?: string;
  codAdvance: number;
  outsideKathmanduCharge: number;

  stockProcessed: boolean;
  totalSalesUpdated: boolean;

  deliveredAt?: string;
  cancelledAt?: string;
  expiresAt?: string;

  createdAt: string;
  updatedAt: string;

  deliveryInfo: CheckoutDeliveryInput;

  user: {
    _id: string;
    name: string;
    email: string;
  };

  orderItems:  {
    product: {
      _id: string;
      name: string;
      price: number;
      slug: string;
      images: string[];
    };
    variant?: {
      _id: string;
      sku: string;
      price: number;
    };
    quantity: number;
    price: number;
  }[];
}



export function orderToAdminOrderResponse(
  order: AdminPopulatedOrder
): AdminOrderResponse {
  return {
    _id: String(order._id),

    totalPrice: order.totalPrice,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,

    paymentProof: order.paymentProof ?? undefined,
    codAdvance: order.codAdvance ?? 0,
    outsideKathmanduCharge: order.outsideKathmanduCharge ?? 0,

    stockProcessed: order.stockProcessed ?? false,
    totalSalesUpdated: order.totalSalesUpdated ?? false,

    deliveredAt: order.deliveredAt?.toISOString(),
    cancelledAt: order.cancelledAt?.toISOString(),
    expiresAt: order.expiresAt?.toISOString(),

    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),

    deliveryInfo: order.deliveryInfo,

    /* ---------------- USER (NULL SAFE) ---------------- */
    user: order.user
      ? {
          _id: String(order.user._id),
          name: order.user.name,
          email: order.user.email,
        }
      : {
          _id: "deleted",
          name: "Deleted User",
          email: "deleted@email.com",
        },

    /* ---------------- ITEMS (NULL SAFE) ---------------- */
    orderItems: order.orderItems.map((item) => ({
      quantity: item.quantity,
      price: item.price,

      product: {
        _id: item.product?._id
          ? String(item.product._id)
          : "deleted",

        name: item.product?.name || "Deleted Product",

        slug: item.product?.slug || "",

        price:
          item.product?.price ??
          item.price, // fallback to snapshot price

        images: item.product?.images || [],
      },

      variant: item.variant
        ? {
            _id: String(item.variant._id),
            sku: item.variant.sku,
            price: item.variant.price,
          }
        : undefined,
    })),
  };
}
