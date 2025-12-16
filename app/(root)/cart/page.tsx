export const dynamic = "force-dynamic";

import CartPage from "@/components/server/ListCart";
import React from "react";

const Cart = () => {
  return (
    <div className="max-w-7xl xl:mx-auto mx-4 my-10">
      <CartPage />
    </div>
  );
};

export default Cart;
