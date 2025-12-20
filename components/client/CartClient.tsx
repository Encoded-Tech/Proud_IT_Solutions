"use client";
import { useEffect, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { CartItem } from "@/types/product";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "lucide-react";
import {
  removeCartItem,
  updateCartQuantity,
} from "@/lib/server/actions/cart/updateCart";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectCartItems,
  selectCartTotalItems,
  setCart,
  updateCartItem,
  removeCartItemLocal,
  selectCartCount,
} from "@/redux/cart/cartSlice";

interface CartClientProps {
  initialCart: CartItem[];
}

const CartClient = ({ initialCart }: CartClientProps) => {
  const dispatch = useAppDispatch();

  // ✅ Hydrate Redux slice on mount
  useEffect(() => {
    dispatch(setCart(initialCart));
  }, [dispatch, initialCart]);

  // ✅ Select cart items from Redux
  const cart = useAppSelector(selectCartItems);

  const cartItems = useAppSelector(selectCartCount);

  // ✅ Calculate total items dynamically using selector
  const totalItems = useAppSelector(selectCartTotalItems);

  // ✅ Calculate subtotal using useMemo for performance
  const subtotal = useMemo(() => {
    return cart.reduce((acc: number, item: CartItem) => {
      const price = item.variant?.price ?? item.product.price;
      return acc + price * item.quantity;
    }, 0);
  }, [cart]);

 

  const [loadingId, setLoadingId] = useState<string | null>(null); // loading state for buttons

  /** Update cart item quantity */
  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (loadingId === itemId) return; // prevent double click

    const item = cart.find((i: CartItem) => i._id === itemId);
    if (!item) return;

    const prevQty = item.quantity;

    setLoadingId(itemId);

    // 🔄 Optimistic UI update
    dispatch(updateCartItem({ id: itemId, quantity: newQty }));

    try {
      const res = await updateCartQuantity({
        productId:
          typeof item.product === "string" ? item.product : item.product._id,
        variantId: item.variant?._id ?? null,
        quantity: newQty,
      });

      if (!res.success) {
        // rollback on failure
        dispatch(updateCartItem({ id: itemId, quantity: prevQty }));
        toast.error(res.message);
        return;
      }

      // ✅ Sync Redux with server data
      dispatch(setCart(res.data));
      toast.success(res.message);
    } catch (error) {
      // rollback on unexpected error
      dispatch(updateCartItem({ id: itemId, quantity: prevQty }));
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  /** Remove cart item */
  const handleRemoveItem = async (itemId: string) => {
    if (loadingId === itemId) return;

    const item = cart.find((i: CartItem) => i._id === itemId);
    if (!item) return;

    setLoadingId(itemId);

    // Optional optimistic remove
    dispatch(removeCartItemLocal(itemId));

    try {
      const res = await removeCartItem({
        productId: typeof item.product === "string" ? item.product : item.product._id,
        variantId: item.variant?._id ?? null,
      });

      if (!res.success) {
        // rollback if failed
        dispatch(setCart(cart));
        toast.error(res.message);
        return;
      }

      // ✅ Sync Redux with server data
      dispatch(setCart(res.data));
      toast.success(res.message);
    } catch (error) {
      // rollback on unexpected error
      dispatch(setCart(cart));
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  /** Empty cart UI */
  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-7xl xl:mx-auto mx-4 my-10">
        <div className="flex flex-col justify-center items-center space-y-6">
          <Image
            src="/empty-cart.png"
            alt="Empty Cart"
            width={400}
            height={400}
          />
          <div className="flex flex-col items-center space-y-4">
            <h2 className="font-semibold text-xl">Ohh.. Your Cart is Empty</h2>
            <Link href="/shop">
              <button className="flex items-center gap-2 bg-primary rounded-md p-2 text-white text-sm font-medium">
                <Icon icon="bitcoin-icons:cart-outline" width="24" height="24" />
                Shop Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /** Main cart UI */
  return (
    <div>
      <div className="space-y-3">
        {/* Continue shopping link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition group"
        >
          <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Continue shopping
        </Link>

        {/* Cart heading */}
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          Your cart has
          {/* Distinct items count */}
          <span className="bg-primary text-white rounded-full min-w-[24px] h-6 px-2 text-sm flex items-center justify-center shadow-sm">
            {cartItems} {/* number of different products */}
          </span>
          items (
          {/* Total quantity count */}
          <span className="bg-primary text-white rounded-full min-w-[24px] h-6 px-2 text-sm flex items-center justify-center shadow-sm">
            {totalItems} {/* total units */}
          </span>
          units) in total
        </h1>
      </div>

      <div className="max-w-7xl xl:mx-auto mx-4 my-10 flex flex-col lg:flex-row gap-8 items-start">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {cart.map((item: CartItem) => {
            const product = item.product;
            const variant = item.variant;
            const price = variant?.price ?? product.price;
            const availableStock = variant?.stock ?? product.stock;

            return (
              <div
                key={item._id}
                className="flex items-center gap-4 border rounded-md p-4"
              >
                <Image
                  src={variant?.images?.[0] ?? product.images?.[0] ?? "/placeholder.png"}
                  alt={product.name || "Product Image"}
                  width={100}
                  height={100}
                  className="rounded-md"
                />
                <div className="flex-1 flex flex-col gap-1">
                  <h3 className="font-medium">{product.name}</h3>
                  {variant && <p className="text-sm text-gray-500">{variant.specs}</p>}

                  {/* Stock info */}
                  <p
                    className={`text-xs font-medium ${availableStock > 0 ? "text-green-600" : "text-red-500"
                      }`}
                  >
                    {availableStock > 0
                      ? `${availableStock} in stock`
                      : "Out of stock"}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                      disabled={loadingId === item._id || item.quantity <= 1}
                      onClick={() =>
                        handleUpdateQuantity(item._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      disabled={loadingId === item._id || item.quantity >= availableStock}
                      onClick={() =>
                        handleUpdateQuantity(item._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>

                    {/* Remove button */}
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded ml-2"
                      disabled={loadingId === item._id}
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item total price */}
                <div className="font-semibold">Rs. {price * item.quantity}</div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 p-5 border rounded-md bg-white flex flex-col gap-3 shadow-md">
  {/* Header */}
  <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-2">Order Summary</h2>

  {/* Encouraging text */}
  <p className="text-sm text-gray-600">
      You&apos;re almost there! Complete your order by clicking the button below.
  </p>

  {/* Totals */}
  <div className="flex justify-between font-medium text-base">
    <span>Total items</span>
    <span>{totalItems}</span>
  </div>

  <div className="flex justify-between font-medium text-base">
    <span>Total (including tax)</span>
    <span>Rs. {subtotal.toFixed(2)}</span>
  </div>

  {/* Note about prices */}
  <p className="text-xs text-gray-500 italic">
    Prices are final and include all taxes. Please review your order.
  </p>

  {/* Checkout button */}
  <Link href="/checkout" className="mt-3">
    <button className="w-full bg-primary text-white p-3 rounded-md font-medium hover:bg-primary/90 transition transform hover:-translate-y-0.5 hover:scale-105">
      Proceed to Checkout
    </button>
  </Link>
</div>

      </div>
    </div>
  );
};

export default CartClient;
