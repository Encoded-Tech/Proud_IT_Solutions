"use server";

import { isValidObjectId, Types } from "mongoose";
import { IOrderItem, Order } from "@/models/orderModel";
import { Product } from "@/models/productModel";
import userModel from "@/models/userModel";
import { IProductVariant } from "@/models/productVariantsModel";

import { sendEmail } from "@/lib/helpers/sendEmail";
import { MIN_QTY_PER_ITEM, ORDER_EXPIRY_HOURS } from "@/config/env";
import { requireUser } from "@/lib/auth/requireSession";
import { BuildRequest } from "@/models/buildMyPcModel";

/* -------------------------------- TYPES -------------------------------- */

export interface UpdateOrderInput {
    deliveryInfo?: {
        name: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
        instructions?: string;
    };
    paymentMethod?: "COD" | "OnlineUpload";
}

export interface UpdateOrderResult {
    success: boolean;
    message: string;
}


export interface CheckoutItemInput {
    product: string;
    variant?: string;
    quantity: number;
}

export interface CheckoutDeliveryInput {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    instructions?: string;
}



export interface CreateOrderInput {
    items: CheckoutItemInput[];
    deliveryInfo: CheckoutDeliveryInput;
    paymentMethod: "COD" | "OnlineUpload";
    source: "cart" | "buy_now" | "build";
    buildId?: string; // 👈 NEW
}



export interface CreateOrderResult {
    success: boolean;
    message: string;
    orderId?: string;
}

export interface DeleteOrderResult {
    success: boolean;
    message: string;
}


export interface CancelOrderResult {
    success: boolean;
    message: string;
}
//user server actions

// export async function createOrderAction(
//     input: CreateOrderInput
// ): Promise<CreateOrderResult> {
//     try {
//         /* -------------------- AUTH -------------------- */
//         const user = await requireUser();


//        const { items, deliveryInfo, paymentMethod, source } = input;


//         /* -------------------- VALIDATION -------------------- */

//         if (!items || items.length === 0) {
//             return { success: false, message: "Cart is empty" };
//         }

//         if (!["COD", "OnlineUpload"].includes(paymentMethod)) {
//             return { success: false, message: "Invalid payment method" };
//         }

//         const requiredDeliveryFields = [
//             deliveryInfo?.name,
//             deliveryInfo?.phone,
//             deliveryInfo?.address,
//             deliveryInfo?.city,
//             deliveryInfo?.postalCode,
//             deliveryInfo?.country,
//         ];

//         if (requiredDeliveryFields.some((f) => !f)) {
//             return { success: false, message: "Incomplete delivery information" };
//         }


    

//         /* -------------------- PREVENT DUPLICATE PENDING ORDERS -------------------- */

//         //     const pendingOrders = await Order.find({
//         //   user: user.id,
//         //   paymentStatus: "pending",
//         //   expiresAt: { $gt: new Date() },
//         // });

//         // const hasDuplicateItem = pendingOrders.some(order =>
//         //   order.orderItems.some((existingItem: IOrderItem) =>
//         //     items.some(newItem =>
//         //       String(existingItem.product) === newItem.product &&
//         //       String(existingItem.variant || "") === (newItem.variant || "")
//         //     )
//         //   )
//         // );

//         // if (hasDuplicateItem) {
//         //   return {
//         //     success: false,
//         //     message: "You already have a pending order for one or more items in your cart",
//         //   };
//         // }

//         const pendingOrders = await Order.find({
//             user: user.id,
//             paymentStatus: "pending",
//                orderStatus: { $ne: "cancelled" },
//             expiresAt: { $gt: new Date() },
//         });

//         const normalizeItems = (items: CheckoutItemInput[]) =>
//             items
//                 .map(i => `${i.product}_${i.variant || "no-variant"}_${i.quantity}`)
//                 .sort()
//                 .join("|");

//         const newOrderSignature = normalizeItems(items);

