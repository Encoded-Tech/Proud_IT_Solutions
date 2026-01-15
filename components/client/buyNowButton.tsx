"use client";
import { selectIsAuthenticated, selectUser } from "@/redux/features/auth/userSlice";
import { useAppSelector } from "@/redux/hooks";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface BuyNowButtonProps {
  productId: string;
  variant?: "card" | "page";
  variantId?: string | null;
}

export default function BuyNowButton({
  productId,

  variantId = null,
}: BuyNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isAdmin = isLoggedIn && user?.role === "admin";

  const handleBuyNow = () => {

    if (isAdmin) {
      toast.error("You are admin don't buy your own product");
      return;
    }

    if(!isLoggedIn) {
      toast.error("Please login first to make a purchase");
      router.push("/login");
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      source: "buy_now",
      productId,
    });

    if (variantId) {
      params.set("variantId", variantId);
    }

    router.push(`/checkout?${params.toString()}`);
    setLoading(false);
  };

 const baseStyles =
  "w-full mt-4 border border-lighttext bg-primary text-white rounded-md inset-shadow-xs px-4 py-2 md:px-6 md:py-2 text-sm flex items-center justify-center hover:bg-primary/90 hover:text-white hover:border-none cursor-pointer ease-in-out duration-100";

  return (
    <button onClick={handleBuyNow} className={baseStyles}>
      <Icon icon="mdi:flash" width="24" height="24"  className=" w-4 h-4 md:w-6 md:h-6"  />
      {loading ? "Buying..." : "Buy Now"}
    </button>
  );
}
 