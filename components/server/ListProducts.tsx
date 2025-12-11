import ShopGrid from "@/app/(root)/shop/shop-grid";
import { FRONTEND_URL } from "@/config/env";

export const revalidate = 60;

async function getProducts() {
  const res = await fetch(`${FRONTEND_URL}/api/product`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.data || [];
}

export default async function ListProducts() {
  const products = await getProducts();


  return (
    <div className="space-y-20">
      <ShopGrid product={products} />
    </div>
  );
}