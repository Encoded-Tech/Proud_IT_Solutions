import { CartItem } from "@/app/api/users/cart/route";
import CartClient from "@/components/client/CartClient";
import { getCartAction } from "@/lib/server/fetchers/fetchCart";

const CartPage = async () => {
  const { cart }: { cart: CartItem[] } = await getCartAction();

  const initialCart = Array.isArray(cart) ? cart : [];

  console.log("initialCart", initialCart);

  return <CartClient initialCart={initialCart} />;
};

export default CartPage;

