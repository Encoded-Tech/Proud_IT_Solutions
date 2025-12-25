"use client";

import { Icon } from "@iconify/react";
import { Minus, Plus } from "lucide-react";

import toast from "react-hot-toast";
import Link from "next/link";

import { CategoryType, MediaType, productType, ReviewState, ReviewType } from "@/types/product";
import ProductImages from "@/app/(root)/products/product-images";
import AddToCartButton from "../client/AddToCartButton";
import { addWishlistAction } from "@/lib/server/actions/wishlist/addToWishlist";
import { setWishlist } from "@/redux/features/wishlist/wishListSlice";
import { useAppDispatch } from "@/redux/hooks";
import Review from "@/app/(root)/products/product-review";
import { useState } from "react";

type Tag = { id?: string; name?: string };

export default function ProductPageClient({
  product,
  category,
  reviewData,
}: {
  product: productType;
  category: CategoryType | null;
  reviewData: ReviewState;
}) {
  const [quantity, setQuantity] = useState(1);
   const [reviewsState, setReviewsState] = useState<ReviewType[]>(reviewData.reviews ?? []);
  const [avgRatingState, setAvgRatingState] = useState<number>(reviewData.avgRating ?? 0);
  const dispatch = useAppDispatch();

  if (!product) return <div className="text-center mt-20">Product not found</div>;

  const {
    name,
    price,
    description,
    stock,
    brand,
    id,
    tags,
    isActive,
    offeredPrice,
    isOfferedPriceActive,
  } = product;

  const featureImage = product.images?.[0] || "";
  const media: MediaType[] =
    product.images?.slice(1).map((img, idx) => ({
      id: `img-${idx}`,
      productId: product.id,
      mediaType: "IMAGE",
      mediaUrl: img,
    })) || [];

  const availableStock = stock;


 

  // ------------------ WISHLIST ------------------
  const handleAddToWishlist = async () => {
    try {
      const res = await addWishlistAction({ productId: id });
      if (!res.success) return toast.error(res.message || "Failed to add to wishlist");
      toast.success(res.message || "Added to wishlist");
      dispatch(setWishlist(res.wishlist));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected server error");
    }
  };

  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const increaseQuantity = () => {
    if (quantity >= availableStock) return toast.error(`Only ${availableStock} items in stock`);
    setQuantity((prev) => prev + 1);
  };

  return (
    <main className="max-w-6xl xl:mx-auto mx-4 md:my-14 my-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/" className="text-lighttext">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/shop" className="text-lighttext">
          {category?.categoryName}
        </Link>{" "}
        / <span className="font-medium">{name}</span>
      </div>

      {/* Product Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md border-zinc-200 h-fit p-2">
          <ProductImages featureImage={featureImage} media={media} />
        </div>

        <div className="flex flex-col space-y-6">
          <p className="text-xs px-4 py-1 rounded-md text-white bg-primary w-fit">
            {category?.categoryName}
          </p>

          {/* Ratings */}
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(Math.floor(avgRatingState))].map((_, i) => (
                <Icon
                  key={i}
                  icon="ic:round-star"
                  className="fill-yellow-500 text-yellow-500 text-xl"
                />
              ))}
              {avgRatingState % 1 !== 0 && (
                <Icon
                  icon="ic:round-star-half"
                  className="fill-yellow-500 text-yellow-500 text-xl"
                />
              )}
            </div>
            <p className="font-medium text-lighttext text-sm">({reviewsState.length}) reviews</p>
          </div>

          {brand?.name && (
            <p className="font-medium text-sm text-lighttext">
              Brand: <span className="text-primarymain">{brand.name}</span>
            </p>
          )}

          <h2 className="font-semibold md:text-xl text-lg border-b pb-2">{name}</h2>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: Tag, idx: number) => (
                <span
                  key={idx}
                  className="px-4 py-0 rounded-full bg-blue-50 text-primarymain text-xs"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Pricing */}
          {(!isOfferedPriceActive || offeredPrice < 1) && (
            <div className="flex items-center gap-2">
              <p className="text-primarymain font-semibold text-3xl">Rs. {price}</p>
            </div>
          )}
          {isOfferedPriceActive && offeredPrice > 0 && (
            <div className="flex items-center md:gap-4 gap-2">
              <p className="text-primarymain font-semibold text-3xl">Rs. {offeredPrice}</p>
              <del className="text-lighttext font-medium text-xl">Rs. {price}</del>
              <span className="text-green-600 font-semibold text-lg ml-2">
                {Math.round(((price - offeredPrice) / price) * 100)}% Off
              </span>
            </div>
          )}

          {/* Stock / Quantity */}
          {availableStock > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-6 w-fit bg-zinc-100 rounded-full py-1 px-4">
                <button onClick={decreaseQuantity} className="cursor-pointer">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button onClick={increaseQuantity} className="cursor-pointer">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <AddToCartButton productId={id} variant="page" quantity={quantity} />
                <button
                  onClick={handleAddToWishlist}
                  className="flex items-center gap-2 hover:scale-110 transition"
                  aria-label="Add to wishlist"
                >
                  <Icon icon="mdi:heart-circle" className="text-pink-600 text-5xl" />
                </button>
              </div>
            </section>
          )}
          {availableStock < 1 && <p className="text-red-500 font-semibold my-8">Out of Stock!</p>}
          {!isActive && <p className="text-red-500 font-semibold my-8">This product is not available!</p>}
        </div>
      </section>

      {/* Description */}
      <div className="space-y-4">
        <h2 className="text-2xl font-medium">Description</h2>
        <div
          className="min-h-[50vh] text-sm md:p-4 p-2 bg-zinc-100 rounded-md"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        <Review
          initialReviews={reviewsState}
          totalReviews={reviewsState.length}
          avgRating={avgRatingState}
          productSlug={product.slug}
          currentUserId={reviewData.currentUserId}
          onReviewsChange={(updatedReviews, updatedAvgRating) => {
            setReviewsState(updatedReviews);
            setAvgRatingState(updatedAvgRating);
          }}
        />
      </div>
    </main>
  );
}
