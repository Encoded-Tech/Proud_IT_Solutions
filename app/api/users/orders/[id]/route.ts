import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Order } from "@/models/orderModel";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { sendEmail } from "@/lib/helpers/sendEmail";
import userModel from "@/models/userModel";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { IProduct } from "@/models/productModel";

//total apis
//user-get-all-orders api/users/orders
//user-update-order-by-id api/users/orders/[id]
//user-cancel-order-by-id api/users/orders/[id]


// user-get-order-by-id api/users/orders/[id]
export const GET = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
    const orderId = params?.id;
    const userId = getAuthUserId(req);

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate({
        path: "orderItems.product",
        select: "name price stock images slug reservedStock",
      })
      .populate({
        path: "orderItems.variant",
        select: "sku price",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or you don't have access" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Order fetched successfully",
      data: order,
      //   {
      //     _id: order._id,
      //     orderItems: order.orderItems,
      //     totalPrice: order.totalPrice,
      //     paymentStatus: order.paymentStatus,
      //     orderStatus: order.orderStatus,
      //     deliveryInfo: order.deliveryInfo,
      //     createdAt: order.createdAt,
      //     updatedAt: order.updatedAt,
      //   },
      status: 200,
    });
  }, { resourceName: "order" })
);

//  user-update-order-by-id api/users/orders/[id]
export const PUT = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
    const orderId = params?.id;
    const userId = getAuthUserId(req);

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate({
        path: "orderItems.product",
        select: "name price stock images slug reservedStock",
      })
      .populate({
        path: "orderItems.variant",
        select: "sku price",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or you don't have access" },
        { status: 404 }
      );
    }

    // ✅ STRICT mutation rules
    if (
      order.paymentStatus !== "pending" ||
      order.orderStatus !== "pending"
    ) {
      return NextResponse.json(
        { success: false, message: "Order can no longer be modified" },
        { status: 400 }
      );
    }
    // Users can only update delivery info if order is not paid or delivered
    if (order.paymentStatus === "paid" || order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return NextResponse.json({ success: false, message: "Cannot update delivery info after payment or shipping" }, { status: 400 });
    }

    const { deliveryInfo, paymentMethod } = await req.json();

   if (deliveryInfo) {
      const missingFields = checkRequiredFields(
        {
          name: deliveryInfo.name,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          postalCode: deliveryInfo.postalCode,
          country: deliveryInfo.country,
        },
        "Incomplete delivery information"
      );

      if (missingFields) return missingFields;

      order.deliveryInfo = deliveryInfo;
    }

     // ✅ Validate & update payment method ONLY if provided
    if (paymentMethod) {
      if (!["COD", "OnlineUpload"].includes(paymentMethod)) {
        return NextResponse.json(
          { success: false, message: "Invalid payment method" },
          { status: 400 }
        );
      }

      // Optional extra safety
      if (order.paymentStatus !== "pending") {
        return NextResponse.json(
          { success: false, message: "Payment already initiated" },
          { status: 400 }
        );
      }

      order.paymentMethod = paymentMethod;
    }
   
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order delivery info updated successfully",
      data: order,
      status: 200,
    });
  }, { resourceName: "order" })
);

// user-cancel-order-by-id api/users/orders/[id]
export const DELETE = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
    const orderId = params?.id;
    const userId = getAuthUserId(req);

    const user = await userModel.findById(userId).select("email name");
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, user: userId })
    .populate({
      path: "orderItems.product",
      select: "name stock reservedStock",
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or you don't have access" },
        { status: 404 }
      );
    }
       // Check payment and order status
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: false, message: "Paid orders cannot be cancelled" }, { status: 400 });
    }

    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return NextResponse.json({ success: false, message: "Orders that are shipped or delivered cannot be cancelled" }, { status: 400 });
    }

    // 1️⃣ Restore reserved stock for each product
    for (const item of order.orderItems) {
      const product = item.product as IProduct; // populated product
      if (product) {
        product.reservedStock = Math.max((product.reservedStock || 0) - item.quantity, 0);
        await product.save();
      }
    }
    order.orderStatus = "cancelled";
    await order.save();
    await sendEmail({
      to: user.email,
      subject: "Order Cancelled",
      html: `<p>Your order ${order._id} has been successfully cancelled.</p>`,
    });
    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      data: [],
      //   {
      //     _id: order._id,
      //     orderItems: order.orderItems,
      //     totalPrice: order.totalPrice,
      //     paymentStatus: order.paymentStatus,
      //     orderStatus: order.orderStatus,
      //     deliveryInfo: order.deliveryInfo,
      //     createdAt: order.createdAt,
      //     updatedAt: order.updatedAt,
      //   },
      status: 200,
    });
  }, { resourceName: "order" })
);


