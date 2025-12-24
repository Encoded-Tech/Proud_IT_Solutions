"use server";

import { connectDB } from "@/db";
import User, { IWishlistItem } from "@/models/userModel";

import { mapWishlistArray, WishlistItemDTO } from "../mappers/MapWishlist";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";



interface GetWishlistActionResponse {
  wishlist: WishlistItemDTO[];
  success?: boolean;
  message?: string;
  totalItems?: number;
}

export async function getWishlistAction(): Promise<GetWishlistActionResponse> {
  try {
    await connectDB();

      const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { wishlist: [] };

    const user = await User.findOne({ email: session.user.email })
      .populate<{ wishlist: IWishlistItem[] }>({
        path: "wishlist.product",
        select: "name slug images price",
      })
      .populate({
        path: "wishlist.variant",
        select: "specs price sku images",
      })
      .lean<{ wishlist: IWishlistItem[] }>();

    if (!user) {
      return { wishlist: [] };
    }

    const wishlistDTO: WishlistItemDTO[] = await mapWishlistArray(user.wishlist);

    return {
      wishlist: wishlistDTO,
      success: true,
      totalItems: wishlistDTO.length,
    };
  } catch (error) {
    console.error("getWishlistAction error:", error);
    return {
      wishlist: [],
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch wishlist",
    };
  }
}
