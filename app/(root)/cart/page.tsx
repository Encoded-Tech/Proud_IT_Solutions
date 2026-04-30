import CartPage from "@/components/server/ListCart";
import React from "react";
import { buildNoIndexMetadata } from "@/app/seo/utils/metadata";
import { connection } from "next/server";

export const metadata = buildNoIndexMetadata({
  title: "Cart",
  description: "Review products in your cart before checkout.",
  path: "/cart",
});

const Cart = async () => {
  await connection();
  return (
    <div className="max-w-7xl xl:mx-auto mx-4 my-10">
      <CartPage />
    </div>
  );
};

export default Cart;
