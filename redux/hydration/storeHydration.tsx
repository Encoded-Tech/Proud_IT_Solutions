"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";

import { getWishlistAction } from "@/lib/server/fetchers/fetchWishlist";
import { getCartAction } from "@/lib/server/fetchers/fetchCart";
import { setWishlist } from "../features/wishlist/wishListSlice";
import { setCart } from "../features/cart/cartSlice";
import { useSession } from "next-auth/react";


export default function StoreHydration() {
  const dispatch = useAppDispatch();
    const { status } = useSession();

  useEffect(() => {
    const hydrateStore = async () => {

         if (status !== "authenticated") return;
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
  }, [status, dispatch]);

  return null;
}
