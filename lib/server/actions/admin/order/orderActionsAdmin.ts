"use server";

import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import { AdminPopulatedOrder, orderToAdminOrderResponse } from "@/lib/server/mappers/MapOrdersForAdmin";
import { Product } from "@/models";
import { IOrder, IOrderItem, Order } from "@/models/orderModel";
import userModel from "@/models/userModel";

import { FilterQuery, isValidObjectId, Types } from "mongoose";


export interface AdminGetOrdersQuery {
  page?: number;
  limit?: number;

  search?: string;

  paymentStatus?: "pending" | "submitted" | "paid" | "failed";
  orderStatus?: "pending" | "processing" | "delivered" | "cancelled" | "failed";
  paymentMethod?: "COD" | "OnlineUpload";

  minPrice?: number;
  maxPrice?: number;

  fromDate?: string;
  toDate?: string;

  sortBy?: "createdAt" | "totalPrice";
  sortOrder?: "asc" | "desc";
}

export async function getAllOrdersAdmin(query: AdminGetOrdersQuery) {
  try {
    await connectDB();
    await requireAdmin();

    const {
      page = 1,
      limit = 10,
      search,
      paymentStatus,
      orderStatus,
      paymentMethod,
      minPrice,
      maxPrice,
      fromDate,
      toDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const filter:  FilterQuery<IOrder> = {};

    /* ---------------- FILTERS ---------------- */

    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.totalPrice = {};
      if (minPrice !== undefined) filter.totalPrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.totalPrice.$lte = maxPrice;
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    /* ---------------- SEARCH ---------------- */
    if (search) {
      const trimmed = search.trim();

      if (Types.ObjectId.isValid(trimmed)) {
        filter._id = trimmed;
      } else {
        const users = await userModel.find({
          $or: [
            { name: { $regex: trimmed, $options: "i" } },
            { email: { $regex: trimmed, $options: "i" } },
          ],
        }).select("_id");

        if (users.length > 0) {
          filter.user = { $in: users.map(u => u._id) };
        } else {
          // No matching user → force empty result
          filter.user = null;
        }
      }
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("orderItems.product", "name price slug images")
      .populate("orderItems.variant", "sku price")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean<AdminPopulatedOrder[]>();

    const total = await Order.countDocuments(filter);

    const data = orders.map(orderToAdminOrderResponse);

    return {
      success: true,
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

  } catch (error) {
    console.error("ADMIN GET ALL ORDERS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch orders",
      data: [],
    };
  }
}


export interface AdminUpdateOrderInput {
  orderId: string;
  paymentStatus?: "pending" | "submitted" | "paid" | "failed";
  orderStatus?: "pending" | "processing" | "delivered" | "cancelled" | "failed";
}

export interface AdminUpdateOrderResult {
  success: boolean;
  message: string;
}

export async function adminUpdateOrderAction(
  input: AdminUpdateOrderInput
): Promise<AdminUpdateOrderResult> {
  try {
    await requireAdmin();

    const { orderId, paymentStatus, orderStatus } = input;

    if (!isValidObjectId(orderId)) {
      return { success: false, message: "Invalid order ID" };
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (order.orderStatus === "cancelled") {
      return { success: false, message: "Cannot modify cancelled order" };
    }

    if (order.orderStatus === "delivered" && orderStatus === "cancelled") {
      return { success: false, message: "Delivered order cannot be cancelled" };
    }

    /* ==========================
       PAYMENT STATUS UPDATE
    ========================== */

    const validTransitions: Record<string, string[]> = {
      pending: ["submitted", "failed"],
      submitted: ["paid", "failed"],
      failed: [],
      paid: [],
    };

    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      const currentStatus = order.paymentStatus;

      // Auto mark COD paid on delivery
      if (order.paymentMethod === "COD" && paymentStatus === "paid") {
        order.paymentStatus = "paid";
      }
      else if (!validTransitions[currentStatus].includes(paymentStatus)) {
        return { success: false, message: `Invalid payment transition from ${currentStatus} → ${paymentStatus}` };
      } else {
        order.paymentStatus = paymentStatus;
      }
    }

    /* ==========================
       ORDER STATUS UPDATE
    ========================== */
    if (orderStatus && orderStatus !== order.orderStatus) {
      if (orderStatus === "cancelled") {
        // Release reserved stock using bulkWrite
        await Product.bulkWrite(
          order.orderItems.map((item: IOrderItem) => ({
            updateOne: {
              filter: { _id: item.product },
              update: { $inc: { reservedStock: -item.quantity } },
            },
          }))
        );

        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();
      }

      else if (orderStatus === "processing") {
        order.orderStatus = "processing";
      }

      else if (orderStatus === "delivered") {
        if (order.stockProcessed) {
          return { success: false, message: "Stock already processed" };
        }

        // Update stock, reservedStock, and totalSales in bulk
        await Product.bulkWrite(
          order.orderItems.map((item: IOrderItem) => ({
            updateOne: {
              filter: { _id: item.product },
              update: {
                $inc: {
                  stock: -item.quantity,
                  reservedStock: -item.quantity,
                  totalSales: item.quantity, // ✅ update sales here
                },
              },
            },
          }))
        );

        order.stockProcessed = true;
        order.deliveredAt = new Date();
        order.orderStatus = "delivered";

        // Auto mark COD paid on delivery
        if (order.paymentMethod === "COD") {
          order.paymentStatus = "paid";
        }
      }

      else {
        return { success: false, message: "Invalid order status transition" };
      }
    }

    await order.save();

    return {
      success: true,
      message: "Order updated successfully",
    };

  } catch (error) {
    console.error("ADMIN UPDATE ORDER ERROR:", error);
    return {
      success: false,
      message: "Failed to update order",
    };
  }
}

// export async function adminUpdateOrderAction(
//   input: AdminUpdateOrderInput
// ): Promise<AdminUpdateOrderResult> {
//   try {
//     await requireAdmin();

//     const { orderId, paymentStatus, orderStatus } = input;

//     if (!isValidObjectId(orderId)) {
//       return { success: false, message: "Invalid order ID" };
//     }

//     const order = await Order.findById(orderId);

//     if (!order) {
//       return { success: false, message: "Order not found" };
//     }

//     if (order.orderStatus === "cancelled") {
//       return { success: false, message: "Cannot modify cancelled order" };
//     }

//     if (order.orderStatus === "delivered" && orderStatus === "cancelled") {
//       return { success: false, message: "Delivered order cannot be cancelled" };
//     }

//     /* ==========================
//        PAYMENT STATUS UPDATE
//     ========================== */

//     if (paymentStatus && paymentStatus !== order.paymentStatus) {
//       if (order.paymentStatus === "paid") {
//         return { success: false, message: "Paid orders cannot change payment status" };
//       }

//       if (order.paymentStatus === "submitted" && paymentStatus === "paid") {
//         order.paymentStatus = "paid";
//       } else if (order.paymentStatus === "submitted" && paymentStatus === "failed") {
//         order.paymentStatus = "failed";
//       } else if (order.paymentMethod === "COD" && paymentStatus === "paid") {
//         order.paymentStatus = "paid";
//       } else {
//         return { success: false, message: "Invalid payment transition" };
//       }
//     }

//     /* ==========================
//        ORDER STATUS UPDATE
//     ========================== */

//     if (orderStatus && orderStatus !== order.orderStatus) {
//       if (orderStatus === "cancelled") {
//         // Release reserved stock
//         for (const item of order.orderItems) {
//           const product = await Product.findById(item.product);
//           if (!product) continue;

//           product.reservedStock = Math.max(
//             0,
//             (product.reservedStock || 0) - item.quantity
//           );

//           await product.save();
//         }

//         order.orderStatus = "cancelled";
//         order.cancelledAt = new Date();
//       }

//       else if (orderStatus === "processing") {
//         order.orderStatus = "processing";
//       }

//       else if (orderStatus === "delivered") {
//         if (order.stockProcessed) {
//           return { success: false, message: "Stock already processed" };
//         }

//         for (const item of order.orderItems) {
//           const product = await Product.findById(item.product);
//           if (!product) continue;

//           product.stock -= item.quantity;
//           product.reservedStock = Math.max(
//             0,
//             (product.reservedStock || 0) - item.quantity
//           );

//           await product.save();
//         }

//         order.stockProcessed = true;
//         order.deliveredAt = new Date();
//         order.orderStatus = "delivered";

//         // Auto mark COD paid on delivery
//         if (order.paymentMethod === "COD") {
//           order.paymentStatus = "paid";
//         }
//       }

//       else {
//         return { success: false, message: "Invalid order status transition" };
//       }
//     }

//     await order.save();

//     return {
//       success: true,
//       message: "Order updated successfully",
//     };

//   } catch (error) {
//     console.error("ADMIN UPDATE ORDER ERROR:", error);
//     return {
//       success: false,
//       message: "Failed to update order",
//     };
//   }
// }



// "use server";

// import { connectDB } from "@/db";
// import { requireAdmin } from "@/lib/auth/requireSession";
// import { AdminPopulatedOrder, orderToAdminOrderResponse } from "@/lib/server/mappers/MapOrdersForAdmin";
// import { Product } from "@/models";
// import { IOrder, Order } from "@/models/orderModel";
// import userModel from "@/models/userModel";


// import { FilterQuery, isValidObjectId, Types } from "mongoose";


// export interface AdminGetOrdersQuery {
//   page?: number;
//   limit?: number;

//   search?: string;

//   paymentStatus?: "pending" | "submitted" | "paid" | "failed";
//   orderStatus?: "pending" | "processing" | "delivered" | "cancelled" | "failed";
//   paymentMethod?: "COD" | "OnlineUpload";

//   minPrice?: number;
//   maxPrice?: number;

//   fromDate?: string;
//   toDate?: string;

//   sortBy?: "createdAt" | "totalPrice";
//   sortOrder?: "asc" | "desc";
// }

// export async function getAllOrdersAdmin(query: AdminGetOrdersQuery) {
//   try {
//     await connectDB();
//     await requireAdmin();

//     const {
//       page = 1,
//       limit = 10,
//       search,
//       paymentStatus,
//       orderStatus,
//       paymentMethod,
//       minPrice,
//       maxPrice,
//       fromDate,
//       toDate,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//     } = query;

//     const filter: FilterQuery<IOrder> = {};

//     /* ---------------- FILTERS ---------------- */

//     if (paymentStatus) filter.paymentStatus = paymentStatus;
//     if (orderStatus) filter.orderStatus = orderStatus;
//     if (paymentMethod) filter.paymentMethod = paymentMethod;

//     if (minPrice !== undefined || maxPrice !== undefined) {
//       filter.totalPrice = {};
//       if (minPrice !== undefined) filter.totalPrice.$gte = minPrice;
//       if (maxPrice !== undefined) filter.totalPrice.$lte = maxPrice;
//     }

//     if (fromDate || toDate) {
//       filter.createdAt = {};
//       if (fromDate) filter.createdAt.$gte = new Date(fromDate);
//       if (toDate) filter.createdAt.$lte = new Date(toDate);
//     }

//     /* ---------------- SEARCH ---------------- */
//     if (search) {
//       const trimmed = search.trim();

//       if (Types.ObjectId.isValid(trimmed)) {
//         filter._id = trimmed;
//       } else {
//         const users = await userModel.find({
//           $or: [
//             { name: { $regex: trimmed, $options: "i" } },
//             { email: { $regex: trimmed, $options: "i" } },
//           ],
//         }).select("_id");

//         if (users.length > 0) {
//           filter.user = { $in: users.map((u) => u._id) };
//         } else {
//           // No matching user → force empty result
//           filter.user = null;
//         }
//       }
//     }

//     const skip = (page - 1) * limit;

//     const orders = await Order.find(filter)
//       .populate("user", "name email")
//       .populate("orderItems.product", "name price slug images")
//       .populate("orderItems.variant", "sku price")
//       .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean<AdminPopulatedOrder[]>();

//     const total = await Order.countDocuments(filter);

//     // Filter out orders with all deleted products
//     const validOrders = orders
//       .map((order) => {
//         // Filter out order items where product is null (deleted)
//         const validOrderItems = order.orderItems.filter(
//           (item) => item.product !== null
//         );

//         // If all products in the order are deleted, skip this order
//         if (validOrderItems.length === 0) {
//           return null;
//         }

//         // Return order with only valid items
//         return {
//           ...order,
//           orderItems: validOrderItems,
//         };
//       })
//       .filter((order): order is AdminPopulatedOrder => order !== null);

//     const data = validOrders.map(orderToAdminOrderResponse);

//     return {
//       success: true,
//       data,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     };
//   } catch (error) {
//     console.error("ADMIN GET ALL ORDERS ERROR:", error);
//     return {
//       success: false,
//       message: "Failed to fetch orders",
//       data: [],
//     };
//   }
// }


// export interface AdminUpdateOrderInput {
//   orderId: string;
//   paymentStatus?: "pending" | "submitted" | "paid" | "failed";
//   orderStatus?: "pending" | "processing" | "delivered" | "cancelled" | "failed";
// }

// export interface AdminUpdateOrderResult {
//   success: boolean;
//   message: string;
// }

// export async function adminUpdateOrderAction(
//   input: AdminUpdateOrderInput
// ): Promise<AdminUpdateOrderResult> {
//   try {
//     await requireAdmin();

//     const { orderId, paymentStatus, orderStatus } = input;

//     if (!isValidObjectId(orderId)) {
//       return { success: false, message: "Invalid order ID" };
//     }

//     const order = await Order.findById(orderId);

//     if (!order) {
//       return { success: false, message: "Order not found" };
//     }

//     if (order.orderStatus === "cancelled") {
//       return { success: false, message: "Cannot modify cancelled order" };
//     }

//     if (order.orderStatus === "delivered" && orderStatus === "cancelled") {
//       return { success: false, message: "Delivered order cannot be cancelled" };
//     }

//     /* ==========================
//        PAYMENT STATUS UPDATE
//     ========================== */

//     if (paymentStatus && paymentStatus !== order.paymentStatus) {
//       if (order.paymentStatus === "paid") {
//         return { success: false, message: "Paid orders cannot change payment status" };
//       }

//       if (order.paymentStatus === "submitted" && paymentStatus === "paid") {
//         order.paymentStatus = "paid";
//       } else if (order.paymentStatus === "submitted" && paymentStatus === "failed") {
//         order.paymentStatus = "failed";
//       } else if (order.paymentMethod === "COD" && paymentStatus === "paid") {
//         order.paymentStatus = "paid";
//       } else {
//         return { success: false, message: "Invalid payment transition" };
//       }
//     }

//     /* ==========================
//        ORDER STATUS UPDATE
//     ========================== */

//     if (orderStatus && orderStatus !== order.orderStatus) {
//       if (orderStatus === "cancelled") {
//         // Release reserved stock
//         for (const item of order.orderItems) {
//           const product = await Product.findById(item.product);
//           if (!product) continue;

//           product.reservedStock = Math.max(
//             0,
//             (product.reservedStock || 0) - item.quantity
//           );

//           await product.save();
//         }

//         order.orderStatus = "cancelled";
//         order.cancelledAt = new Date();
//       } else if (orderStatus === "processing") {
//         order.orderStatus = "processing";
//       } else if (orderStatus === "delivered") {
//         if (order.stockProcessed) {
//           return { success: false, message: "Stock already processed" };
//         }

//         for (const item of order.orderItems) {
//           const product = await Product.findById(item.product);
//           if (!product) continue;

//           product.stock -= item.quantity;
//           product.reservedStock = Math.max(
//             0,
//             (product.reservedStock || 0) - item.quantity
//           );

//           await product.save();
//         }

//         order.stockProcessed = true;
//         order.deliveredAt = new Date();
//         order.orderStatus = "delivered";

//         // Auto mark COD paid on delivery
//         if (order.paymentMethod === "COD") {
//           order.paymentStatus = "paid";
//         }
//       } else {
//         return { success: false, message: "Invalid order status transition" };
//       }
//     }

//     await order.save();

//     return {
//       success: true,
//       message: "Order updated successfully! ✅",
//     };
//   } catch (error) {
//     console.error("ADMIN UPDATE ORDER ERROR:", error);
//     return {
//       success: false,
//       message: "Failed to update order. Please try again.",
//     };
//   }
// }