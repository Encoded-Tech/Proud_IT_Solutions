"use server";

import { Order } from "@/models/orderModel";
import { requireUser } from "@/lib/auth/requireSession";
import { orderToOrderResponse } from "../mappers/queries/orderToOrderResponse";
import { Types } from "mongoose";
import { CheckoutDeliveryInput } from "../actions/public/order/orderActions";


/* -------------------------------- TYPES -------------------------------- */

export type PaymentStatus = "pending" | "submitted" | "paid" | "failed";
export type OrderStatus = "pending" | "processing" | "delivered" | "cancelled" | "failed";
export type PaymentMethod = "COD" | "OnlineUpload";

export interface PopulatedOrderItem {
  product: {
    _id: Types.ObjectId;
    name: string;
    price: number;
    slug: string;
    images: string[];
  };
  variant?: {
    _id: Types.ObjectId;
    sku: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface PopulatedOrder {
  _id: Types.ObjectId;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryInfo: CheckoutDeliveryInput;
  createdAt: Date;
  updatedAt: Date;
  orderItems: PopulatedOrderItem[];
}

export interface OrderResponse {
  _id: string;
  orderItems: {
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
  totalPrice: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryInfo: CheckoutDeliveryInput;
  createdAt: string;
  updatedAt: string;
}

export interface GetMyOrdersResult {
  success: boolean;
  message: string;
  data: OrderResponse[];

}

export interface GetMySingleOrderResult {
  success: boolean;
  message: string;
  data?: OrderResponse;
}

/* ----------------------------- FETCHERS ----------------------------- */

/**
 * Fetch all orders for the current user
 */
export async function getMyOrders(): Promise<GetMyOrdersResult> {
  try {
    const user = await requireUser();

    const orders = await Order.find({ user: user.id })
      .populate({
        path: "orderItems.product",
        select: "name price images slug",
      })
      .populate({
        path: "orderItems.variant",
        select: "sku price",
      })
      .sort({ createdAt: -1 }).lean<PopulatedOrder[]>();

    if (!orders || orders.length === 0) {
      return {
        success: false,
        message: "No orders found",
        data: [],
      };
    }

    // Map Mongo orders -> OrderResponse
      const data = orders.map(orderToOrderResponse);


    return {
      success: true,
      message: "Orders fetched successfully",
      data,
      
    };
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      message: "Failed to fetch orders",
      data: [],
    };
  }
}

/**
 * Fetch a single order by ID for the current user
 */
export async function getMySingleOrder(orderId: string): Promise<GetMySingleOrderResult> {
  try {
    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return {
        success: false,
        message: "Invalid order ID",
      };
    }

    const user = await requireUser();

    const order = await Order.findOne({ _id: orderId, user: user.id })
      .populate({
        path: "orderItems.product",
        select: "name price images slug",
      })
      .populate({
        path: "orderItems.variant",
        select: "sku price",
      }).lean<PopulatedOrder>();

    if (!order) {
      return {
        success: false,
        message: "Order not found or you don't have access",
      };
    }

    const data = orderToOrderResponse(order);

    return {
      success: true,
      message: "Order fetched successfully",
      data,
    };
  } catch (error) {
    console.error("GET MY SINGLE ORDER ERROR:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      message: "Failed to fetch order",
    };
  }
}


export async function getMyOrderCount() {
  const user = await requireUser();
  const orderCount = await Order.countDocuments({ user: user.id });

  return {

    orderCount,
  };
}


