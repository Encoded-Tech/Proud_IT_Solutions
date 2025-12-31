"use server";
import { connectDB } from "@/db";
import User, { IWishlistItem } from "@/models/userModel";
import { Product, ProductVariant } from "@/models";
import mongoose from "mongoose";
import { mapWishlistArray, WishlistItemDTO } from "../../../mappers/MapWishlist";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

interface WishlistActionParams {
  productId?: string;
  variantId?: string;
}

interface WishlistActionResponse {
  wishlist: WishlistItemDTO[];
  success?: boolean;
  message?: string;
  totalItems?: number;
}

export async function addWishlistAction({
  productId,
  variantId,
}: WishlistActionParams): Promise<WishlistActionResponse> {
  try {
    await connectDB();

    if (!productId && !variantId) {
      throw new Error("productId or variantId is required");
    }
  const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { wishlist: [] };

    // Resolve product document
    let productDoc: InstanceType<typeof Product> | null;
    let variantDoc: InstanceType<typeof ProductVariant> | null = null;

    if (variantId) {
      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        throw new Error("Invalid variantId");
      }

      variantDoc = await ProductVariant.findById(variantId).populate("product");
      if (!variantDoc) throw new Error("Variant not found");

      productDoc = variantDoc.product as InstanceType<typeof Product>;
      productId = productDoc._id.toString();
    } else {
      if (!mongoose.Types.ObjectId.isValid(productId!)) {
        throw new Error("Invalid productId");
      }

      productDoc = await Product.findById(productId);
      if (!productDoc) throw new Error("Product not found");
    }

    // Fetch user with wishlist populated
    const user = await User.findById(session.user.id)
      .populate<{ wishlist: IWishlistItem[] }>({
        path: "wishlist.product",
        select: "name slug images price",
      })
      .populate({
        path: "wishlist.variant",
        select: "specs price sku images",
      });

    if (!user) throw new Error("User not found");

    // Check for duplicates
    const duplicateExists = user.wishlist.some((item: IWishlistItem) => {
        if (!item.product) return false;
      const itemProductId =
        typeof item.product === "string" ? item.product : item.product._id.toString();
      const itemVariantId = item.variant?.toString() || null;

      if (itemProductId !== productId) return false;
      if (variantId) return itemVariantId === variantId;
      return !itemVariantId;
    });

    if (duplicateExists) {
      const wishlistDTO: WishlistItemDTO[] = await mapWishlistArray(user.wishlist);
      return {
        wishlist: wishlistDTO,
        success: true,
        message: "Product already in wishlist",
        totalItems: wishlistDTO.length,
      };
    }

    // Create new wishlist item
const wishlistItem: IWishlistItem = {

  product: new mongoose.Types.ObjectId(productId), // correctly typed
  variant: variantId ? new mongoose.Types.ObjectId(variantId) : undefined,
  addedAt: new Date(),
} as IWishlistItem;
    user.wishlist.push(wishlistItem);
    await user.save();

    const wishlistDTO: WishlistItemDTO[] = await mapWishlistArray(user.wishlist);

    return {
      wishlist: wishlistDTO,
      success: true,
      message: "Product added to wishlist",
      totalItems: wishlistDTO.length,
    };
  } catch (error) {
    console.error("addWishlistAction error:", error);
    return {
      wishlist: [],
      success: false,
      message: error instanceof Error ? error.message : "Failed to add to wishlist",
    };
  }
}


// Remove from wishlist

export async function removeWishlistAction({
  productId,
  variantId,
}: WishlistActionParams): Promise<WishlistActionResponse> {
  try {
    await connectDB();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid productId");
    }

     const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { wishlist: [] };

    const user = await User.findById(session.user.id)
      .populate<{ wishlist: IWishlistItem[] }>({
        path: "wishlist.product",
        select: "name slug images price",
      })
      .populate({
        path: "wishlist.variant",
        select: "specs price sku images",
      });
    if (!user) throw new Error("User not found");

    user.wishlist = user.wishlist.filter((item: IWishlistItem) => {
      const itemProductId = typeof item.product === "string" ? item.product : item.product._id.toString();
      const itemVariantId = item.variant?.toString() || null;

      if (variantId) return !(itemProductId === productId && itemVariantId === variantId);
      return !(itemProductId === productId && !itemVariantId);
    });

    await user.save();

    const wishlistDTO = await mapWishlistArray(user.wishlist);
    return {
      wishlist: wishlistDTO,
      success: true,
      message: "Product removed from wishlist",
      totalItems: wishlistDTO.length,
    };
  } catch (error) {
    console.error("removeWishlistAction error:", error);
    return {
      wishlist: [],
      success: false,
      message: error instanceof Error ? error.message : "Failed to remove from wishlist",
    };
  }
}