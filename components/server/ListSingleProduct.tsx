
import { fetchProductBySlug } from "@/lib/server/fetchers/fetchProducts";


export const revalidate = 60;

export default async function ListSingleProduct({ slug }: { slug: string }) {
  const res = await fetchProductBySlug(slug);

  if (!res.success || !res.data) {
    return <div>Product not found</div>;
  }

  const product = res.data || {};

  console.log("product", product);

  return (
    <div className="space-y-20">
      {/* <ProductPageClient product={product} /> */}
    </div>
  );
}