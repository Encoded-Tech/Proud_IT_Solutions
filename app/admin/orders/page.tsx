import { getAllOrdersAdmin } from "@/lib/server/actions/admin/order/orderActionsAdmin";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/server/fetchers/fetchOrders";
import OrdersClient from "./orderClient";



interface PageProps {
  searchParams: Promise<{
    page?: string;
    paymentStatus?: PaymentStatus;
    orderStatus?: OrderStatus;
    paymentMethod?: PaymentMethod;
    search?: string;
  }>;
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrdersPage({ searchParams }: PageProps) {
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
