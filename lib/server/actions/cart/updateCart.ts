"use server";
import { connectDB } from "@/db";
import userModel, { ICartItem } from "@/models/userModel";


import mongoose from "mongoose";
import { requireSession } from "@/lib/auth/requireSession";
import { ICartItemPopulated, mapSingleCartItemToDTO } from "../../mappers/MapCart";
import { CartItem } from "@/types/product";

interface UpdateCartQtyParams {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export async function updateCartQuantity(input: UpdateCartQtyParams) {
  const { productId, variantId, quantity } = input;

  if (quantity < 1) {
    return { success: false, message: "Quantity must be at least 1" };
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return { success: false, message: "Invalid productId" };
  }

  if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
    return { success: false, message: "Invalid variantId" };
  }

  await connectDB();

  const userSession = await requireSession({ roles: ["user"], emailVerified: true });

const user = await userModel
  .findById(userSession.id)
  .populate<{ cart: ICartItemPopulated[] }>("cart.product cart.variant");


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

const cartDTO = user.cart.map((item : ICartItemPopulated) => mapSingleCartItemToDTO(item));

  return {
    success: true,
    message: "Cart quantity updated successfully",
   data: cartDTO
}
}




interface RemoveCartItemParams {
  productId: string;
  variantId?: string | null;
}

export async function removeCartItem(input: RemoveCartItemParams) {
  const { productId, variantId } = input;

  if (!productId && !variantId) {
    return { success: false, message: "productId or variantId is required" };
  }

  if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
    return { success: false, message: "Invalid productId" };
  }

  if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
    return { success: false, message: "Invalid variantId" };
  }

  await connectDB();

  const userSession = await requireSession({
    roles: ["user"],
    emailVerified: true,
  });

 const user = await userModel
  .findById(userSession.id)
  .populate<{ cart: ICartItemPopulated[] }>("cart.product cart.variant");



  if (!user) {
    return { success: false, message: "User not found" };
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

const cartDTO = user.cart.map((item : ICartItemPopulated) => mapSingleCartItemToDTO(item));

return {
  success: true,
  message: "Item removed from cart",
  data:cartDTO
};

}
