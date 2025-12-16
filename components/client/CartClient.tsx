
"use client";

import { useState, useMemo } from "react";
import { CartItem } from "@/app/api/users/cart/route";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { removeCartItem, updateCartQuantity } from "@/lib/server/actions/cart/updateCart";
import toast from "react-hot-toast";


interface CartClientProps {
  initialCart: CartItem[];
}

const CartClient = ({ initialCart }: CartClientProps) => {
  const [cart, setCart] = useState<CartItem[]>(initialCart || []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);




  // Calculate totals dynamically
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.variant?.price ?? item.product.price;
      return acc + price * item.quantity;
    }, 0);
  }, [cart]);

  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateQuantity = async (itemId: string, newQty: number) => {
    // prevent double click
    if (loadingId === itemId) return;

    const item = cart.find((i) => i._id === itemId);
    if (!item) return;

    const prevQty = item.quantity;

    setLoadingId(itemId);

    // 🔄 Optimistic UI
    setCart((prev) =>
      prev.map((i) =>
        i._id === itemId ? { ...i, quantity: newQty } : i
      )
    );

    try {
      const res = await updateCartQuantity({
        productId:
          typeof item.product === "string"
            ? item.product
            : item.product._id,
        variantId: item.variant?._id ?? null,
        quantity: newQty,
      });

      if (!res.success) {
        // rollback
        setCart((prev) =>
          prev.map((i) =>
            i._id === itemId ? { ...i, quantity: prevQty } : i
          )
        );


        toast.error(res.message);
        return;
      }

      setCart(res.data);
      toast.success(res.message);
    } catch (error) {
      // rollback on unexpected error
      setCart((prev) =>
        prev.map((i) =>
          i._id === itemId ? { ...i, quantity: prevQty } : i
        )
      );

      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }


  };

    const removeItem = async (itemId: string) => {
    if (loadingId === itemId) return;

    const item = cart.find((i) => i._id === itemId);
    if (!item) return;

    setLoadingId(itemId);

    try {
      const res = await removeCartItem({
        productId: typeof item.product === "string" ? item.product : item.product._id,
        variantId: item.variant?._id ?? null,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      setCart(res.data);
      toast.success(res.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };
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

  return (
    <div>
      <h1 className="relative text-2xl font-semibold inline-flex items-center gap-2">
        Your Cart has
        <span className="bg-red-500 text-white rounded-full min-w-[20px] h-5 px-1 text-xs flex items-center justify-center">
          {totalItems} items
        </span>
      </h1>

      <div className="max-w-7xl xl:mx-auto mx-4 my-10 flex flex-col lg:flex-row gap-8 items-start">

        {/* Cart Items */}
        <div className="flex-1 space-y-4">


          {cart.map((item) => {
            const product = item.product;
            const variant = item.variant;
            const price = variant?.price ?? product.price;
            const availableStock = variant?.stock ?? product.stock;

            return (
              <div key={item._id} className="flex items-center gap-4 border rounded-md p-4">
                <Image
                  src={variant?.images?.[0] || product.images[0]}
                  alt={product.name}
                  width={100}
                  height={100}
                  className="rounded-md"
                />

                <div className="flex-1 flex flex-col gap-1">
                  <h3 className="font-medium">{product.name}</h3>

                  {variant && <p className="text-sm text-gray-500">{variant.specs}</p>}
                  {/* Stock info */}
                  <p
                    className={`text-xs font-medium ${(variant?.stock ?? product.stock) > 0
                      ? "text-green-600"
                      : "text-red-500"
                      }`}
                  >
                    {(variant?.stock ?? product.stock) > 0
                      ? `${variant?.stock ?? product.stock} in stock`
                      : "Out of stock"}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                      disabled={loadingId === item._id || item.quantity <= 1}
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      disabled={loadingId === item._id || item.quantity >= availableStock}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                    {/* Remove button */}
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded ml-2"
                      disabled={loadingId === item._id}
                      onClick={() => removeItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="font-semibold">Rs. {price * item.quantity}</div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 p-6 border rounded-md bg-white h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax (13%)</span>
            <span>Rs. {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg mb-4 border-t pt-2">
            <span>Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>

          <Link href="/checkout">
            <button className="w-full bg-primary text-white p-3 rounded-md font-medium hover:bg-primary/90 transition">
              Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartClient;