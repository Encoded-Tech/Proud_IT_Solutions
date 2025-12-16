"use server";

import { CartItem } from "@/app/api/users/cart/route";
import { FRONTEND_URL } from "@/config/env";
import { cookies } from "next/headers";

export async function addToCartAction({
  productId,
  variantId,
  quantity = 1,
}: {
  productId?: string;
  variantId?: string;
  quantity?: number;
}): Promise<{ success: boolean; cart: CartItem[]; message?: string }> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${FRONTEND_URL}/api/users/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
           Cookie: cookieStore.toString(),
      },
      body: JSON.stringify({ productId, variantId, quantity }),
      cache: "no-store",
      credentials: "include", // include cookies if your auth uses cookies
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, cart: [], message: data.message || "Failed to add to cart" };
    }

    return {
      success: true,
      message: "Product added to cart successfully",
      cart: data.data ?? [],
    };
  } catch (error) {
    console.error("Add to cart error:", error);
    return {
      success: false,
      cart: [],
      message: "Something went wrong",
    };
  }
}
