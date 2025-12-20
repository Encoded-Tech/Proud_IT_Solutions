"use client";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { useState } from "react";
import { addToCartAction } from "@/lib/server/actions/cart/addToCart";
import { setCart } from "@/redux/cart/cartSlice";

interface AddToCartButtonProps {
  productId: string ;
  variant?: "card" | "page"; // new prop for style variant
  quantity?: number; // allow custom quantity if needed
}

const AddToCartButton = ({ productId, variant = "page", quantity = 1 }: AddToCartButtonProps) => {
const dispatch = useAppDispatch();
  const router = useRouter();

const [loading, setLoading] = useState(false);

const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Call your server action directly
      const result = await addToCartAction({ productId, quantity });

      if (result.success) {
        // Update Redux slice
        dispatch(setCart(result.cart ));

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
