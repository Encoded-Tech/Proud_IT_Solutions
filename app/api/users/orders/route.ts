import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Order } from "@/models/orderModel";
import { Product } from "@/models/productModel";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { IProductVariant } from "@/models/productVariantsModel";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import userModel from "@/models/userModel";
import { sendEmail } from "@/lib/helpers/sendEmail";
import { ApiResponse } from "@/types/api";


import { Types } from "mongoose";

export interface IProductInfo {
  _id: Types.ObjectId | string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  slug: string;
  reservedStock?: number;
}

export interface IVariantInfo {
  _id: Types.ObjectId | string;
  sku: string;
  price: number;
}

export interface IUserInfo {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
}

export interface IOrderItemResponse {
  product: IProductInfo;
  variant?: IVariantInfo;
  quantity: number;
  price: number;
}

export interface IDeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

export interface IOrderResponse {
  orderItems: IOrderItemResponse[];
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  deliveryInfo: IDeliveryInfo;
}

export const POST = withAuth(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const userId = getAuthUserId(req);
    const { orderItems, deliveryInfo } = await req.json();

    // Validate orderItems
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json({ success: false, message: "No items to order" }, { status: 400 });
    }

    // Validate deliveryInfo
    const missingDeliveryFields = checkRequiredFields({
      name: deliveryInfo?.name,
      phone: deliveryInfo?.phone,
      address: deliveryInfo?.address,
      city: deliveryInfo?.city,
      postalCode: deliveryInfo?.postalCode,
      country: deliveryInfo?.country,
    }, "Incomplete delivery information"); 

    if (missingDeliveryFields) return missingDeliveryFields;

    const existingOrder = await Order.findOne({
        user: userId,
        "orderItems.product": { $all: orderItems.map(i => i.product) },
        paymentStatus: "pending",
      });
      if (existingOrder) {
        return NextResponse.json({
          success: false,
          message: "You already have a pending order with these items",
        }, { status: 400 });
      }
      

    // Get user email
    const user = await userModel.findById(userId).select("email name");
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // Validate products & calculate totalPrice
    let totalPrice = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product).populate({
        path: "variants",
        match: { isActive: true },
        select: "sku price",
      });

      if (!product || !product.isActive) {
        return NextResponse.json({ success: false, message: `Product ${item.product} unavailable` }, { status: 400 });
      }

      const availableStock = product.stock;
      if (availableStock < item.quantity) {
        return NextResponse.json({ success: false, message: `Not enough stock for product ${item.product}` }, { status: 400 });
      }

      const price = item.variant
        ? product.variants.find((v: IProductVariant) => v.sku === item.variant)?.price
        : product.price;

      if (!price) {
        return NextResponse.json({ success: false, message: `Invalid variant for product ${item.product}` }, { status: 400 });
      }

      totalPrice += price * item.quantity;

      // Reserve stock
  
      await product.save();
    }

    // Create order with pending payment
    const order = await Order.create({
      user: userId,
      orderItems,
      totalPrice,
      paymentStatus: "pending",
      orderStatus: "pending",
      deliveryInfo,
    });

    const populatedOrder = await Order.findById(order._id)
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
    // Send order confirmation email
    await sendEmail({
      to: user.email,
      subject: "Order Placed Successfully",
      html: `<h1>Hi ${user.name},</h1>
             <p>Your order has been placed successfully.</p>
             <p>Order ID: ${order._id}</p>
             <p>Total Price: $${order.totalPrice}</p>`,
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      data: populatedOrder,
    });
  }, { resourceName: "order" })
);


export const GET = withAuth(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    withDB(async (req: NextRequest, context?) => {
        const userId = getAuthUserId(req);
       
        const orders = await Order.find({ user: userId })
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
            message: orders.length > 0 ? "Orders fetched successfully" : "No orders found",
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
       },  { resourceName: "order" })
)
