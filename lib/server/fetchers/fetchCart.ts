"use server";

import { cookies } from "next/headers";
import { FRONTEND_URL } from "@/config/env";
import { CartItem } from "@/app/api/users/cart/route";

export async function getCartAction(): Promise<{ success: boolean; cart: CartItem[] }> {
  try {
    const cookieStore = await cookies();

    const res = await fetch(`${FRONTEND_URL}/api/users/cart`, {
      method: "GET",
      headers: {
        Cookie: cookieStore.toString(), 
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        cart: [],
      };
    }

    const data = await res.json();

    return {
      success: true,
      cart: data.data ?? [],
    };
  } catch (error) {
    console.error("Fetch cart error:", error);
    return {
      success: false,
      cart: [],
    };
  }
}
