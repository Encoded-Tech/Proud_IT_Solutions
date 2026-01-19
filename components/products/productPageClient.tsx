"use client";

import { Icon } from "@iconify/react";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";

import toast from "react-hot-toast";
import Link from "next/link";

import { CategoryType, MediaType, productType, ProductVariantType, ReviewState, ReviewType } from "@/types/product";
import ProductImages from "@/app/(root)/products/product-images";
import AddToCartButton from "../client/AddToCartButton";
import { addWishlistAction } from "@/lib/server/actions/public/wishlist/addToWishlist";
import { setWishlist } from "@/redux/features/wishlist/wishListSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Review from "@/app/(root)/products/product-review";
import { useState, useRef } from "react";
import { selectIsAuthenticated } from "@/redux/features/auth/userSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tag = { id?: string; name?: string };

export default function ProductPageClient({
  product,
  category,
  variants,
  reviewData,
}: {
  product: productType;
  variants: ProductVariantType[];
  category: CategoryType | null;
  reviewData: ReviewState;
}) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantType | null>(null);
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const [reviewsState, setReviewsState] = useState<ReviewType[]>(reviewData.reviews ?? []);
  const [avgRatingState, setAvgRatingState] = useState<number>(reviewData.avgRating ?? 0);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!product) return <div className="text-center mt-20">Product not found</div>;

  const {
    name,
    price,
    description,
    stock,
    brandName,
    id,
    tags,
    isActive,
    offeredPrice,
    isOfferedPriceActive,
  } = product;

  // Use variant data if selected, otherwise use product data
  const activePrice = selectedVariant?.price ?? price;
  const activeOfferedPrice = selectedVariant?.offeredPrice ?? offeredPrice;
  const activeIsOfferActive = selectedVariant?.isOfferActive ?? isOfferedPriceActive;
  const activeStock = selectedVariant?.stock ?? stock;
  const activeImages = selectedVariant?.images?.length ? selectedVariant.images : product.images;

  const featureImage = activeImages?.[0] || "";
  const media: MediaType[] =
    activeImages?.slice(1).map((img, idx) => ({
      id: `img-${idx}`,
      productId: product.id,
      mediaType: "IMAGE",
      mediaUrl: img,
    })) || [];

  const availableStock = activeStock;

  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariantType) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  // Clear variant selection
  const clearVariantSelection = () => {
    setSelectedVariant(null);
    setQuantity(1);
  };

  // Carousel scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  // ------------------ WISHLIST ------------------
  const handleAddToWishlist = async () => {
    if (!isLoggedIn) {
      toast.error("Please login first to add to wishlist");
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const res = await addWishlistAction({ productId: id });
      if (!res.success) return toast.error(res.message || "Failed to add to wishlist");
      toast.success(res.message || "Added to wishlist");
      dispatch(setWishlist(res.wishlist));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected server error");
    } finally {
      setLoading(false);
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

          {brandName && (
            <p className="font-medium text-sm text-lighttext">
              Brand: <span className="text-primarymain">{brandName}</span>
            </p>
          )}

          <h2 className="font-semibold md:text-xl text-lg border-b pb-2">{name}</h2>

          {/* SKU - Show when variant selected */}
          {selectedVariant && selectedVariant.sku && (
            <p className="text-sm text-lighttext">
              SKU: <span className="font-medium text-gray-700">{selectedVariant.sku}</span>
            </p>
          )}

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

          {/* VARIANTS CAROUSEL */}
          {variants && variants.length > 0 && (
            <div className="space-y-4 border-t border-b py-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-base text-lighttext">Select Configuration</h3>
                {selectedVariant && (
                  <button
                    onClick={clearVariantSelection}
                    className="text-xs text-primary underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative group">
                {/* Left Arrow */}
                {/* Left Arrow */}
{variants.length > 2 && (
  <button
    onClick={scrollLeft}
    className="
      absolute left-0 top-0 h-full w-6
      flex items-center justify-center
      bg-gradient-to-r from-white via-white/90 to-transparent
      opacity-0 group-hover:opacity-100
      transition
      z-20
      pointer-events-auto
    "
  >
    <ChevronLeft className="w-6 h-6 text-gray-800" />
  </button>
)}



                {/* Carousel Container */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch"
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>

                  {variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = variant.stock < 1;

                    return (
                      <div
                        key={variant.id}
                        className="flex-shrink-0 snap-start w-[200px]"
                      >
                        <button
                          onClick={() => !isOutOfStock && handleVariantSelect(variant)}
                          disabled={isOutOfStock}
                          className={`relative flex flex-col bg-white rounded-xl border p-3 shadow-sm hover:shadow-md transition-all duration-200 w-full ${
                            isSelected ? "border-primarymain" : "border-gray-200"
                          } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {/* Selected Icon */}
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <Icon icon="mdi:check-circle" className="text-primarymain text-xl" />
                            </div>
                          )}

                          {/* Out of Stock */}
                          {isOutOfStock && (
                            <div className="absolute top-2 right-2">
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                Out of Stock
                              </span>
                            </div>
                          )}

                          {/* Variant Image */}
                          {variant.images?.[0] && (
                            <Image
                            width={100}
                            height={100}
                              src={variant.images[0]}
                              alt={variant.sku || variant.id}
                              className="w-full h-32 object-contain rounded-md mb-3"
                            />
                          )}

                          {/* Specs */}
                          {variant.specs && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {Object.entries(variant.specs).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-lighttext font-medium"
                                >
                                  {key}: {value as string}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Price & Discount */}
                          <div className="flex flex-col gap-1">
                            {variant.isOfferActive && variant.offeredPrice > 0 ? (
                              <>
                                <span className="text-base font-semibold text-primarymain">
                                  Rs. {variant.offeredPrice}
                                </span>
                                <div className="flex items-center gap-1">
                                  <del className="text-xs text-lighttext">Rs. {variant.price}</del>
                                  <span className="text-xs text-green-600 font-medium">
                                    {variant.discountPercent}% OFF
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-base font-semibold text-lighttext">
                                Rs. {variant.price}
                              </span>
                            )}
                          </div>

                          {/* Low Stock Warning */}
                          {!isOutOfStock && variant.stock < 10 && (
                            <p className="text-xs text-orange-600 font-medium mt-1">
                              Only {variant.stock} left
                            </p>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Right Arrow */}
{variants.length > 2 && (
  <button
    onClick={scrollRight}
    className="
      absolute right-0 top-0 h-full w-6
      flex items-center justify-center
      bg-gradient-to-l from-white via-white/90 to-transparent
      opacity-0 group-hover:opacity-100
      transition
      z-20
      pointer-events-auto
    "
  >
    <ChevronRight className="w-6 h-6 text-gray-800" />
  </button>
)}


              </div>

              {!selectedVariant && (
                <p className="text-xs text-lighttext italic mt-2">
                  Please select a configuration to continue
                </p>
              )}
            </div>
          )}

          {/* Pricing */}
          {(!variants || variants.length === 0 || selectedVariant) && (
            <>
              {(!activeIsOfferActive || activeOfferedPrice < 1) && (
                <div className="flex items-center gap-2">
                  <p className="text-primarymain font-semibold text-3xl">Rs. {activePrice}</p>
                </div>
              )}
              {activeIsOfferActive && activeOfferedPrice > 0 && (
                <div className="flex items-center md:gap-4 gap-2">
                  <p className="text-primarymain font-semibold text-3xl">Rs. {activeOfferedPrice}</p>
                  <del className="text-lighttext font-medium text-xl">Rs. {activePrice}</del>
                  <span className="text-green-600 font-semibold text-lg ml-2">
                    {Math.round(((activePrice - activeOfferedPrice) / activePrice) * 100)}% Off
                  </span>
                </div>
              )}
            </>
          )}

          {/* Stock / Quantity */}
          {availableStock > 0 && (!variants || variants.length === 0 || selectedVariant) && (
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
                <AddToCartButton
                  productId={product.id}
                  variantId={selectedVariant?.id ?? ""}
                  productSlug={product.slug}
                  variant="page"
                  quantity={quantity}
                />
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

  <div className="min-h-[50vh] text-sm md:p-4 p-2 bg-zinc-100 rounded-md whitespace-pre-line">
    {description}
  </div>
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