import { getAllOrdersAdmin } from "@/lib/server/actions/admin/order/orderActionsAdmin";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/server/fetchers/fetchOrders";
import OrdersClient from "./orderClient";
import { connection } from "next/server";



interface PageProps {
  searchParams: Promise<{
    page?: string;
    paymentStatus?: PaymentStatus;
    orderStatus?: OrderStatus;
    paymentMethod?: PaymentMethod;
    search?: string;
  }>;
}
export default async function OrdersPage({ searchParams }: PageProps) {
  await connection();
  const params = await searchParams;

  const page = Number(params.page ?? 1);

  const result = await getAllOrdersAdmin({
    page,
    limit: 10,
    paymentStatus: params.paymentStatus,
    orderStatus: params.orderStatus,
    paymentMethod: params.paymentMethod,
    search: params.search,
  });

  return (
    <OrdersClient
      initialData={result.data ?? []}
      total={result.total ?? 0}
      page={result.page ?? 1}
      totalPages={result.totalPages ?? 1}
    />
  );
}
