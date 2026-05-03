
import { fetchPublicProductBySlug } from "@/lib/server/fetchers/fetchPublicProducts";
import ProductPageClient from "../products/productPageClient";
import HomeProducts from "./ListHomeProducts";
import { getReviewsAction } from "@/lib/server/fetchers/fetchReview";
import { auth } from "@/auth";
import { productType, ProductVariantType } from "@/types/product";


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
  const [reviewData, session] = await Promise.all([
    getReviewsAction(slug),
    auth(),
  ]);
  const variants: ProductVariantType[] = (product.variants || []).map((variant) => ({
    id: variant.id,
    productId: product.id,
    productName: product.name,
    specs: variant.specs,
    price: variant.price,
    discountPercent: 0,
    offeredPrice: 0,
    isOfferActive: false,
    offerStartDate: null,
    offerEndDate: null,
    stock: variant.stock,
    reservedStock: 0,
    sku: "",
    images: variant.images,
    isActive: variant.isActive,
    createdAt: "",
    updatedAt: "",
  }));


   const category = product.category;

   


  // 🔥 get current logged-in user ID
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
