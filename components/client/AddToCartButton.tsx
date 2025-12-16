"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { addToCartAction } from "@/lib/server/actions/cart/addToCart"; // your server action
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string | undefined;
}

const AddToCartButton = ({ productId }: AddToCartButtonProps) => {
  const [loading, setLoading] = useState(false);

    const router = useRouter();

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const res = await addToCartAction({ productId, quantity: 1 });

      if (res.success) {
        toast.success("Added to cart!");
        router.push("/cart");
      } else {
        toast.error(res.message || "Failed to add to cart");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`mt-4 border border-lighttext rounded-md inset-shadow-xs md:px-6 px-4 text-sm py-2 w-full flex items-center gap-2 justify-center
        hover:bg-primary/90 hover:text-white hover:border-none cursor-pointer ease-in-out duration-100
        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={handleAddToCart}
      disabled={loading}
    >
      <Icon icon="mynaui:cart-solid" width="24" height="24" />
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;
