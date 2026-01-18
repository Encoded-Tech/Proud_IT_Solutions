import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { withAuth } from "@/lib/HOF/withAuth";
import { withDB } from "@/lib/HOF";
import { Product, ProductVariant } from "@/models";
import {  getAuthUserId } from "@/lib/auth/getAuthUser";
import userModel, { ICartItem } from "@/models/userModel";
import { CartItem } from "@/types/product";




//total apis
// user-get-cart api/users/cart
//user-add-to-cart api/users/cart
//user-update-cart-item api/users/cart/
//user-remove-from-cart api/users/cart




// interface LeanCartItem {
//   _id: string;
//   product: {
//     _id: string;
//     name: string;
//     slug: string;
//     price: number;
//     stock: number;
//     images: string[];
//   };
//   variant?: {
//     _id: string;
//     specs: string;
//     price: number;
//     stock: number;
//     images: string[];
//     sku: string;
//   };
//   quantity: number;
//   addedAt: Date;
//   updatedAt: Date;
// }



// user-get-cart api/users/cart
// export const GET = withAuth(
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   withDB(async (req: NextRequest, context?) => {
// const userId = await getAuthUserId(req);


//     const user = await userModel
//   .findById(userId)
//   .populate({
//     path: "cart.product",
//     select: "name slug images price stock",
//   })
//   .populate({
//     path: "cart.variant",
//     select: "specs price stock images sku",
//   })
//   .lean<{ cart: LeanCartItem[] }>();

// if (!user) {
//   return NextResponse.json(
//     { success: false, message: "User not found" },
//     { status: 404 }
//   );
// }

// const cartWithRemaining: ReadonlyArray<CartItem> = user.cart.map((item) => {
//   const stock = item.variant
//     ? item.variant.stock
//     : item.product.stock;

//   return {
//     _id: item._id,
//     product: item.product,
//     variant: item.variant ?? null,
//     quantity: item.quantity,
//     addedAt: item.addedAt.toISOString(),
//     updatedAt: item.updatedAt.toISOString(),
//     remainingStock: Math.max(stock - item.quantity, 0),
//   };

//     });
//     return NextResponse.json({
//       success: true,
//       message: "Cart fetched successfully",
//       data: cartWithRemaining,
//     });
//   }, { resourceName: "cart" }),
//   { roles: ["user"] }
// )

// user-add-to-cart api/users/cart
export const POST = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const body = await req.json();
    let { productId } = body;
    const { variantId, quantity } = body;

    if (!productId && !variantId) {
      return NextResponse.json(
        { success: false, message: "productId or variantId is required" },
        { status: 400 }
      );
    }

    let product;
    let stock: number;

    // Handle variant
    if (variantId) {
      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        return NextResponse.json(
          { success: false, message: "Invalid variantId" },
          { status: 400 }
        );
      }

      const variant = await ProductVariant.findById(variantId).populate("product", "name slug image price stock");
      if (!variant) {
        return NextResponse.json(
          { success: false, message: "Variant not found" },
          { status: 404 }
        );
      }

      product = variant.product;
      stock = variant.stock;
      productId = product._id.toString(); // parent product id
    } else {
      // Product without variant
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
      stock = product.stock;
    }

    const userId = await getAuthUserId(req);
    const user = await userModel.findById(userId).populate("cart.product cart.variant");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const qty = quantity && quantity > 0 ? quantity : 1;

    // Check for existing cart item
 const existingIndex = user.cart.findIndex((item: CartItem) => {
  const itemProductId = typeof item.product === "string" ? item.product : item.product._id?.toString();
  const itemVariantId = item.variant?.toString() || null;

  if (itemProductId !== productId) return false;
  if (variantId) return itemVariantId === variantId;
  return !itemVariantId;
});



    // Determine current quantity if item exists
    const currentQty = existingIndex !== -1 ? user.cart[existingIndex].quantity : 0;

    // Check stock limit
    if (currentQty + qty > stock) {
      return NextResponse.json({
        success: false,
        message: `Stock had ${stock} items. You added all of them now they are out of stock, please pruchase what you have in cart.`,
      }, { status: 400 });
    }

    if (existingIndex !== -1) {
      // Increment quantity
      user.cart[existingIndex].quantity += qty;
      user.cart[existingIndex].updatedAt = new Date();
    } else {
      // Add new cart item
      const newItem = {
        product: productId,
        variant: variantId || undefined,
        quantity: qty,
        addedAt: new Date(),
        updatedAt: new Date(),
      };
      user.cart.push(newItem);
    }

    await user.save();

    // Populate cart items
    await user.populate({
      path: "cart.product",
      select: "name slug image price stock",
    });
    await user.populate({
      path: "cart.variant",
      select: "specs price sku images stock",
    });

    return NextResponse.json({
      success: true,
      message: "Product added to cart successfully",
      data: user.cart,
    });
  }, { resourceName: "cart" }),
  { roles: ["user"] }
);

// user-update-cart-item-quantity api/users/cart/
export const PUT = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const { productId, variantId, quantity } = await req.json();

    if (!productId && !variantId) {
      return NextResponse.json(
        { success: false, message: "productId or variantId is required" },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

const userId = await getAuthUserId(req);

    const user = await userModel
      .findById(userId)
      .populate("cart.product cart.variant");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find cart item
    const cartItem = user.cart.find((item: ICartItem) => {
      const itemProductId =
        typeof item.product === "string" ? item.product : item.product._id.toString();

      const itemVariantId = item.variant?.toString() || null;

      if (itemProductId !== productId) return false;
      if (variantId) return itemVariantId === variantId;
      return !itemVariantId;
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    // Determine stock
    const stock = cartItem.variant
      ? cartItem.variant.stock
      : cartItem.product.stock;

    if (quantity > stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${stock} items available in stock`,
        },
        { status: 400 }
      );
    }

    // Update quantity
    cartItem.quantity = quantity;
    cartItem.updatedAt = new Date();

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Cart quantity updated successfully",
      data: user.cart,
    });
  }, { resourceName: "cart" }),
  { roles: ["user"] }
);

// user-remove-from-cart api/users/cart
export const DELETE = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
  const userId = await getAuthUserId(req);

    const user = await userModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Clear cart
    user.cart = [];
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
      data: user.cart, // will be empty
    });
  }, { resourceName: "cart" }),
  { roles: ["user"] }
);




