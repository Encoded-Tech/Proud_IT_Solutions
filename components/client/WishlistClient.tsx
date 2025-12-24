"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { WishlistItemDTO } from "@/lib/server/mappers/MapWishlist";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setWishlist,
  selectWishlistItems,
  selectWishlistCount,
  removeWishlistItemLocal,
  removeWishlistItem,
} from "@/redux/features/wishlist/wishListSlice";
import { ArrowLeftIcon } from "lucide-react";
import  { addToCartApi } from "./AddToCartButton";
import { setCart } from "@/redux/features/cart/cartSlice";
import toast from "react-hot-toast";
import { removeWishlistAction } from "@/lib/server/actions/wishlist/addToWishlist";

interface WishlistClientProps {
  initialWishlist: WishlistItemDTO[];
}

const WishlistClient = ({ initialWishlist }: WishlistClientProps) => {
  const dispatch = useAppDispatch();

  /** ✅ READ FROM REDUX */
  const wishlist = useAppSelector(selectWishlistItems);
  const wishlistCount = useAppSelector(selectWishlistCount);

  /** ✅ HYDRATE ONCE */
  useEffect(() => {
    dispatch(setWishlist(initialWishlist));
  }, [dispatch, initialWishlist]);

  /** EMPTY STATE */
  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl xl:mx-auto mx-4 my-10">
        <div className="flex flex-col justify-center items-center space-y-6">
          <Image
            src="/empty-cart.png"
            alt="Empty Wishlist"
            width={400}
            height={400}
          />
          <div className="flex flex-col items-center space-y-4">
            <h2 className="font-semibold text-xl">
              Ohh.. Your Wishlist is Empty
            </h2>
            <Link href="/shop">
              <button className="flex items-center gap-2 bg-primary rounded-md p-2 text-white text-sm font-medium">
                <Icon icon="bitcoin-icons:cart-outline" width="24" height="24" />
                Shop Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /** MAIN UI */
  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
     <div className="space-y-3">
        {/* Continue shopping link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition group"
        >
          <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Continue shopping
        </Link>

        {/* Cart heading */}
        <h1 className="text-2xl font-semibold flex items-center mb-8 gap-3">
          Your Wishlist has
          {/* Distinct items count */}
          <span className="bg-primary text-white rounded-full min-w-[24px] h-6 px-2 text-sm flex items-center justify-center shadow-sm">
            {wishlistCount} {/* number of different products */}
          </span>
          items in total
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map(item => {
          const product = item.product;
          const variant = item.variant;

          const price = variant?.price ?? product.price;
          const image =
            variant?.images?.[0] ||
            product.images?.[0] ||
            "/placeholder.png";

          return (
            <div
              key={item._id}
              className="border rounded-xl overflow-hidden hover:shadow-md transition"
            >
              <Link href={`/products/${product.slug}`}>
                <div className="relative w-full h-56 bg-gray-50">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
              </Link>

              <div className="p-4 space-y-3">
                <h3 className="font-medium line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">
                    Rs. {price}
                  </span>

                  <div className="flex items-center gap-3">
                   <button
  className="text-gray-500 hover:text-red-500"
  title="Remove from wishlist"
  onClick={async () => {
    // Optimistic remove locally
    dispatch(removeWishlistItemLocal(item._id));

    try {
      const res = await removeWishlistAction({ productId: item.product._id, variantId: item.variant?._id ?? undefined });

      if (res.success) {
        // Sync with server
        dispatch(removeWishlistItem(res.wishlist));
       toast.success(res.message || "Added to cart!");
      } else {
     toast.error(res.message || "Failed to add to cart");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  }}
>
  <Icon icon="mdi:heart-remove-outline" width={22} />
</button>

                <button
  className="text-gray-500 hover:text-primary"
  title="Add to cart"
  onClick={async () => {
    try {
      const result = await addToCartApi({ productId: item.product._id, quantity: 1 });
      if (result.success) {
        dispatch(setCart(result.data));
        toast.success(result.message || "Added to cart!");
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected server error");
    }
  }}
>
  <Icon icon="mdi:cart-outline" width={22} />
</button>
                    {/* <AddToCartButton productId={item.product._id} quantity={1}>
  <Icon icon="mdi:cart-outline" width={22} className="text-gray-500 hover:text-primary" />
</AddToCartButton> */}

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistClient;
