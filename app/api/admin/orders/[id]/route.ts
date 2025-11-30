import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Order } from "@/models/orderModel";


export const PUT = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = _context?.params;
    const orderId = params?.id;


    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const { paymentStatus, orderStatus } = await req.json();

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderStatus) order.orderStatus = orderStatus;

    await order.save();
    return NextResponse.json({
      success: true,
      message: "Order updated successfully by admin",
      data: order,
      status: 200,
    });
  }, { resourceName: "order" }),
  { roles: ["admin"] }
);

export const GET = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = _context?.params;
    const orderId = params?.id;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId)
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
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "Order fetched successfully by admin",
      data: order,
      status: 200,
    });
  }, { resourceName: "order" }),
  { roles: ["admin"] }
);