import ShopGrid from "@/app/(root)/shop/shop-grid";
import { fetchPublicCategories } from "@/lib/server/fetchers/fetchCategory";
import { fetchPublicAllProducts } from "@/lib/server/fetchers/fetchPublicProducts";

export const revalidate = 60;

export default async function ListProducts({ page = 1, limit = 6 }: { page?: number; limit?: number }) {
  const res = await fetchPublicAllProducts(page, limit);
  const products = res.data || [];


  const categoriesRes = await fetchPublicCategories();
const categories = categoriesRes.data || [];



  return (
    <div className="space-y-20 mb-24">
      <ShopGrid products={products} categories={categories} pagination={res.pagination} />
      {/* pagination component using res.pagination */}
    </div>
  );
}
