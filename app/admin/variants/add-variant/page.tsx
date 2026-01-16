
import { VariantForm } from "@/components/admin/AddVariantForm";
import { fetchAllProductsNoPagination } from "@/lib/server/actions/admin/product/productActions";






export default async function  AddVariantPage() {
const res = await fetchAllProductsNoPagination();
const products = res.data || [];
  return (
    <div className="max-w-6xl mx-auto p-6">
      <VariantForm products={products} />
    </div>
  );
}
