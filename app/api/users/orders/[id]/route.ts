import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Order } from "@/models/orderModel";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { sendEmail } from "@/lib/helpers/sendEmail";
import userModel from "@/models/userModel";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";

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

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or you don't have access" },
        { status: 404 }
      );
    }
if(order.paymentStatus === "paid" || order.orderStatus === "shipped" || order.orderStatus === "delivered"){
    return NextResponse.json({ success: false, message: "Order cannot be cancelled" }, { status: 400 });
}
    await order.deleteOne();
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
  
      // Users can only update delivery info if order is not paid or delivered
      if (order.paymentStatus === "paid" || order.orderStatus === "shipped" || order.orderStatus === "delivered") {
        return NextResponse.json({ success: false, message: "Cannot update delivery info after payment or shipping" }, { status: 400 });
      }
  
      const { deliveryInfo } = await req.json();
  
      // Validate delivery info fields
      const missingFields = checkRequiredFields({
        name: deliveryInfo?.name,
        phone: deliveryInfo?.phone,
        address: deliveryInfo?.address,
        city: deliveryInfo?.city,
        postalCode: deliveryInfo?.postalCode,
        country: deliveryInfo?.country,
      }, "Incomplete delivery information");
  
      if (missingFields) return missingFields;
  
      // Update delivery info
      order.deliveryInfo = deliveryInfo;
      await order.save();
  
      return NextResponse.json({
        success: true,
        message: "Order delivery info updated successfully",
        data: order,
        status: 200,
      });
    }, { resourceName: "order" })
  );