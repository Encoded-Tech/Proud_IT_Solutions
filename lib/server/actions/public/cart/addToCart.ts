// "use server";

// import { FRONTEND_URL } from "@/config/env";
// import { CartItem } from "@/types/product";
// import { cookies } from "next/headers";

// export async function addToCartAction({
//   productId,
//   variantId,
//   quantity = 1,
// }: {
//   productId?: string;
//   variantId?: string;
//   quantity?: number;
// }): Promise<{ success: boolean; cart: CartItem[]; totalItems: number; message?: string }> {
//   try {
//     const cookieStore = await cookies();

//     const res = await fetch(`${FRONTEND_URL}/api/users/cart`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Cookie: cookieStore.toString(),
//       },
//       body: JSON.stringify({ productId, variantId, quantity }),
//       cache: "no-store",
//       credentials: "include", // include cookies if your auth uses cookies
//     });

//     const data = await res.json();
//     const cart: CartItem[] = data.data ?? [];

//     const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

//     if (!res.ok) {
//       return {
//         success: false,
//         cart: [],
//         totalItems: 0,
//         message: data.message || "Failed to add to cart",
//       };
//     }

//     return {
//       success: true,
//       cart,
//       totalItems,
//       message: "Product added to cart successfully",
//     };
//   } catch (error) {
//     console.error("Add to cart error:", error);
//     return {
//       success: false,
//       cart: [],
//       totalItems: 0,
//       message: error instanceof Error ? error.message : "Something went wrong",
//     };
//   }
// }
