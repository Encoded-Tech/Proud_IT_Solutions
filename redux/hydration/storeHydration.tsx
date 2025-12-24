"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";

import { getWishlistAction } from "@/lib/server/fetchers/fetchWishlist";
import { getCartAction } from "@/lib/server/fetchers/fetchCart";
import { setWishlist } from "../features/wishlist/wishListSlice";
import { setCart } from "../features/cart/cartSlice";


export default function StoreHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const hydrateStore = async () => {
      try {
        const [wishlistRes, cartRes] = await Promise.all([
          getWishlistAction(),
          getCartAction(),
        ]);

        if (wishlistRes?.success) {
          dispatch(setWishlist(wishlistRes.wishlist));
        }

        if (cartRes?.success) {
          dispatch(setCart(cartRes.cart));
        }
      } catch (err) {
        console.error("Failed to hydrate store", err);
      }
    };

    hydrateStore();
  }, [dispatch]);

  return null;
}
