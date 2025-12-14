"use client";

import { Icon } from "@iconify/react";
import { Loader, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import Link from "next/link";
import { CategoryType, MediaType, productType } from "@/types/product";
import Review from "@/app/(root)/products/product-review";
import ProductImages from "@/app/(root)/products/product-images";

type Tag = {
  id?: string;
  name: string;
};
// If images array is empty, fallback to placeholder


export default function ProductPageClient({
  product,
  category,
}: {
  product: productType;
  category: CategoryType | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [loading] = useState(false);



  if (!product) {
    return <div className="text-center mt-20">Product not found</div>;
  }
  const {
    name,
    price,
    description,
    stock,
    brand,
 
    reviews,
    tags,
    isActive,
    avgRating,
    offeredPrice,
    isOfferedPriceActive,
  } = product;
  // Feature image
const featureImage = product.images?.[0] || "/placeholder.png";

// Media array for slider/thumbnails
const media: MediaType[] = product.images?.slice(1).map((img, idx) => ({
  id: `img-${idx}`,
  productId: product.id,
  mediaType: "IMAGE",
  mediaUrl: img,
})) || [];


  const availableStock = stock;

  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const increaseQuantity = () => {
    if (quantity >= availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  return (
    <main className="max-w-6xl xl:mx-auto mx-4 md:my-14 my-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/" className="text-lighttext">Home</Link> /
        <Link href="/shop" className="text-lighttext">
          {category?.categoryName}
        </Link> /
        <span className="font-medium">{name}</span>
      </div>

         <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md border-zinc-200 h-fit p-2">
     <ProductImages
  featureImage={featureImage}
  media={media}
/>
        </div>

        <div className="flex flex-col  space-y-6">
          <p className="text-xs px-4 py-1 rounded-md text-white bg-primary w-fit">
            {category?.categoryName}
          </p>

          <div className="flex items-center ">
            <div className="flex items-center">
              {[...Array(Math.floor(avgRating))].map((_, i) => (
                <Icon
                  key={i}
                  icon="ic:round-star"
                  className="fill-yellow-500 text-yellow-500 text-xl"
                />
              ))}
              {avgRating % 1 !== 0 && (
                <Icon
                  icon="ic:round-star-half"
                  className="fill-yellow-500 text-yellow-500 text-xl"
                />
              )}
            </div>
            <p className="font-medium text-lighttext text-sm">
              ({reviews.length}) reviews
            </p>
          </div>

          {brand?.name && (
            <p className="font-medium text-sm text-lighttext">
              {" "}
              Brand : <span className="text-primarymain">{brand.name}</span>
            </p>
          )}

          <h2 className="font-semibold md:text-xl text-lg border-b pb-2">
            {name}
          </h2>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: Tag, idx: number) => (
                <span
                  key={idx}
                  className="px-4 py-0 rounded-full bg-blue-50 text-primarymain  text-xs "
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {(offeredPrice < 1 || !isOfferedPriceActive) && (
            <div className="flex items-center gap-2">
              <p className="text-primarymain font-semibold text-3xl">
                Rs. {price}
              </p>
            </div>
          )}

          {offeredPrice > 0 && isOfferedPriceActive && (
            <div className="flex items-center md:gap-4 gap-2">
              <p className="text-primarymain font-semibold text-3xl">
                Rs. {offeredPrice}
              </p>
              <del className="text-lighttext font-medium text-xl">
                Rs. {price}
              </del>
              {price && offeredPrice > 0 && (
                <span className="text-green-600 font-semibold text-lg ml-2">
                  {Math.round(((price - offeredPrice) / price) * 100)}% Off
                </span>
              )}
            </div>
          )}

          {availableStock > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-6 w-fit bg-zinc-100 rounded-full py-1 px-4">
                <button
                  onClick={decreaseQuantity}
                  className=" cursor-pointer "
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className=" cursor-pointer "
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex  gap-2 items-center cursor-pointer  py-3 px-4 rounded-md bg-primary text-white text-sm hover:bg-primary/90">
                  {loading ? (
                    <Loader className="animate-spin h-4 w-4" />
                  ) : (
                    <ShoppingBag className="h-4 w-4" />
                  )}
                  {loading ? "ADDING" : " ADD TO CART"}
                </button>

                <div className="cursor-pointer flex items-center gap-2 font-medium text-lighttext hover:text-primarymain text-sm">
                  <Icon
                    icon="mdi:heart-circle"
                    className="text-pink-600 text-5xl hover:scale-110 ease-in-out duration-300 cursor-pointer"
                  />{" "}
                </div>
              </div>
            </section>
          )}
          {availableStock < 1 && (
            <p className="text-red-500 font-semibold my-8">Out of Stock !</p>
          )}
          {isActive === false && (
            <p className="text-red-500 font-semibold my-8">
              Sorry This product is not available now!
            </p>
          )}
        </div>
      </section>

      <div className="space-y-4">
        <h2 className="text-2xl font-medium">Description</h2>
        <div
          className="min-h-[50vh] text-sm md:p-4 p-2 bg-zinc-100 rounded-md"
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-medium">Customer Reviews</h2>
         <Review  />
      </div>

  

    
    </main>
  );
}
