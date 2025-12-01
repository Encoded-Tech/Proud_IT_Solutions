
import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF/withDB";
import { withAuth } from "@/lib/HOF/withAuth";
import User, { IWishlistItem } from "@/models/userModel";
import mongoose from "mongoose";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { Product, ProductVariant } from "@/models";


//total apis
//user-get-wishlist api/users/wishlist
//user-add-to-wishlist api/users/wishlist
//user-remove-from-wishlist api/users/wishlist


// user-get-wishlist api/users/wishlist
export const GET = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {

    const userId = getAuthUserId(req);
    const user = await User.findById(userId).populate(
      "wishlist.product",
      "name slug image price"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Wishlist fetched successfully",
      data: user.wishlist,
    });
  }, { resourceName: "wishlist" }),

);

// user-add-to-wishlist api/users/wishlist
export const POST = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const body = await req.json();
    let { productId } = body;
    const { variantId } = body;

    if (!productId && !variantId) {
      return NextResponse.json(
        { success: false, message: "productId or variantId is required" },
        { status: 400 }
      );
    }

    let product;
    if (variantId) {
      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        return NextResponse.json(
          { success: false, message: "Invalid variantId" },
          { status: 400 }
        );
      }

      const variant = await ProductVariant.findById(variantId).populate("product", "name slug image price");
      if (!variant) {
        return NextResponse.json(
          { success: false, message: "Variant not found" },
          { status: 404 }
        );
      }

      product = variant.product;
      productId = product._id.toString();
    } else {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return NextResponse.json(
          { success: false, message: "Invalid productId" },
          { status: 400 }
        );
      }

      product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 }
        );
      }
    }
    const userId = getAuthUserId(req);
    // Add only if not already in wishlist
    const user = await User.findById(userId)
      .populate("wishlist.product", "name slug image price");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check for duplicates
    const duplicateExists = user.wishlist.some((item: IWishlistItem) => {
      const itemProductId =
        typeof item.product === "string" ? item.product : item.product._id?.toString();
      const itemVariantId = item.variant?.toString() || null;

      if (itemProductId !== productId) return false;

      if (variantId) {
        return itemVariantId === variantId;
      }

      // If no variant, ensure existing item also has no variant
      return !itemVariantId;
    });

    if (duplicateExists) {
      return NextResponse.json({
        success: true,
        message: "Product already in wishlist",
        data: user.wishlist,
      });
    }

    const wishlistItem = {
      product: productId,
      variant: variantId,
      addedAt: new Date(),
    };
    if (variantId) wishlistItem.variant = variantId;

    user.wishlist.push(wishlistItem);
    await user.save();
    await user.populate({
      path: "wishlist.product",
      select: "name slug image price"
    });

    await user.populate({
      path: "wishlist.variant",
      select: "specs price sku images"
    });

    return NextResponse.json({
      success: true,
      message: "Product added to wishlist",
      data: user.wishlist,
    });
  }, { resourceName: "wishlist" }),

);

// user-remove-from-wishlist api/users/wishlist

export const DELETE = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid productId" },
        { status: 400 }
      );
    }
    const userId = getAuthUserId(req);
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.wishlist = user.wishlist.filter(
      (item: IWishlistItem) => item.product.toString() !== productId
    );

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist",
      data: user.wishlist,
    });
  }, { resourceName: "wishlist" }),
);


