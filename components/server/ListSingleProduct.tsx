
import { fetchProductBySlug } from "@/lib/server/fetchers/fetchProducts";
import ProductPageClient from "../products/productPageClient";
import HomeProducts from "./ListHomeProducts";
import { getReviewsAction } from "@/lib/server/fetchers/fetchReview";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";


export const revalidate = 60;

export default async function ListSingleProduct({ slug }: { slug: string }) {
  const res = await fetchProductBySlug(slug);
  

  if (!res.success || !res.data) {
    return <div>Product not found</div>;
  }

  const product = res.data || {};

   const category = product.category;

   

  const reviewData = await getReviewsAction(slug);

  // 🔥 get current logged-in user ID
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  // pass currentUserId along with reviewData
  const reviewDataWithUser = {
    ...reviewData,
    currentUserId,
  };



  return (
    <div className="space-y-20">
      <ProductPageClient  category={category} product={product}  reviewData={reviewDataWithUser} />
   
        <HomeProducts
        showBestSellers={false}
        showHotDeals={false}
        showNewArrivals={false}
      />
    </div>
  );
}