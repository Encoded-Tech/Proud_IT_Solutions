import { CreateOrderInput } from "../../actions/order/orderActions";

interface SimplifiedCartItem {
  product: { _id: string };
  variant?: { _id: string } | null;
  quantity: number;
}

interface MapCheckoutArgsSimplified {
  cartItems: SimplifiedCartItem[];
  deliveryInfo: CreateOrderInput["deliveryInfo"];
  paymentMethod: CreateOrderInput["paymentMethod"];
  source: CreateOrderInput["source"];
}

export function cartToCreateOrderSimplified({
  cartItems,
  deliveryInfo,
  paymentMethod,
  source,
}: MapCheckoutArgsSimplified): CreateOrderInput {
  return {
    items: cartItems.map((item) => ({
      product: item.product._id,
      variant: item.variant?._id,
      quantity: item.quantity,
    })),
    deliveryInfo,
    paymentMethod,
    source,
  };
}
