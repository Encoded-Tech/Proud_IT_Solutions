
import { fetchPublicProductBySlug } from "@/lib/server/fetchers/fetchPublicProducts";
import ProductPageClient from "../products/productPageClient";
import HomeProducts from "./ListHomeProducts";
import { getReviewsAction } from "@/lib/server/fetchers/fetchReview";
import { auth } from "@/auth";
import { getProductVariants } from "@/lib/server/actions/admin/variants/variantsActions";
import { productType } from "@/types/product";
import { connection } from "next/server";


export const revalidate = 60;

export default async function ListSingleProduct({
  slug,
  initialProduct,
}: {
  slug: string;
  initialProduct?: productType | null;
}) {
  const res = initialProduct
    ? { success: true, data: initialProduct }
    : await fetchPublicProductBySlug(slug);


  if (!res.success || !res.data) {
    return <div>Product not found</div>;
  }

  const product = res.data || {};

  await connection();

  const productId = product.id;
  const variantRes = await getProductVariants(productId);
  const variants = variantRes.success ? variantRes.data : [];


   const category = product.category;

   

  const reviewData = await getReviewsAction(slug);

  // 🔥 get current logged-in user ID
  const session = await auth();
  const currentUserId = session?.user?.id;

  // pass currentUserId along with reviewData
  const reviewDataWithUser = {
    ...reviewData,
    currentUserId,
  };



  return (
    <div className="space-y-20">
      <ProductPageClient  category={category} product={product} variants={variants} reviewData={reviewDataWithUser} />
   
        <HomeProducts
        showBestSellers={false}
        showHotDeals={false}
        showNewArrivals={false}
      />
    </div>
  );
}
