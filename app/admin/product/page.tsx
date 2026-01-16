import ProductTable from "@/components/admin/AdminProductTable";
import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";

export default async function ProductPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page ?? 1);
  const limit = 6;

  const res = await fetchAllProducts(page, limit);

  if (!res.success || !res.data || !res.pagination) {
    return <div className="p-6 text-red-600">Failed to load products</div>;
  }

  const resCategories = await fetchCategories();
  const categories = resCategories.data || [];

  return (
    <div className="p-6">
      <ProductTable
        products={res.data}
        categories={categories}
        pagination={res.pagination}
      />
    </div>
  );
}
