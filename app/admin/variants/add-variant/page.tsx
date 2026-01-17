
import { VariantForm } from "@/components/admin/AddVariantForm";
import { fetchAllProductsNoPagination } from "@/lib/server/actions/admin/product/productActions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function  AddVariantPage() {
const res = await fetchAllProductsNoPagination();
const products = res.data || [];
  return (
    <div className="max-w-6xl mx-auto p-6">
         <div className="max-w-6xl mx-auto mb-4">
      <Link href="/admin/variants">
      <button
         
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Variants</span>
        </button></Link>
      </div>
      <VariantForm products={products} />
    </div>
  );
}
