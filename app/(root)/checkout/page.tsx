// app/checkout/page.tsx
import CheckoutForm from "@/components/client/CheckoutForm";
import { getCartAction } from "@/lib/server/fetchers/fetchCart";
import { getCurrentUserAction } from "@/lib/server/fetchers/fetchUser";
import CheckoutInstructions from "./checkoutInstruction";
import { Product } from "@/models/productModel";
import { fetchBuildRequestById } from "@/lib/server/fetchers/fetchBuildRequest";

/* ---------------- TYPES ---------------- */
type CheckoutSource = "cart" | "buy_now" | "build";

interface CheckoutCartItem {
  productId: string;
  productName: string;
  price: number;
  variantId: string | null;
  variantName?: string | null;
  quantity: number;
  image?: string;
}

/* ---------------- PAGE ---------------- */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const getParam = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

  const source: CheckoutSource = (getParam(params.source) as CheckoutSource) ?? "cart";

  const productId = getParam(params.productId);
  const variantId = getParam(params.variantId);
  const buildId = getParam(params.buildId);

  let checkoutCartItems: CheckoutCartItem[] = [];

  /* ------------------- BUY NOW ------------------- */
  if (source === "buy_now") {
    if (!productId) throw new Error("Missing productId for buy_now checkout");

    const product = await Product.findById(productId).populate({
      path: "variants",
      match: { isActive: true },
      select: "sku price",
    });

    if (!product || !product.isActive) throw new Error("Product not found or inactive");

    const variant =
      variantId && product.variants?.find((v: { _id: unknown }) => String(v._id) === variantId);

    checkoutCartItems = [
      {
        productId: product._id.toString(),
        productName: product.name,
        price: variant?.price ?? product.price,
        variantId: variant?._id.toString() ?? null,
      
        quantity: 1,
        image: product.images?.[0],
      },
    ];
  }

  /* ------------------- CART ------------------- */
  if (source === "cart") {
    const { cart } = await getCartAction();

    checkoutCartItems = cart.map((item) => ({
      productId: item.product._id.toString(),
      productName: item.product.name,
      price: item.variant?.price ?? item.product.price,
      variantId: item.variant?._id?.toString() ?? null,
 
      quantity: item.quantity,
      image: item.product.images?.[0],
    }));
  }

 /* ------------------- BUILD ------------------- */
if (source === "build") {
  if (!buildId) {
    return <p className="text-red-600">Missing buildId for build checkout</p>;
  }

  const { success, data: build } = await fetchBuildRequestById(buildId);

  if (!success || !build) {
    return <p className="text-red-600">Build request not found</p>;
  }

  if (build.status !== "approved") {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700 rounded">
        <p>
          ⚠️ This build is not approved by admin yet. You cannot checkout this build at the moment.
        </p>
      </div>
    );
  }

  checkoutCartItems = build.parts.map((part) => ({
    productId: part.partId,
    productName: part.name,
    price: part.price,
    variantId: null,
    quantity: part.quantity,
  }));
}


  /* ------------------- CURRENT USER ------------------- */
  const currentUser = await getCurrentUserAction();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">
          {source === "build" ? "Checkout Build" : "Checkout"}
        </h1>

        {/* ---------------- CHECKOUT FORM ---------------- */}
        <CheckoutForm
          user={currentUser}
          cartItems={checkoutCartItems}
          deliveryInfo={{
            name: "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
            country: "",
            instructions: "",
          }}
          paymentMethod="COD"
          source={source}
          buildId={source === "build" ? buildId : undefined}
        />

        {/* ---------------- INSTRUCTIONS ---------------- */}
        <div className="mt-14 rounded-xl border border-gray-200 shadow-md bg-gray-50 px-6 py-6 md:px-8">
          <CheckoutInstructions />
        </div>
      </div>
    </main>
  );
}
