"use client";

import { selectCartTotalItems } from "@/redux/features/cart/cartSlice";
import { selectWishlistCount } from "@/redux/features/wishlist/wishListSlice";
import { useAppSelector } from "@/redux/hooks";

export default function AccountStats() {
  const cartItemsCount = useAppSelector(selectCartTotalItems);
  const wishlistCount = useAppSelector(selectWishlistCount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Stat title="Orders" value="—" subtitle="Total placed" />
        <Stat
        title="Wishlist"
        value={wishlistCount.toString()}
        subtitle="Saved items"
      />
      <Stat
        title="Cart Items"
        value={cartItemsCount.toString()}
        subtitle="Currently in cart"
      />
    </div>
  );
}

function Stat({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <p className="font-semibold text-lg text-gray-700">{title}</p>
      <p className="text-lg text-gray-600 font-semibold mt-1">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
