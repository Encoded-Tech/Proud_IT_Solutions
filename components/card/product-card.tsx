
import { productType } from "@/types/product";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import AddToCartButton from "../client/AddToCartButton";


interface ProductCardProps {
  product?: productType;
  label?: string;
  avgRating?: number;
  totalReviews?: number;

}

const ProductCard = ({ product, label, avgRating }: ProductCardProps) => {
  const {
    images = [],
    name = "",
    price = 0,
    slug = "",
    stock = 0,

    offeredPrice = 0,
    isOfferedPriceActive = false,
  } = product || {};

  console.log(product);

  
  const availableStock = stock;
  const resolvedAvgRating = avgRating ?? product?.avgRating ?? 0;

  return (
    <main>
      <div className="md:p-3 p-2 rounded-md shadow-sm flex flex-col gap-2 relative">
       <Link href={`/products/${slug}`} className="group relative">
  {/* Label badge - top-left */}
  {label && (
    <span className="absolute top-3 left-3 z-10 bg-primary text-white rounded-md text-xs px-3 py-1 font-medium">
      {label}
    </span>
  )}

  {/* Variant count badge - top-right, slightly left of heart */}
  {product?.variants?.length ? (
    <span className="absolute top-11 left-3 z-10 bg-red-500 text-white rounded-full text-xs px-2 py-1 font-medium">
      {product.variants.length} {product.variants.length > 1 ? "variants" : "variant"}
    </span>
  ) : null}

  {/* Heart (wishlist) button - top-right */}
  <div className="absolute top-3 right-3 z-20 text-white">
    <div className="bg-rose-600 rounded-full p-2 w-fit opacity-0 group-hover:opacity-100 ease-in-out duration-200">
      <Icon icon="prime:heart-fill" width={24} height={24} />
    </div>
  </div>

  {/* Product image */}
  <figure className="overflow-hidden aspect-ratio-[3/4] rounded-md cursor-pointer">
    <Image
      src={images?.[0] || ""}
      alt={name}
      width={1000}
      height={500}
      priority
      className="sm:h-[15em] h-[8em] object-cover hover:scale-110 hover:brightness-75 ease-in-out duration-300"
    />
  </figure>
</Link>

        {/* Product info */}
        <div className="flex flex-col justify-between">
          <h2 className="font-medium md:text-base text-sm text-lighttext line-clamp-1">
            {name}
          </h2>

          <div className="flex items-center gap-[2px]">
            {[...Array(Math.floor(resolvedAvgRating))].map((_, i) => (
              <Icon key={`full-${i}`} icon="ic:round-star" className="text-yellow-500 md:text-xl text-sm" />
            ))}
            {resolvedAvgRating % 1 !== 0 && (
              <Icon icon="ic:round-star-half" className="text-yellow-500 md:text-xl text-sm" />
            )}
            {[...Array(5 - Math.ceil(resolvedAvgRating))].map((_, i) => (
              <Icon key={`empty-${i}`} icon="ic:round-star-outline" className="text-gray-300 md:text-xl text-sm" />
            ))}
          </div>
        </div>

        {/* Price display */}
        {(offeredPrice < 1 || !isOfferedPriceActive) ? (
          <div className="flex items-center gap-2">
            {availableStock < 1 ? (
              <p className="text-red-500 font-semibold">Out of Stock!</p>
            ) : (
              <h2 className="font-medium text-primary md:text-lg text-sm">Rs. {price}</h2>
            )}
          </div>
        ) : (
          <div>
            {availableStock < 1 ? (
              <p className="text-primarymain font-semibold text-sm md:text-lg">Out of Stock!</p>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-primary font-medium md:text-lg text-sm">Rs. {offeredPrice}</p>
                <del className="text-lighttext font-medium text-sm">Rs. {price}</del>
              </div>
            )}
          </div>
        )}

       
      </div>
       {/* Action buttons */}
        {product?.id && (
          <div className="flex gap-2 mt-2">
            <AddToCartButton productId={product.id} variant="card" />
           
          </div>
        )}
    </main>
  );
};


export default ProductCard;
