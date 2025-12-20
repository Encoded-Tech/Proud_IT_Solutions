
import { productType } from "@/types/product";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import AddToCartButton from "../client/AddToCartButton";

interface ProductCardProps {
  product?: productType;
  label?: string; 
  
}

const ProductCard = ({ product, label }: ProductCardProps) => {
  const {
    images = [],
    name = "",
    price = 0,
    slug = "",
    stock = 0,
    avgRating = 0,
    offeredPrice = 0,
    isOfferedPriceActive = false,
  } = product || {};

  const availableStock = stock;

  return (
    <main>
      <div className=" md:p-3 p-2 rounded-md shadow-sm  flex flex-col gap-2">
        <Link href={`/products/${slug}`} className="group relative">
            {label && (
            <span className="absolute top-3 left-3 z-2 bg-primary text-white border-none rounded-md text-xs px-3 py-1 font-medium">
              {label}
            </span>
          )}
          <figure className="overflow-hidden rounded-md cursor-pointer ">
            <Image
              src={images?.[0] || "/placeholder.png"}
              alt={name}
              width={1000}
              height={500}
              priority
              className="sm:h-[15em] h-[8em] object-cover hover:scale-110 hover:brightness-75 ease-in-out duration-300"
            />
          </figure>

          <div className="absolute right-3 top-3 text-white">
            <div
              className={`bg-rose-600 text-white rounded-full p-2 w-fit opacity-0 group-hover:opacity-100 ease-in-out duration-200`}
            >
              <Icon icon="prime:heart-fill" width="24" height="24" />{" "}
            </div>
          </div>
        </Link>

        <div className="flex  flex-col justify-between ">
          <h2 className="font-medium md:text-base text-sm text-lighttext line-clamp-1">
            {name}
          </h2>

          <div className="flex items-center">
            {[...Array(Math.floor(avgRating))].map((_, i) => (
              <Icon
                key={i}
                icon="ic:round-star"
                className="fill-yellow-500 text-yellow-500 md:text-xl text-sm"
              />
            ))}
            {avgRating % 1 !== 0 && (
              <Icon
                icon="ic:round-star-half"
                className="fill-yellow-500 text-yellow-500 text-xl"
              />
            )}
          </div>
        </div>

        {(offeredPrice < 1 || !isOfferedPriceActive) && (
          <div className="flex items-center gap-2">
            {availableStock < 1 ? (
              <p className="text-red-500 font-semibold ">Out of Stock !</p>
            ) : (
              <h2 className="font-medium text-primary md:text-lg text-sm">
                Rs. {price}
              </h2>
            )}
          </div>
        )}

        {offeredPrice > 0 && isOfferedPriceActive && (
          <div>
            {availableStock < 1 ? (
              <p className="text-primarymain font-semibold text-sm md:text-lg">
                Out of Stock !
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-primary font-medium md:text-lg text-sm">
                  Rs. {offeredPrice}
                </p>
                <del className="text-lighttext font-medium text-sm">
                  Rs. {price}
                </del>
              </div>
            )}
          </div>
        )}
      </div>

{/* 
      <button className="mt-4 border border-lighttext rounded-md  inset-shdaow-xs md:px-6 px-4 text-sm py-2  hover:bg-primary/90 hover:text-white hover:border-none cursor-pointer ease-in-out duration-100  w-full flex items-center gap-2 justify-center"
      
  onClick={() => {
    if (!product) return;
    addToCartAction({ productId: product.id, quantity: 1 });
  }}
>
    <Icon icon="mynaui:cart-solid" width="24" height="24" />
  Add to Cart
</button> */}

{product?.id && <AddToCartButton productId={product.id} variant="card" />}

    </main>
  );
};

export default ProductCard;