//         const isExactDuplicate = pendingOrders.some(order => {
//             const existingSignature = normalizeItems(
//                 order.orderItems.map((i: IOrderItem) => ({
//                     product: String(i.product),
//                     variant: i.variant ? String(i.variant) : undefined,
//                     quantity: i.quantity,
//                 }))
//             );

//             return existingSignature === newOrderSignature;
//         });

//         if (isExactDuplicate) {
//             return {
//                 success: false,
//                 message: "You already placed this exact order and it is still pending",
//             };
//         }

//         /* -------------------- PRICE + STOCK CALCULATION -------------------- */

//         let totalPrice = 0;
//         const orderItems: IOrderItem[] = [];

//         for (const item of items) {
//             const { product: productId, variant: variantId, quantity } = item;

//             if (!Number.isInteger(quantity) || quantity < MIN_QTY_PER_ITEM) {
//                 return {
//                     success: false,
//                     message: "Invalid quantity in cart",
//                 };
//             }

//             const product = await Product.findById(productId).populate({
//                 path: "variants",
//                 match: { isActive: true },
//                 select: "sku price",
//             });

//             if (!product || !product.isActive) {
//                 return {
//                     success: false,
//                     message: "One or more products are unavailable",
//                 };
//             }

//             const availableStock =
//                 product.stock - (product.reservedStock || 0);

//             if (availableStock < quantity) {
//                 return {
//                     success: false,
//                     message: `Not enough stock for ${product.name}`,
//                 };
//             }

//             let correctPrice = product.price;

//             if (variantId) {
//                 const variant = product.variants.find(
//                     (v: IProductVariant) => String(v._id) === variantId
//                 );

//                 if (!variant) {
//                     return {
//                         success: false,
//                         message: `Invalid variant for ${product.name}`,
//                     };
//                 }

//                 correctPrice = variant.price;
//             }

//             totalPrice += correctPrice * quantity;

//             /* Reserve stock */
//             product.reservedStock =
//                 (product.reservedStock || 0) + quantity;
//             await product.save();

//             orderItems.push({
//                 product: product._id,
//                 variant: variantId ? new Types.ObjectId(variantId) : undefined,
//                 quantity,
//                 price: correctPrice,
//             });
//         }

//         /* -------------------- CREATE ORDER -------------------- */

//         const expiresAt = new Date(
//             Date.now() + ORDER_EXPIRY_HOURS * 60 * 60 * 1000
//         );

//         const order = await Order.create({
//             user: user.id,
//             orderItems,
//             totalPrice,
//             paymentMethod,
//             paymentStatus: "pending",
//             orderStatus: "pending",
//             deliveryInfo,
//             expiresAt,
//         });

//         if (source === "cart") {
//             await userModel.findByIdAndUpdate(user.id, {
//                 $set: { cart: [] },
//             });
//         }

//         /* -------------------- EMAIL -------------------- */
//         try {
//             const dbUser = await userModel
//                 .findById(user.id)
//                 .select("email name");

//             if (dbUser?.email) {
//                 await sendEmail({
//                     to: dbUser.email,
//                     subject: "Order Placed Successfully",
//                     html: `
//         <h2>Hi ${dbUser.name},</h2>
//         <p>Your order has been placed successfully.</p>
//         <p><strong>Order ID:</strong> ${order._id}</p>
//         <p><strong>Total:</strong> Rs. ${totalPrice}</p>
//       `,
//                 });
//             }
//         } catch (emailError) {
//             console.error("EMAIL FAILED (order still created):", emailError);
//         }

//         return {
//             success: true,
//             message: "Order placed successfully! 🎉",
//             orderId: String(order._id),
//         };
//     } catch (error) {
//         console.error(
//             "CREATE ORDER ERROR:",
//             error instanceof Error ? error.message : error
//         );

//         return {
//             success: false,
//             message: "Failed to place order",
//         };
//     }
// }

