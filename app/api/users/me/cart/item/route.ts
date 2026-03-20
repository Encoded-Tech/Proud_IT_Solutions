import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { withAuth } from "@/lib/HOF/withAuth";
import { withDB } from "@/lib/HOF";
import userModel, { ICartItem } from "@/models/userModel";
import { getAuthUserId } from "@/lib/auth/getAuthUser";

// user-remove-item-from-cart api/users/cart/item
export const DELETE = withAuth(
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const body = await req.json();
    const { productId, variantId } = body;

    if (!productId && !variantId) {
      return NextResponse.json(
        { success: false, message: "productId or variantId is required" },
        { status: 400 }
      );
    }

    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid productId" },
        { status: 400 }
      );
    }

    if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
      return NextResponse.json(
        { success: false, message: "Invalid variantId" },
        { status: 400 }
      );
    }

    const userId = getAuthUserId(req);

    const user = await userModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const originalCartLength = user.cart.length;

    // Remove the item matching productId / variantId
    user.cart = user.cart.filter((item: ICartItem) => {
      const itemProductId =
        typeof item.product === "string" ? item.product : item.product._id?.toString();
      const itemVariantId = item.variant?.toString() || null;

      if (variantId) return itemVariantId !== variantId;
      return itemProductId !== productId;
    });

    if (user.cart.length === originalCartLength) {
      // Nothing was removed
      return NextResponse.json(
        { success: false, message: "No cart item found with the provided id" },
        { status: 404 }
      );
    }
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      data: user.cart,
    });
  }, { resourceName: "cart" }),
  { roles: ["user"] }
);
