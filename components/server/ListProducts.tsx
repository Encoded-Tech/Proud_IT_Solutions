import ShopGrid from "@/app/(root)/shop/shop-grid";
import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";

export const revalidate = 60;

export default async function ListProducts({ page = 1, limit = 20 }: { page?: number; limit?: number }) {
  // Direct DB fetch
  const res = await fetchAllProducts(page, limit);
  const products = res.data || [];

  return (
    <div className="space-y-20">
      <ShopGrid product={products} />
      {/* pagination component using res.pagination */}
    </div>
  );
}