export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  try {
    /* -------------------- AUTH -------------------- */
    const user = await requireUser();

    const {
      items,
      deliveryInfo,
      paymentMethod,
      source,
      buildId,
    } = input;

    /* -------------------- VALIDATION -------------------- */

    if (!items || items.length === 0) {
      return { success: false, message: "Cart is empty" };
    }

    if (!["COD", "OnlineUpload"].includes(paymentMethod)) {
      return { success: false, message: "Invalid payment method" };
    }

    const requiredDeliveryFields = [
      deliveryInfo?.name,
      deliveryInfo?.phone,
      deliveryInfo?.address,
      deliveryInfo?.city,
      deliveryInfo?.postalCode,
      deliveryInfo?.country,
    ];

    if (requiredDeliveryFields.some((f) => !f)) {
      return { success: false, message: "Incomplete delivery information" };
    }

    /* -------------------- BUILD SOURCE VALIDATION -------------------- */
    let buildRequest = null;
if (source === "build") {
  if (!buildId || !isValidObjectId(buildId)) {
    return { success: false, message: "Invalid build request" };
  }

  buildRequest = await BuildRequest.findOne({
    _id: buildId,
    user: user.id,
  });

  if (!buildRequest) {
    return { success: false, message: "Build request not found" };
  }

  if (buildRequest.status !== "approved") {
    return {
      success: false,
      message: "This build must be approved before checkout",
    };
  }

  if (buildRequest.checkoutOrder) {
    return {
      success: false,
      message: "This build has already been checked out",
    };
  }
}


    /* -------------------- PREVENT DUPLICATE PENDING ORDERS -------------------- */

    const pendingOrders = await Order.find({
      user: user.id,
      paymentStatus: "pending",
      orderStatus: { $ne: "cancelled" },
      expiresAt: { $gt: new Date() },
    });

    const normalizeItems = (items: CheckoutItemInput[]) =>
      items
        .map(
          (i) =>
            `${i.product}_${i.variant || "no-variant"}_${i.quantity}`
        )
        .sort()
        .join("|");

    const newOrderSignature = normalizeItems(items);

    const isExactDuplicate = pendingOrders.some((order) => {
      const existingSignature = normalizeItems(
        order.orderItems.map((i: IOrderItem) => ({
          product: String(i.product),
          variant: i.variant ? String(i.variant) : undefined,
          quantity: i.quantity,
        }))
      );
      return existingSignature === newOrderSignature;
    });

    if (isExactDuplicate) {
      return {
        success: false,
        message: "You already placed this exact order and it is still pending",
      };
    }

    /* -------------------- PRICE + STOCK CALCULATION -------------------- */

    let totalPrice = 0;
    const orderItems: IOrderItem[] = [];

    for (const item of items) {
      const { product: productId, variant: variantId, quantity } = item;

      if (!Number.isInteger(quantity) || quantity < MIN_QTY_PER_ITEM) {
        return {
          success: false,
          message: "Invalid quantity in cart",
        };
      }

      const product = await Product.findById(productId).populate({
        path: "variants",
        match: { isActive: true },
        select: "sku price",
      });

      if (!product || !product.isActive) {
        return {
          success: false,
          message: "One or more products are unavailable",
        };
      }

      const availableStock =
        product.stock - (product.reservedStock || 0);

      if (availableStock < quantity) {
        return {
          success: false,
          message: `Not enough stock for ${product.name}`,
        };
      }

      let correctPrice = product.price;

      if (variantId) {
        const variant = product.variants.find(
          (v: IProductVariant) => String(v._id) === variantId
        );

        if (!variant) {
          return {
            success: false,
            message: `Invalid variant for ${product.name}`,
          };
        }

        correctPrice = variant.price;
      }

      totalPrice += correctPrice * quantity;

      product.reservedStock =
        (product.reservedStock || 0) + quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        variant: variantId
          ? new Types.ObjectId(variantId)
          : undefined,
        quantity,
        price: correctPrice,
      });
    }

    /* -------------------- CREATE ORDER -------------------- */

    const expiresAt = new Date(
      Date.now() + ORDER_EXPIRY_HOURS * 60 * 60 * 1000
    );

    const order = await Order.create({
      user: user.id,
      orderItems,
      totalPrice,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      deliveryInfo,
      expiresAt,
      source,
      buildRequest: source === "build" ? buildId : undefined,
    });

    /* -------------------- LINK BUILD → ORDER -------------------- */
    if (source === "build" && buildRequest) {
      buildRequest.checkoutOrder = order._id;
      buildRequest.status = "checked_out";
      await buildRequest.save();
    }

    if (source === "cart") {
      await userModel.findByIdAndUpdate(user.id, {
        $set: { cart: [] },
      });
    }

    /* -------------------- EMAIL -------------------- */
    try {
      const dbUser = await userModel
        .findById(user.id)
        .select("email name");

      if (dbUser?.email) {
        await sendEmail({
          to: dbUser.email,
          subject: "Order Placed Successfully",
          html: `
            <h2>Hi ${dbUser.name},</h2>
            <p>Your order has been placed successfully.</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total:</strong> Rs. ${totalPrice}</p>
          `,
        });
      }
    } catch (emailError) {
      console.error("EMAIL FAILED (order still created):", emailError);
    }

    return {
      success: true,
      message: "Order placed successfully! 🎉",
      orderId: String(order._id),
    };
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error instanceof Error ? error.message : error
    );

    return {
      success: false,
      message: "Failed to place order",
    };
  }
}


