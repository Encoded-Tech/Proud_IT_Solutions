"use server";

import { cookies } from "next/headers";
import { FRONTEND_URL } from "@/config/env";
import { CartItem } from "@/types/product";

export async function getCartAction(): Promise<{
  success: boolean;
  cart: CartItem[];
  totalItems?: number;
    message?: string; 
 
}> {
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
        message: "Failed to fetch cart",
        cart: [],
      };
    }

    const data = await res.json();
    const cart: CartItem[] = data.data ?? [];

    // total number of items
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    // calculate totals
 
 

    return {
      success: true,
      cart,
      message: "Cart fetched successfully",
      totalItems,
    
    };
  } catch (error) {
    console.error("Fetch cart error:", error);
    return {
      success: false,
      message: `Failed to fetch cart: ${error instanceof Error ? error.message : "Unexpected server error"}`,
      cart: [],
    };
  }
}
