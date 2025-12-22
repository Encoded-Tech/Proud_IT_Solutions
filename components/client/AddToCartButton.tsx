"use client";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useState } from "react";

import { setCart } from "@/redux/cart/cartSlice";
import { selectAuthHydrated, selectIsAuthenticated } from "@/redux/user/userSlice";

interface AddToCartButtonProps {
  productId: string ;
  variant?: "card" | "page"; // new prop for style variant
  quantity?: number; // allow custom quantity if needed
}

async function addToCartApi({
  productId,
  quantity = 1,
}: {
  productId: string;
  quantity?: number;
}) {
  const res = await fetch("/api/users/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 
    body: JSON.stringify({ productId, quantity }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to add to cart");
  }

  return data;
}


const AddToCartButton = ({ productId, variant = "page", quantity = 1 }: AddToCartButtonProps) => {
const dispatch = useAppDispatch();
  const router = useRouter();
    const isLoggedIn = useAppSelector(selectIsAuthenticated);
    const authHydrated = useAppSelector(selectAuthHydrated);


const [loading, setLoading] = useState(false);

const handleAddToCart = async () => {

  if (!authHydrated) {
    toast.loading("Checking login...");
    return;
  }
     if (!isLoggedIn) {
      toast.error("Please login first!");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      // Call your server action directly
      const result = await addToCartApi({ productId, quantity });
      console.log(result);

      if (result.success) {
        // Update Redux slice
        dispatch(setCart(result.data ));

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
      ? "w-full mt-4 border border-lighttext rounded-md inset-shadow-xs md:px-6 px-4 text-sm py-2 w-full flex items-center gap-2 justify-center hover:bg-primary/90 hover:text-white hover:border-none cursor-pointer ease-in-out duration-100"
      : "py-3 px-4 rounded-md bg-primary text-white text-sm hover:bg-primary/90";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={handleAddToCart}
      disabled={loading}
    >
      <Icon icon="mynaui:cart-solid" width="24" height="24" />
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;