export async function updateOrderAction(
    orderId: string,
    input: UpdateOrderInput
): Promise<UpdateOrderResult> {
    try {
        /* -------------------- AUTH -------------------- */
        const user = await requireUser();

        if (!Types.ObjectId.isValid(orderId)) {
            return { success: false, message: "Invalid order ID" };
        }

        /* -------------------- FIND ORDER -------------------- */
        const order = await Order.findOne({
            _id: orderId,
            user: user.id,
        });

        if (!order) {
            return { success: false, message: "Order not found" };
        }

        /* -------------------- STRICT MUTATION RULES -------------------- */
        if (
            order.paymentStatus !== "pending" ||
            order.orderStatus !== "pending"
        ) {
            return {
                success: false,
                message: "Order can no longer be modified",
            };
        }

        const { deliveryInfo, paymentMethod } = input;

        /* -------------------- UPDATE DELIVERY INFO -------------------- */
        if (deliveryInfo) {
            const requiredFields = [
                deliveryInfo.name,
                deliveryInfo.phone,
                deliveryInfo.address,
                deliveryInfo.city,
                deliveryInfo.postalCode,
                deliveryInfo.country,
            ];

            if (requiredFields.some((f) => !f)) {
                return {
                    success: false,
                    message: "Incomplete delivery information",
                };
            }

            order.deliveryInfo = deliveryInfo;
        }

        /* -------------------- UPDATE PAYMENT METHOD -------------------- */
        if (paymentMethod) {
            if (!["COD", "OnlineUpload"].includes(paymentMethod)) {
                return {
                    success: false,
                    message: "Invalid payment method",
                };
            }

            if (order.paymentStatus !== "pending") {
                return {
                    success: false,
                    message: "Payment already initiated",
                };
            }

            order.paymentMethod = paymentMethod;
        }

        await order.save();

        /* -------------------- EMAIL -------------------- */
        const dbUser = await userModel.findById(user.id).select("email name");

        if (dbUser?.email) {
            await sendEmail({
                to: dbUser.email,
                subject: "Order Updated",
                html: `
          <h2>Hi ${dbUser.name},</h2>
          <p>Your order has been updated successfully.</p>
          <p><strong>Order ID:</strong> ${order._id}</p>
        `,
            });
        }

        return {
            success: true,
            message: "Order updated successfully",
        };
    } catch (error) {
        console.error(
            "UPDATE ORDER ERROR:",
            error instanceof Error ? error.message : error
        );

        return {
            success: false,
            message: "Failed to update order",
        };
    }
}

