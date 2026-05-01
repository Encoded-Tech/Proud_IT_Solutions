"use server";

import { isValidObjectId, Types } from "mongoose";
import { IOrderItem, Order } from "@/models/orderModel";
import { Product } from "@/models/productModel";
import userModel from "@/models/userModel";
import { IProductVariant } from "@/models/productVariantsModel";

import { sendEmail } from "@/lib/helpers/sendEmail";
import {
  ALLOWED_EXT_FOR_PAYMENT_PROOF,
  ALLOWED_MIME_TYPE_FOR_PAYMENT_PROOF,
  MAX_SIZE_FOR_PAYMENT_PROOF,
  MIN_QTY_PER_ITEM,
  ORDER_EXPIRY_HOURS,
} from "@/config/env";
import { requireUser } from "@/lib/auth/requireSession";
import { resolveAuthUserId } from "@/lib/auth/resolveAuthUser";
import { BuildRequest } from "@/models/buildMyPcModel";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";

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
  paymentProof?: File | null; // optional new screenshot
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
  paymentProof?: File | null;
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

function validatePaymentProof(file: File | null | undefined) {
  if (!file) {
    return { valid: false, message: "Payment screenshot is required" };
  }

  const ext = file.name.toLowerCase().split(".").pop();
  if (!ext || !ALLOWED_EXT_FOR_PAYMENT_PROOF.includes(ext)) {
    return {
      valid: false,
      message: `Invalid file type. Allowed: ${ALLOWED_EXT_FOR_PAYMENT_PROOF.join(", ")}`,
    };
  }

  if (file.size > MAX_SIZE_FOR_PAYMENT_PROOF) {
    return {
      valid: false,
      message: "File too large. Max size 5MB.",
    };
  }

  if (!ALLOWED_MIME_TYPE_FOR_PAYMENT_PROOF.includes(file.type)) {
    return {
      valid: false,
      message: "Invalid file format",
    };
  }

  return { valid: true, message: "" };
}

/* -------------------------------------------------------------------------- */
/*                            CREATE ORDER ACTION                             */
/* -------------------------------------------------------------------------- */

