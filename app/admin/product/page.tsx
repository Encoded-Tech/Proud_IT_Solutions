import ProductTable from "@/components/admin/AdminProductTable";
import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";

interface ProductPageProps {
  searchParams?: { page?: string };
}

export default async function ProductPage(props: ProductPageProps) {
  // Await searchParams before using
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page ?? 1);
  const limit = 6;

  const res = await fetchAllProducts(page, limit);

  if (!res.success || !res.data || !res.pagination) {
    return <div className="p-6 text-red-600">Failed to load products</div>;
  }

  return (
    <div className="p-6">
      <ProductTable products={res.data} pagination={res.pagination} />
    </div>
  );
}
