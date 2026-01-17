import VariantTable from "@/components/admin/AdminVariantTable";
import { fetchAllProductsNoPagination } from "@/lib/server/actions/admin/product/productActions";
import { getAllProductVariants } from "@/lib/server/actions/admin/variants/variantsActions";


export default async function AdminVariantsPage() {
  const res = await getAllProductVariants();
  const resProducts = await fetchAllProductsNoPagination();
  const variants = res.data || [];

  const products = resProducts.data || [];

  if (!res.success) {
    return <div className="p-8">Failed to load variants</div>;
  }

  return (
    <div className="p-8">
      <VariantTable variants={variants} products={products} />
    </div>
  );
}