export async function deleteOrderAction(
    orderId: string
): Promise<DeleteOrderResult> {
    try {
        /* -------------------- AUTH -------------------- */
        const user = await requireUser();

        if (!Types.ObjectId.isValid(orderId)) {
            return { success: false, message: "Invalid order ID" };
        }

        /* -------------------- FIND ORDER -------------------- */
        const order = await Order.findOne({
            _id: orderId,
            user: user.id,
        });

        if (!order) {
            return { success: false, message: "Order not found" };
        }

        /* -------------------- SAFETY CHECKS -------------------- */
        if (order.paymentStatus !== "pending") {
            return {
                success: false,
                message: "Only pending orders can be deleted",
            };
        }

        /* -------------------- RESTORE RESERVED STOCK -------------------- */
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);

            if (!product) continue;

            product.reservedStock = Math.max(
                0,
                (product.reservedStock || 0) - item.quantity
            );

            await product.save();
        }

        /* -------------------- DELETE ORDER -------------------- */
        await Order.deleteOne({ _id: order._id });

        /* -------------------- EMAIL -------------------- */
        const dbUser = await userModel.findById(user.id).select("email name");

        if (dbUser?.email) {
            await sendEmail({
                to: dbUser.email,
                subject: "Order Deleted",
                html: `
          <h2>Hi ${dbUser.name},</h2>
          <p>Your pending order has been deleted successfully.</p>
          <p><strong>Order ID:</strong> ${order._id}</p>
        `,
            });
        }

        return {
            success: true,
            message: "Order deleted successfully",
        };
    } catch (error) {
        console.error(
            "DELETE ORDER ERROR:",
            error instanceof Error ? error.message : error
        );

        return {
            success: false,
            message: "Failed to delete order",
        };
    }
}

export async function cancelOrderAction(
    orderId: string
): Promise<CancelOrderResult> {
    try {
        /* -------------------- AUTH -------------------- */
        const user = await requireUser();

        if (!Types.ObjectId.isValid(orderId)) {
            return { success: false, message: "Invalid order ID" };
        }

        /* -------------------- FIND ORDER -------------------- */
        const order = await Order.findOne({
            _id: orderId,
            user: user.id,
        });

        if (!order) {
            return { success: false, message: "Order not found" };
        }

        /* -------------------- SAFETY CHECKS -------------------- */
        if (order.paymentStatus !== "pending") {
            return {
                success: false,
                message: "Paid orders cannot be cancelled",
            };
        }

        if (order.orderStatus !== "pending") {
            return {
                success: false,
                message: "Order cannot be cancelled",
            };
        }

        /* -------------------- RESTORE RESERVED STOCK -------------------- */
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);

            if (!product) continue;

            product.reservedStock = Math.max(
                0,
                (product.reservedStock || 0) - item.quantity
            );

            await product.save();
        }

        /* -------------------- CANCEL ORDER -------------------- */
        order.orderStatus = "cancelled";
        order.paymentStatus = "failed"; // or "cancelled" if you use it
        order.expiresAt = new Date(); // immediately expire

        await order.save();

        const dbUser = await userModel.findById(user.id).select("email name");

        if (dbUser?.email) {
            await sendEmail({
                to: dbUser.email,
                subject: "Order Cancelled",
                html: `
      <h2>Hi ${dbUser.name},</h2>
      <p>Your order has been cancelled successfully.</p>
      <p><strong>Order ID:</strong> ${order._id}</p>
    `,
            });
        }

        return {
            success: true,
            message: "Order cancelled successfully",
        };
    } catch (error) {
        console.error("CANCEL ORDER ERROR:", error);
        return {
            success: false,
            message: "Failed to cancel order",
        };
    }
}


//admin server actions
