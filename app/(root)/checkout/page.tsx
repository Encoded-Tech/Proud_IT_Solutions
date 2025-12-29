// app/checkout/page.tsx
import CheckoutForm from "@/components/client/CheckoutForm";
import { getCartAction } from "@/lib/server/fetchers/fetchCart";
import { getCurrentUserAction } from "@/lib/server/fetchers/fetchUser";
import CheckoutInstructions from "./checkoutInstruction";
import { Product } from "@/models/productModel";

/* ---------------- TYPES ---------------- */

type CheckoutSource = "cart" | "buy_now";



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

// export default async function CheckoutPage({
//   searchParams,
// }: {
//   searchParams:Record<string, string | string[] | undefined>;
// }) {
//     const params = await searchParams;

//       const getParam = (v?: string | string[]) =>
//     Array.isArray(v) ? v[0] : v;

//       const source: CheckoutSource =
//     (getParam(params.source) as CheckoutSource) ?? "cart";
    
//   const typedSearchParams =  searchParams as CheckoutSearchParams;


//   let checkoutCartItems: CheckoutCartItem[] = [];

//   if (source === "buy_now") {
//     if (!typedSearchParams.productId) {
//       throw new Error("Missing productId for buy_now checkout");
//     }

//     const product = await Product.findById(typedSearchParams.productId)
//       .populate({
//         path: "variants",
//         match: { isActive: true },
//         select: "sku price",
//       });

//     if (!product || !product.isActive) {
//       throw new Error("Product not found or inactive");
//     }

//     const variant =
//       typedSearchParams.variantId &&
//       product.variants?.find(
//         (v: { _id: unknown }) =>
//           String(v._id) === typedSearchParams.variantId
//       );

//     checkoutCartItems = [
//       {
//         productId: product._id.toString(),
//         productName: product.name,
//         price: variant?.price ?? product.price,
//         variantId: variant?._id.toString() ?? null,
//         variantName: variant?.sku ?? null,
//         quantity: 1,
//         image: product.images?.[0],
//       },
//     ];
//   }

//   if (source === "cart") {
//     const { cart } = await getCartAction();

//     checkoutCartItems = cart.map<CheckoutCartItem>((item) => ({
//       productId: item.product._id.toString(),
//       productName: item.product.name,
//       price: item.variant?.price ?? item.product.price,
//       variantId: item.variant?._id?.toString() ?? null,
//       variantName: item.variant?.sku ?? null,
//       quantity: item.quantity,
//       image: item.product.images?.[0],
//     }));
//   }

//   const currentUser = await getCurrentUserAction();

//   return (
//     <main className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 py-10">
//         <CheckoutForm
//           user={currentUser}
//           cartItems={checkoutCartItems}
//           deliveryInfo={{
//             name: "",
//             phone: "",
//             address: "",
//             city: "",
//             postalCode: "",
//             country: "",
//             instructions: "",
//           }}
//           paymentMethod="COD"
//              source={searchParams?.productId ? "buy_now" : "cart"}
//         />

//         <div className="mt-14 rounded-xl border border-gray-200 shadow-md bg-gray-50 px-6 py-6 md:px-8">
//           <CheckoutInstructions />
//         </div>
//       </div>
//     </main>
//   );
// }
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const getParam = (v?: string | string[]) =>
    Array.isArray(v) ? v[0] : v;

  const source: CheckoutSource =
    (getParam(params.source) as CheckoutSource) ?? "cart";

  const productId = getParam(params.productId);
  const variantId = getParam(params.variantId);

  let checkoutCartItems: CheckoutCartItem[] = [];

  if (source === "buy_now") {
    if (!productId) {
      throw new Error("Missing productId for buy_now checkout");
    }

    const product = await Product.findById(productId).populate({
      path: "variants",
      match: { isActive: true },
      select: "sku price",
    });

    if (!product || !product.isActive) {
      throw new Error("Product not found or inactive");
    }

    const variant =
      variantId &&
      product.variants?.find(
        (v: { _id: unknown }) => String(v._id) === variantId
      );

    checkoutCartItems = [
      {
        productId: product._id.toString(),
        productName: product.name,
        price: variant?.price ?? product.price,
        variantId: variant?._id.toString() ?? null,
        variantName: variant?.sku ?? null,
        quantity: 1,
        image: product.images?.[0],
      },
    ];
  }

  if (source === "cart") {
    const { cart } = await getCartAction();

    checkoutCartItems = cart.map((item) => ({
      productId: item.product._id.toString(),
      productName: item.product.name,
      price: item.variant?.price ?? item.product.price,
      variantId: item.variant?._id?.toString() ?? null,
      variantName: item.variant?.sku ?? null,
      quantity: item.quantity,
      image: item.product.images?.[0],
    }));
  }

  const currentUser = await getCurrentUserAction();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
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
          source={productId ? "buy_now" : "cart"}   
        />

        <div className="mt-14 rounded-xl border border-gray-200 shadow-md bg-gray-50 px-6 py-6 md:px-8">
          <CheckoutInstructions />
        </div>
      </div>
    </main>
  );
}
