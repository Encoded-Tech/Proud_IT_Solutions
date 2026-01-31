import ShopGrid from "@/app/(root)/shop/shop-grid";
import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";

export const revalidate = 60;

export default async function ListProducts({ page = 1, limit = 6 }: { page?: number; limit?: number }) {
  // Direct DB fetch
  const res = await fetchAllProducts(page, limit);
  const products = res.data || [];

  console.log(res.pagination);

  const categoriesRes = await fetchCategories();
const categories = categoriesRes.data || [];



  return (
    <div className="space-y-20 mb-24">
      <ShopGrid products={products} categories={categories} pagination={res.pagination} />
      {/* pagination component using res.pagination */}
    </div>
  );
}