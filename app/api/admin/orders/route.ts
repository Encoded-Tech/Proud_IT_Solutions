import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Order } from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";
import { IOrderResponse } from "../../users/orders/route";
import { ApiResponse } from "@/types/api";

//total apis
// admin-get-all-orders  api/admin/orders

export const GET = withAuth(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    withDB(async (req: NextRequest, context?) => {
       
        const orders = await Order.find()
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
        })
        .sort({ createdAt: -1 }); 

         if (!orders) {
           return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
         }
       
         const response: ApiResponse<IOrderResponse[]> = {
            success: orders.length > 0,
            message: orders.length > 0 ? "Orders fetched successfully by admin" : "No orders found",
            data: orders,
            // data: orders.map(order => ({
            //     _id: order._id,
            //   orderItems: order.orderItems as IOrderItemResponse[],
            //   totalPrice: order.totalPrice,
            //   paymentStatus: order.paymentStatus,
            //   orderStatus: order.orderStatus,
            //   deliveryInfo: order.deliveryInfo as IDeliveryInfo,
            //   createdAt: order.createdAt,
            //   updatedAt: order.updatedAt,
            // })),

            status: orders.length > 0 ? 200 : 404,
          };
         
         return NextResponse.json(response, { status: response.status });
       },  { resourceName: "order" }),
       { roles: ["admin"] }
)