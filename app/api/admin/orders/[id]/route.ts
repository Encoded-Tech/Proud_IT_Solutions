import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Order } from "@/models/orderModel";
import { IProduct } from "@/models/productModel";

//total apis
//admin-get-order-by-id api/admin/orders/[id]
//admin-update-order-by-id api/admin/orders/[id]

//amdin-get-order-by-id api/admin/orders/[id]
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

//admin update-order-by-id api/admin/orders/[id]

// 1. Load Order
// 2. Validate orderId, order exist
// 3. Extract prevPaymentStatus, prevOrderStatus
// 4. Parse request body (paymentStatus, orderStatus)
// 5. Validate input (must have at least one)
// 6. Prevent illegal transitions (like paid → failed)
// 7. Prevent re-hit on settled orders 
// 8. Update order.paymentStatus / order.orderStatus
// 9. Stock update logic
// 10. Save order

export const PUT = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
    const orderId = params?.id;

    // 1. Validate ID
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    // 2. Load Order
    const order = await Order.findById(orderId).populate("orderItems.product");
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // 3. Save prev values
    const prevPaymentStatus = order.paymentStatus;
    const prevOrderStatus = order.orderStatus;

    // 4. Parse body
    const { paymentStatus, orderStatus } = await req.json();

    if (!paymentStatus && !orderStatus) {
      return NextResponse.json(
        { success: false, message: "No updates provided" },
        { status: 400 }
      );
    }

    // 5. Illegal transitions
    if (prevPaymentStatus === "paid" && paymentStatus === "failed") {
      return NextResponse.json(
        { success: false, message: "Cannot change paid order to failed" },
        { status: 400 }
      );
    }

    if (prevOrderStatus === "delivered" && orderStatus === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Delivered order cannot be cancelled" },
        { status: 400 }
      );
    }

    if (prevOrderStatus === "cancelled" && orderStatus === "processing") {
      return NextResponse.json(
        { success: false, message: "Cancelled order cannot be reprocessed" },
        { status: 400 }
      );
    }

  

    // Paid + already processed
    if (
      order.stockProcessed &&
      prevPaymentStatus === "paid" &&
      (paymentStatus === "paid" || paymentStatus === undefined)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Order is already paid and settled",
        },
        { status: 409 }
      );
    }

    // Cancelled + already processed
    if (
      order.stockProcessed &&
      prevOrderStatus === "cancelled" &&
      (orderStatus === "cancelled" || orderStatus === undefined)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Order is already cancelled and settled",
        },
        { status: 409 }
      );
    }

    /**
     * 7. Apply new values
     */
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderStatus) order.orderStatus = orderStatus;

    /**
     * 8. STOCK UPDATE LOGIC
     */

    // CASE 1 – Payment Success → convert reserved to sold
    if (order.paymentStatus === "paid" && !order.stockProcessed) {
      for (const item of order.orderItems) {
        const product = item.product as IProduct;

        product.reservedStock = Math.max(product.reservedStock - item.quantity, 0);
        product.stock = Math.max(product.stock - item.quantity, 0);

        if (product.stock === 0) product.isActive = false;
        order.orderStatus = "processing";

        await product.save();
      }

      order.stockProcessed = true;
    }

    // CASE 2 – Payment Failed → release reserved
    if (order.paymentStatus === "failed" && !order.stockProcessed) {
      for (const item of order.orderItems) {
        const product = item.product as IProduct;

        product.reservedStock = Math.max(product.reservedStock - item.quantity, 0);

        await product.save();
      }

      order.stockProcessed = true;
    }

    // CASE 3 – Cancelled → release reserved
    if (order.orderStatus === "cancelled" && !order.stockProcessed) {
      for (const item of order.orderItems) {
        const product = item.product as IProduct;

        product.reservedStock = Math.max(product.reservedStock - item.quantity, 0);

        await product.save();
      }

      order.stockProcessed = true;
    }

    // 9. Save
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


