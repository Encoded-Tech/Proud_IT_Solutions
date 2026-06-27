import { CreateOrderInput } from "../../actions/public/order/orderActions";

interface SimplifiedCartItem {
  product: { _id: string };
  variant?: { _id: string } | null;
  quantity: number;
}

interface MapCheckoutArgsSimplified {
  cartItems: SimplifiedCartItem[];
  cctvItems?: CreateOrderInput["cctvItems"];
  cctvCustomerDetails?: CreateOrderInput["cctvCustomerDetails"];
  requestKey?: string;
  deliveryInfo: CreateOrderInput["deliveryInfo"];
  paymentMethod: CreateOrderInput["paymentMethod"];
  source: CreateOrderInput["source"];
 buildId?: string;
  paymentProof?: File | null;
}

export function cartToCreateOrderSimplified({
  cartItems,
  cctvItems,
  cctvCustomerDetails,
  requestKey,
  deliveryInfo,
  paymentMethod,
  source,
  buildId,
  paymentProof,
}: MapCheckoutArgsSimplified): CreateOrderInput {
  return {
    items: cartItems.map((item) => ({
      product: item.product._id,
      variant: item.variant?._id,
      quantity: item.quantity,
    })),
    cctvItems,
    cctvCustomerDetails,
    requestKey,
    deliveryInfo,
    paymentMethod,
    source,
    buildId,
    paymentProof,

  };
}
