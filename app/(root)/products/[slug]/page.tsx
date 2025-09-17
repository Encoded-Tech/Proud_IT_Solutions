"use client";
import { ProductMock } from "@/data/product-mock";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Loader, Minus, Plus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import ProductImages from "../product-images";
import Review from "../product-review";
import BestSellers from "@/components/products/best-sellers";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

type Tag = {
  id?: string;
  name: string;
};

const ProductPage = ({ params }: PageProps) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState<string>("");
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);

  // Resolve params since this is a client component
  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
      setIsParamsLoaded(true);
    });
  }, [params]);
  console.log(setLoading);
  const productItem = ProductMock.find((prod) => prod.slug === slug);
  if (!productItem) {
    return <div className="text-center mt-20">Product not found</div>;
  }

  // Wait for params to load
  if (!isParamsLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    );
  }
  const {
    name,
    price,
    description,
    media,
    stock,
    featureImage,
    brand,
    category,
    reviews,
    tags,
    isActive,
    avgRating,
    offeredPrice,
    isOfferedPriceActive,
  } = productItem;
  const availableStock = stock;

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => {
      if (prev >= availableStock) {
        toast.error(`Only ${availableStock} items available in stock`);
        return prev;
      }
      return prev + 1;
    });
  };

  return (
    <main className="max-w-6xl xl:mx-auto mx-4 md:my-14 my-8 md:space-y-14 space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/" className="text-lighttext">
          Home
        </Link>{" "}
        /
        <Link href="/shop" className="text-lighttext">
          Gaming
        </Link>{" "}
        /
        <Link href="/" className="font-medium">
          {name}
        </Link>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md border-zinc-200 h-fit p-2">
          <ProductImages media={media} featureImage={featureImage} />
        </div>

        <div className="flex flex-col  space-y-6">
          <p className="text-xs px-4 py-1 rounded-md text-white bg-primary w-fit">
            {category.name}
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
        <Review />
      </div>

      <BestSellers />
    </main>
  );
};

export default ProductPage;
