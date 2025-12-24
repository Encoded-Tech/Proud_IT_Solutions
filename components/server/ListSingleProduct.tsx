
import { fetchProductBySlug } from "@/lib/server/fetchers/fetchProducts";
import ProductPageClient from "../products/productPageClient";
import HomeProducts from "./ListHomeProducts";


export const revalidate = 60;

export default async function ListSingleProduct({ slug }: { slug: string }) {
  const res = await fetchProductBySlug(slug);
  

  if (!res.success || !res.data) {
    return <div>Product not found</div>;
  }

  const product = res.data || {};

   const category = product.category;



  return (
    <div className="space-y-20">
      <ProductPageClient category={category} product={product} />
        <HomeProducts
        showBestSellers={false}
        showHotDeals={false}
        showNewArrivals={false}
      />
    </div>
  );
}