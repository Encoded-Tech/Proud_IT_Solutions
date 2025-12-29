import { OrderResponse, PopulatedOrder } from "../../fetchers/fetchOrders";

export function orderToOrderResponse(
  order: PopulatedOrder
): OrderResponse {
  return {
    _id: String(order._id),
    totalPrice: order.totalPrice,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    deliveryInfo: order.deliveryInfo,

    orderItems: order.orderItems.map((item) => ({
      quantity: item.quantity,
      price: item.price,
      product: {
        _id: String(item.product._id),
        name: item.product.name,
        price: item.product.price,
        slug: item.product.slug,
        images: item.product.images,
      },
      variant: item.variant
        ? {
            _id: String(item.variant._id),
            sku: item.variant.sku,
            price: item.variant.price,
          }
        : undefined,
    })),
  };
}
