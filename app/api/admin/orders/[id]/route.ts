import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { IOrder, Order } from "@/models/orderModel";
import { IProduct } from "@/models/productModel";

//total apis
//admin-get-order-by-id api/admin/orders/[id]
//admin-update-order-by-id api/admin/orders/[id]

// Define allowed values for better type safety
type PaymentStatus = "pending" | "submitted" | "paid" | "failed";
type OrderStatus = "pending" | "processing" | "delivered" | "cancelled" | "failed";

// Define the expected request body
interface UpdateOrderBody {
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;

}

//amdin-get-order-by-id api/admin/orders/[id]
export const GET = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
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

/*
* Admin Order Update API
* Steps:
* 1. Validate orderId param
* 2. Load order and previous state
* 3. Parse request body
* 4. Prevent illegal transitions
* 5. Apply updates
* 6. Update timestamps if needed
* 7. Process stock based on payment/order changes
* 8. Final check for COD orders
* 9. Save order
* 10. Return response
 * Rules enforced:
 *  - Prevent illegal transitions (paid -> failed, delivered -> cancelled, cancelled -> processing)
 *  - If payment becomes "paid" and stock not processed -> convert reserved -> sold and set orderStatus="processing"
 *  - If payment becomes "failed" and stock not processed -> release reserved stock and set orderStatus="failed"
 *  - If orderStatus becomes "cancelled" and stock not processed -> release reserved stock
 *  - Stock updates run exactly once (order.stockProcessed guards)
 *  - When orderStatus becomes delivered -> set deliveredAt
 *  - When orderStatus becomes cancelled -> set cancelledAt
*/
export const PUT = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
    const orderId = params?.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId).populate("orderItems.product");
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Save previous values to check illegal transitions
    const prevPaymentStatus = order.paymentStatus as PaymentStatus;
    const prevOrderStatus = order.orderStatus as OrderStatus;
    const prevStockProcessed = !!order.stockProcessed;

    const body: UpdateOrderBody = await req.json().catch(() => ({}));
    const paymentStatus: PaymentStatus | undefined = body.paymentStatus;
    const orderStatus: OrderStatus | undefined = body.orderStatus;

    if (!paymentStatus && !orderStatus) {
      return NextResponse.json(
        { success: false, message: "No updates provided" },
        { status: 400 }
      );
    }

    if (prevPaymentStatus === "paid" && paymentStatus === "failed") {
      return NextResponse.json(
        { success: false, message: "Cannot change a paid order to failed" },
        { status: 400 }
      );
    }

    if (prevPaymentStatus === "paid" && paymentStatus === "pending") {
      return NextResponse.json(
        { success: false, message: "Cannot change a paid order to pending" },
        { status: 400 }
      );
    }

    if (prevPaymentStatus === "paid" && paymentStatus === "submitted") {
      return NextResponse.json(
        { success: false, message: "Cannot change a paid order to submitted" },
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

    // Block only if admin tries to re-set paymentStatus to paid
    if (
      order.stockProcessed &&
      prevPaymentStatus === "paid" &&
      paymentStatus === "paid"
    ) {
      return NextResponse.json(
        { success: false, message: "Payment is already completed and cannot be re-paid" },
        { status: 409 }
      );
    }

    if (
      prevStockProcessed &&
      prevOrderStatus === "cancelled" &&
      (orderStatus === "cancelled")
    ) {
      return NextResponse.json(
        { success: false, message: "Order is already cancelled and settled" },
        { status: 409 }
      );
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderStatus) order.orderStatus = orderStatus;

    if (paymentStatus === "paid") {
      // Paid payment automatically sets orderStatus to processing if pending or failed
      if (order.orderStatus === "pending" || order.orderStatus === "failed") {
        order.orderStatus = "processing";
      }
      if (!order.paymentSubmittedAt) order.paymentSubmittedAt = new Date();
    }

    if (paymentStatus === "failed" && !body.orderStatus) {
      order.orderStatus = "failed";
    }

    if (body.orderStatus === "delivered") {
      // Delivered order must be paid
      if (order.paymentStatus !== "paid") {
        return NextResponse.json(
          { success: false, message: "Cannot mark delivered when payment is not paid" },
          { status: 400 }
        );
      }
      (order as IOrder).deliveredAt = new Date();
    }

    if (body.orderStatus === "cancelled") {
      (order as IOrder).cancelledAt = new Date();
    }

    //  Stock processing logic
    const doPaymentBecamePaid =
      prevPaymentStatus !== "paid" && order.paymentStatus === "paid";
    const doPaymentBecameFailed =
      prevPaymentStatus !== "failed" && order.paymentStatus === "failed";
    const doOrderBecameCancelled =
      prevOrderStatus !== "cancelled" && order.orderStatus === "cancelled";

    if (
      !order.stockProcessed &&
      (doPaymentBecamePaid || doPaymentBecameFailed || doOrderBecameCancelled)
    ) {
      for (const item of order.orderItems) {
        const product = item.product as IProduct;
        if (!product) continue;

        // Paid → move reserved stock to sold
        if (doPaymentBecamePaid) {
          product.reservedStock = Math.max((product.reservedStock || 0) - item.quantity, 0);
          product.stock = Math.max((product.stock || 0) - item.quantity, 0);
          if (product.stock === 0) product.isActive = false;
          await product.save();
        }

        // Failed or cancelled → release reserved stock
        if (doPaymentBecameFailed || doOrderBecameCancelled) {
          product.reservedStock = Math.max((product.reservedStock || 0) - item.quantity, 0);
          await product.save();
        }
      }

      order.stockProcessed = true;

      // Ensure processing status for paid payments
      if (doPaymentBecamePaid) order.orderStatus = "processing";
    }
    // Ensure processing orders are valid
    if (order.orderStatus === "processing") {
      if (order.paymentMethod === "COD") {
        // COD orders are allowed to be in processing even if paymentStatus !== "paid"
      } else if (order.paymentStatus !== "paid") {
        // Online payment orders must be paid to move to processing
        return NextResponse.json(
          { success: false, message: "Processing orders must be paid for online payments" },
          { status: 400 }
        );
      }
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully by admin",
      data: order,
    });
  }, { resourceName: "order" }),
  { roles: ["admin"] }
);
