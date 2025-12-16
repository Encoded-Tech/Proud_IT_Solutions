"use server";
import { connectDB } from "@/db";
import userModel, { ICartItem } from "@/models/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { CartItem } from "@/app/api/users/cart/route";
import mongoose from "mongoose";

interface UpdateCartQtyParams {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export async function updateCartQuantity({
  productId,
  variantId,
  quantity,
}: UpdateCartQtyParams) {
  if (quantity < 1) {
    return { success: false, message: "Quantity must be at least 1" };
  }

  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const user = await userModel
    .findById(session.user.id)
    .populate("cart.product cart.variant");

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const cartItem = user.cart.find((item: CartItem) => {
    const itemProductId =
      typeof item.product === "string"
        ? item.product
        : item.product._id.toString();

    const itemVariantId = item.variant?._id?.toString() ?? null;

    if (itemProductId !== productId) return false;
    if (variantId) return itemVariantId === variantId;
    return !itemVariantId;
  });

  if (!cartItem) {
    return { success: false, message: "Cart item not found" };
  }

  const stock = cartItem.variant
    ? cartItem.variant.stock
    : cartItem.product.stock;

  if (quantity > stock) {
    return {
      success: false,
      message: `Only ${stock} items available in stock`,
    };
  }

  cartItem.quantity = quantity;
  cartItem.updatedAt = new Date();

  await user.save();



  return {
    success: true,
    message: "Cart quantity updated successfully",
   data: user.cart.map((item: CartItem) => ({
    _id: item._id,
    quantity: item.quantity,
    product: {
      _id: typeof item.product === "string" ? item.product : item.product._id,
      name: item.product.name,
      price: item.product.price,
      stock: item.product.stock,
      slug: item.product.slug,
      images: item.product.images,
    },
    variant: item.variant
      ? {
          _id: item.variant._id,
          price: item.variant.price,
          stock: item.variant.stock,
          specs: item.variant.specs,
          images: item.variant.images,
        }
      : null,
  })),
  };
}




interface RemoveCartItemParams {
  productId: string;
  variantId?: string | null;
}

export async function removeCartItem({ productId, variantId }: RemoveCartItemParams) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const user = await userModel.findById(session.user.id);
  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (!productId && !variantId) {
    return { success: false, message: "productId or variantId is required" };
  }

  if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
    return { success: false, message: "Invalid productId" };
  }

  if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
    return { success: false, message: "Invalid variantId" };
  }

  const originalCartLength = user.cart.length;

  // Filter out the item
  user.cart = user.cart.filter((item: ICartItem) => {
    const itemProductId =
      typeof item.product === "string" ? item.product : item.product._id?.toString();
 const itemVariantId = item.variant?._id?.toString() ?? null;


    if (variantId) return itemVariantId !== variantId;
    return itemProductId !== productId;
  });

  if (user.cart.length === originalCartLength) {
    return { success: false, message: "No cart item found with the provided id" };
  }

  await user.save();

  return {
    success: true,
    message: "Item removed from cart",
    data:  user.cart.map((item: CartItem) => ({
    _id: item._id,
    quantity: item.quantity,
    product: {
      _id: typeof item.product === "string" ? item.product : item.product._id,
      name: item.product.name,
      price: item.product.price,
      stock: item.product.stock,
      slug: item.product.slug,
      images: item.product.images,
    },
    variant: item.variant
      ? {
          _id: item.variant._id,
          price: item.variant.price,
          stock: item.variant.stock,
          specs: item.variant.specs,
          images: item.variant.images,
        }
      : null,
  })),
  };
}
