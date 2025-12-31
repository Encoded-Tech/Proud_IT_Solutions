export const dynamic = "force-dynamic";

import OrdersClient from "@/components/client/OrderTable";
import ContinueShoppingLink from "@/components/shared/ContinueShopping";
import { cancelOrderAction, deleteOrderAction } from "@/lib/server/actions/public/order/orderActions";
import { getMyOrders } from "@/lib/server/fetchers/fetchOrders";

export default async function OrdersPage() {
  const res = await getMyOrders();
  const orders = res.success ? res.data : [];

  return (
    <div className="bg-white rounded-xl shadow p-6">
       <ContinueShoppingLink />
      <h1 className="text-xl font-semibold mt-4">Orders</h1>
      <p className="text-gray-500 mt-1">Your order history</p>

     <OrdersClient
  orders={orders}
  cancelOrderAction={cancelOrderAction}
  deleteOrderAction={deleteOrderAction}
/>

    </div>
  );
}
