"use server";

import { connectDB } from "@/db";
import userModel from "@/models/userModel";


import { CartItem } from "@/types/product";
import { ICartItemPopulated, mapCartItemsArrayToDTO } from "../mappers/MapCart";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

interface GetCartActionResponse {
  cart: CartItem[];
  success?: boolean;
  message?: string;
  totalItems?: number;
}

export async function getCartAction(): Promise<GetCartActionResponse> {
  try {
    await connectDB();

  
        const session = await getServerSession(authOptions);
      if (!session?.user?.email) return { cart: [] };

    const user = await userModel
      .findById(session.user.id)
      .populate<{ cart: ICartItemPopulated[] }>({
        path: "cart.product",
        select: "name slug images price stock",
      })
      .populate({
        path: "cart.variant",
        select: "specs price stock images sku",
      })
       .lean<{ cart: ICartItemPopulated[] }>();

    if (!user) {
      return { cart: [] };
    }

    const cartDTO: CartItem[] = mapCartItemsArrayToDTO(user.cart);

    return {
      cart: cartDTO,
      success: true,
      totalItems: cartDTO.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    };
  } catch (error) {
    console.error("getCartAction error:", error);

    // IMPORTANT: always return cart
    return {
      cart: [],
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch cart",
    };
  }
}
