"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setCart } from "@/redux/cart/cartSlice";
import { getCartAction } from "@/lib/server/fetchers/fetchCart";


export default function CartHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { success, cart } = await getCartAction();

        if (success) {
          // Replace persisted cart with server cart
          dispatch(setCart(cart));
        }
      } catch (err) {
        console.error("Failed to fetch server cart", err);
      }
    };

    fetchCart();
  }, [dispatch]);

  return null;
}
