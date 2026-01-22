  import CartClient from "@/components/client/CartClient";
  import { getCartAction } from "@/lib/server/fetchers/fetchCart";
  import { CartItem } from "@/types/product";

  const CartPage = async () => {
    const { cart }: { cart: CartItem[] } = await getCartAction();
    const initialCart = Array.isArray(cart) ? cart : [];


    return (
      
      <CartClient initialCart={initialCart} />
    );
  };

  export default CartPage;

