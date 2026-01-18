"use client";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useState } from "react";

import { setCart } from "@/redux/features/cart/cartSlice";
import { selectAuthHydrated, selectIsAuthenticated, selectUser } from "@/redux/features/auth/userSlice";

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  variant?: "card" | "page"; // new prop for style variant
  quantity?: number; // allow custom quantity if needed
  children?: React.ReactNode;
  productSlug?: string;
  
}

export async function addToCartApi({
  productId,
  quantity = 1,
  variantId,

}: {
  productId: string;
  quantity?: number;
  variantId?: string;
}) {
  const res = await fetch("/api/users/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 
    body: JSON.stringify({ productId, variantId, quantity,  }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to add to cart");
  }

  return data;
}


const AddToCartButton = ({ productId, variantId,  productSlug, variant = "page", quantity = 1, children }: AddToCartButtonProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const authHydrated = useAppSelector(selectAuthHydrated);
  const user = useAppSelector(selectUser);

  const isAdmin = isLoggedIn && user?.role === "admin";


  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {

    if (isAdmin) {
      toast.error("You are admin don't buy your own product");
      return;
    }

    if (!authHydrated) {
      toast.loading("Checking login...");
      return;
    }
     if (!isLoggedIn) {
    toast.error("Please login first to add to cart");

    // Redirect logic
    if (productSlug) {
      router.push(`/login?redirect=/products/${productSlug}`);
    } else {
      router.push("/login"); // fallback if no slug
    }
    return;
  }

    setLoading(true);
    try {
   
      const result = await addToCartApi({ productId, quantity, variantId });
      console.log(result);

      if (result.success) {
        // Update Redux slice
        dispatch(setCart(result.data));

        toast.success(result.message || "Added to cart!");
        if (variant === "page") router.push("/cart");
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected server error");
    } finally {
      setLoading(false);
    }
  };

  const baseStyles =
    "flex items-center gap-2 justify-center text-sm rounded-md cursor-pointer ease-in-out duration-100";

const variantStyles =
  variant === "card"
    ? "w-full mt-4 border border-lighttext  rounded-md inset-shadow-xs text-xs px-2 py-2 md:px-4 md:py-2 md:text-sm flex items-center justify-center hover:bg-primary/90 hover:text-white hover:border-none cursor-pointer ease-in-out duration-100"
   : "w-auto uppercase px-4 py-2 md:px-5 md:py-2.5 rounded-md bg-primary text-white text-sm hover:bg-primary/90 flex items-center gap-2";


  return (
    <button
      className={`${baseStyles} ${variantStyles} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={handleAddToCart}
      disabled={loading}
    >{children ?? (
      <>
        <Icon icon="mynaui:cart-solid" width="24" height="24" className=" w-4 h-4 md:w-6 md:h-6" />
        {loading ? "Adding..." : "Add to Cart"}</>
    )}

    </button>
    
  );
};

export default AddToCartButton;