export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  let uploadedProof: string | null = null;

  try {
    /* -------------------- AUTH -------------------- */
    const user = await requireUser();
    const userId = await resolveAuthUserId(user);
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const {
      items,
      deliveryInfo,
      paymentMethod,
      source,
      buildId,
      paymentProof,
    } = input;

    /* -------------------- VALIDATION -------------------- */

    if (!items || items.length === 0) {
      return { success: false, message: "Cart is empty" };
    }

    if (!["COD", "OnlineUpload"].includes(paymentMethod)) {
      return { success: false, message: "Invalid payment method" };
    }

    /* ---------- Payment screenshot required ---------- */
    if (!paymentProof) {
      return {
        success: false,
        message:
          paymentMethod === "COD"
            ? "COD advance payment receipt is required"
            : "Payment screenshot is required",
      };
    }

    const paymentProofValidation = validatePaymentProof(paymentProof);
    if (!paymentProofValidation.valid) {
      return {
        success: false,
        message: paymentProofValidation.message,
      };
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
      return {
        success: false,
        message: "Incomplete delivery information",
      };
    }

    /* -------------------- BUILD SOURCE VALIDATION -------------------- */

    let buildRequest = null;

    if (source === "build") {
      if (!buildId || !isValidObjectId(buildId)) {
        return {
          success: false,
          message: "Invalid build request",
        };
      }

      buildRequest = await BuildRequest.findOne({
        _id: buildId,
        user: userId,
      });

      if (!buildRequest) {
        return {
          success: false,
          message: "Build request not found",
        };
      }

      if (buildRequest.status !== "approved") {
        return {
          success: false,
          message:
            "This build must be approved before checkout",
        };
      }

      if (buildRequest.checkoutOrder) {
        return {
          success: false,
          message:
            "This build has already been checked out",
        };
      }
    }

    /* -------------------- DUPLICATE ORDER CHECK -------------------- */

    const pendingOrders = await Order.find({
      user: userId,
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
          variant: i.variant
            ? String(i.variant)
            : undefined,
          quantity: i.quantity,
        }))
      );
      return (
        existingSignature === newOrderSignature
      );
    });

    if (isExactDuplicate) {
      return {
        success: false,
        message:
          "You already placed this exact order and it is still pending",
      };
    }

    /* -------------------- PRICE + STOCK -------------------- */

    let totalPrice = 0;
    const orderItems: IOrderItem[] = [];

    for (const item of items) {
      const { product: productId, variant, quantity } =
        item;

      if (
        !Number.isInteger(quantity) ||
        quantity < MIN_QTY_PER_ITEM
      ) {
        return {
          success: false,
          message: "Invalid quantity in cart",
        };
      }

      const product = await Product.findById(
        productId
      ).populate({
        path: "variants",
        match: { isActive: true },
        select: "sku price",
      });

      if (!product || !product.isActive) {
        return {
          success: false,
          message:
            "One or more products are unavailable",
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

      if (variant) {
        const foundVariant =
          product.variants.find(
            (v: IProductVariant) =>
              String(v._id) === variant
          );

        if (!foundVariant) {
          return {
            success: false,
            message: `Invalid variant for ${product.name}`,
          };
        }

        correctPrice = foundVariant.price;
      }

      totalPrice += correctPrice * quantity;

      product.reservedStock =
        (product.reservedStock || 0) + quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        variant: variant
          ? new Types.ObjectId(variant)
          : undefined,
        quantity,
        price: correctPrice,
      });
    }

    /* -------------------- DELIVERY CHARGES -------------------- */

      let outsideKathmanduCharge = 0;

      // List of cities inside Kathmandu Valley
      const ktmValleyCities = ["kathmandu", "bhaktapur", "lalitpur"];

      if (
        !ktmValleyCities.includes(
          deliveryInfo.city.toLowerCase().trim()
        )
      ) {
        outsideKathmanduCharge = 1000;
        totalPrice += outsideKathmanduCharge;
      }

      /* -------------------- COD ADVANCE -------------------- */

      let codAdvance = 0;

      if (paymentMethod === "COD") {
        codAdvance = 5000;
        totalPrice -= codAdvance;
      }


    /* -------------------- UPLOAD SCREENSHOT -------------------- */


    uploadedProof = await uploadToCloudinary(
      paymentProof,
      "payment_proofs"
    );
    

    /* -------------------- CREATE ORDER -------------------- */

    const expiresAt = new Date(
      Date.now() +
      ORDER_EXPIRY_HOURS * 60 * 60 * 1000
    );

    const order = await Order.create({
      user: userId,
      orderItems,
      totalPrice,
      paymentMethod,
      paymentStatus:
        paymentMethod === "OnlineUpload"
          ? "submitted"
          : "pending",
      orderStatus: "pending",
      deliveryInfo,
      expiresAt,

      source,
      buildRequest:
        source === "build" ? buildId : undefined,

      paymentProof: uploadedProof || "",

      paymentSubmittedAt: uploadedProof
        ? new Date()
        : undefined,

      codAdvance,
      outsideKathmanduCharge,
    });

    /* -------------------- LINK BUILD -------------------- */

    if (source === "build" && buildRequest) {
      buildRequest.checkoutOrder = order._id;
      buildRequest.status = "checked_out";
      await buildRequest.save();
    }

    /* -------------------- CLEAR CART -------------------- */

    if (source === "cart") {
      await userModel.findByIdAndUpdate(
        userId,
        { $set: { cart: [] } }
      );
    }

    /* -------------------- EMAIL -------------------- */
    try {
      const dbUser = await userModel.findById(userId).select("email name");

      if (!dbUser?.email) throw new Error("User email not found");

      let subject = "";
      let htmlBody = "";

      if (source === "build" && buildRequest) {
        // Build order email
        subject = "Your Custom Build Order is Confirmed!";
        htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a;">
        <h2 style="color: #0f4c81;">Hi ${dbUser.name},</h2>
        <p>We're excited to inform you that your custom PC build request has been approved and is now officially an order in our system!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Price:</strong> Rs. ${totalPrice}</p>
        <p>Our expert team has started assembling your build and will ensure timely delivery to your address:</p>
        <p>${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.postalCode}, ${deliveryInfo.country}</p>
        <p style="margin-top: 20px;">You will receive updates at every stage of your order.</p>
        <p>Thank you for trusting us with your custom PC build! 🚀</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #888;">Need help? Contact us at <a href="mailto:proudnepalits@gmail.com">proudnepalits@gmail.com</a></p>
      </div>
    `;
      } else {
        // Product order email
        subject = "Order Placed Successfully – Proud Nepal IT Suppliers";
        htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a;">
        <h2 style="color: #0f4c81;">Hi ${dbUser.name},</h2>
        <p>Your order has been successfully placed!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Price:</strong> Rs. ${totalPrice}</p>
        <p>Delivery Address:</p>
        <p>${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.postalCode}, ${deliveryInfo.country}</p>
        <p style="margin-top: 20px;">Your order is being processed and will be dispatched shortly. You will receive a notification once it ships.</p>
        <p>Thank you for shopping with Proud Nepal IT Suppliers! 🛒</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #888;">Questions? Reach out to <a href="mailto:proudnepalits@gmail.com">proudnepalits@gmail.com</a></p>
      </div>
    `;
      }

      await sendEmail({
        to: dbUser.email,
        subject,
        html: htmlBody,
      });
    } catch (emailError) {
      console.error("EMAIL FAILED (order still created):", emailError);
    }


    return {
      success: true,
      message: "Order placed successfully! 🎉",
      orderId: String(order._id),
    };
  } catch (error) {
    /* ---------- DELETE UPLOADED PROOF IF FAILED ---------- */

    if (uploadedProof) {
      await deleteFromCloudinary(
        uploadedProof
      );
    }

    console.error(
      "CREATE ORDER ERROR:",
      error instanceof Error
        ? error.message
        : error
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
  let uploadedProof: string | null = null;

  try {
    const user = await requireUser();
    const userId = await resolveAuthUserId(user);
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    if (!Types.ObjectId.isValid(orderId)) {
      return { success: false, message: "Invalid order ID" };
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (order.paymentStatus !== "pending" || order.orderStatus !== "pending") {
      return { success: false, message: "Order can no longer be modified" };
    }

    const { deliveryInfo, paymentMethod, paymentProof } = input;

    /* -------------------- UPLOAD NEW PAYMENT PROOF -------------------- */
    if (paymentMethod === "OnlineUpload" && paymentProof) {
      uploadedProof = await uploadToCloudinary(paymentProof, "payment_proofs");
      order.paymentProof = uploadedProof;
      order.paymentSubmittedAt = new Date();
    }

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
        throw new Error("Incomplete delivery information");
      }

      order.deliveryInfo = deliveryInfo;
      const ktmValleyCities = ["kathmandu", "bhaktapur", "lalitpur"];
      order.outsideKathmanduCharge = ktmValleyCities.includes(
        deliveryInfo.city.toLowerCase().trim()
      )
        ? 0
        : 1000;
    }

    /* -------------------- UPDATE PAYMENT METHOD -------------------- */
    if (paymentMethod) {
      if (!["COD", "OnlineUpload"].includes(paymentMethod)) {
        throw new Error("Invalid payment method");
      }

      order.paymentMethod = paymentMethod;
      order.codAdvance = paymentMethod === "COD" ? 5000 : 0;
    }

    /* -------------------- RECALCULATE TOTAL PRICE -------------------- */
    const itemsTotal = order.orderItems.reduce(
      (acc: number, i: IOrderItem) => acc + i.price * i.quantity,
      0
    );
    const grossTotal = itemsTotal + (order.outsideKathmanduCharge || 0);
    order.totalPrice =
      order.paymentMethod === "COD"
        ? Math.max(0, grossTotal - (order.codAdvance || 0))
        : grossTotal;

    await order.save();

    /* -------------------- EMAIL -------------------- */
    const dbUser = await userModel.findById(userId).select("email name");
    if (dbUser?.email) {
      const isBuildOrder = !!order.buildRequest;

      const subject = isBuildOrder
        ? "Your Custom Build Order is Updated!"
        : "Your Order has been Updated Successfully";

      const htmlBody = isBuildOrder
        ? `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a;">
        <h2 style="color: #0f4c81;">Hi ${dbUser.name},</h2>
        <p>Your approved custom build order has been updated successfully.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Updated Total:</strong> Rs. ${order.totalPrice}</p>
        <p>Delivery Address:</p>
        <p>${order.deliveryInfo.address}, ${order.deliveryInfo.city}, ${order.deliveryInfo.postalCode}, ${order.deliveryInfo.country}</p>
        <p style="margin-top: 20px;">Our team is ensuring your build progresses smoothly. You will receive updates at every stage.</p>
        <p>Thank you for trusting us with your custom PC build! 🚀</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #888;">Need help? Contact us at <a href="mailto:proudnepalits@gmail.com">proudnepalits@gmail.com</a></p>
      </div>
    `
        : `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a;">
        <h2 style="color: #0f4c81;">Hi ${dbUser.name},</h2>
        <p>Your order has been updated successfully.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Updated Total:</strong> Rs. ${order.totalPrice}</p>
        <p>Delivery Address:</p>
        <p>${order.deliveryInfo.address}, ${order.deliveryInfo.city}, ${order.deliveryInfo.postalCode}, ${order.deliveryInfo.country}</p>
        <p style="margin-top: 20px;">Your order is being processed and will be delivered soon.</p>
        <p>Thank you for shopping with Proud Nepal IT Suppliers! 🛒</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #888;">Questions? Reach out to <a href="mailto:proudnepalits@gmail.com">proudnepalits@gmail.com</a></p>
      </div>
    `;

      await sendEmail({ to: dbUser.email, subject, html: htmlBody });
    }

    return { success: true, message: "Order updated successfully" };
  } catch (error) {
    /* -------------------- ROLLBACK UPLOADED IMAGE IF FAILED -------------------- */
    if (uploadedProof) {
      await deleteFromCloudinary(uploadedProof);
    }

    console.error("UPDATE ORDER ERROR:", error instanceof Error ? error.message : error);
    return { success: false, message: "Failed to update order" };
  }
}

export async function deleteOrderAction(
  orderId: string
): Promise<DeleteOrderResult> {
  try {
    /* -------------------- AUTH -------------------- */
    const user = await requireUser();
    const userId = await resolveAuthUserId(user);
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    if (!Types.ObjectId.isValid(orderId)) {
      return { success: false, message: "Invalid order ID" };
    }

    /* -------------------- FIND ORDER -------------------- */
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
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
    const dbUser = await userModel.findById(userId).select("email name");

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
    const userId = await resolveAuthUserId(user);
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    if (!Types.ObjectId.isValid(orderId)) {
      return { success: false, message: "Invalid order ID" };
    }

    /* -------------------- FIND ORDER -------------------- */
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
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

    const dbUser = await userModel.findById(userId).select("email name");

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
