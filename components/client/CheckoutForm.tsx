"use client";

import { useState } from "react";
import { createOrderAction } from "@/lib/server/actions/public/order/orderActions";
import { cartToCreateOrderSimplified } from "@/lib/server/mappers/commands/cartToCreateOrder";
import { PaymentMethod } from "@/lib/server/fetchers/fetchOrders";
import { AuthUser } from "@/redux/features/auth/userSlice";
import { ChevronDown, Check, MapPin, CreditCard, Package } from "lucide-react";
import Image from "next/image";

import { clearCart } from "@/redux/features/cart/cartSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { persistor } from "@/redux/store";
import { ProgressBar, ProgressStep } from "@/app/(root)/checkout/progressBar";

/* ================= TYPES ================= */

export interface CheckoutDeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

export interface CheckoutCartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  variantId?: string | null;
  variantName?: string | null;
}
type CheckoutSource = "cart" | "buy_now" | "build";



interface CheckoutFormProps {
  user: AuthUser | null;
  cartItems: CheckoutCartItem[];
  deliveryInfo: CheckoutDeliveryInfo;
  paymentMethod?: PaymentMethod;
    buildId?: string;
  source: CheckoutSource;
}

/* ================= COMPONENT ================= */

export default function CheckoutForm({
  user,
  cartItems,
  deliveryInfo: initialDeliveryInfo,
  paymentMethod: initialPaymentMethod,
  source,
  buildId,
}: CheckoutFormProps) {
  const [openSection, setOpenSection] = useState<1 | 2 | 3>(1);
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [deliveryInfo, setDeliveryInfo] = useState<CheckoutDeliveryInfo>({
    name: user?.name ?? initialDeliveryInfo.name,
    phone: user?.phone ?? initialDeliveryInfo.phone,
    address: initialDeliveryInfo.address,
    city: initialDeliveryInfo.city,
    postalCode: initialDeliveryInfo.postalCode,
    country: initialDeliveryInfo.country,
    instructions: initialDeliveryInfo.instructions,
  });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod | undefined>(initialPaymentMethod);

  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);


  /* ---------------- VALIDATION ---------------- */

  const isDeliveryComplete = Boolean(
    deliveryInfo.name &&
    deliveryInfo.phone &&
    deliveryInfo.address &&
    deliveryInfo.city &&
    deliveryInfo.postalCode &&
    deliveryInfo.country
  );



  const isPaymentComplete = Boolean(
    paymentMethod && // ← Check if exists first!
    (paymentMethod === "COD" || (paymentMethod === "OnlineUpload" && receipt !== null))
  );

  const canPlaceOrder = isDeliveryComplete && isPaymentComplete;

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const progressSteps: ProgressStep[] = [
    { number: 1, title: "Delivery Details", subtitle: "Enter your address" },
    { number: 2, title: "Payment Method", subtitle: "Choose payment option" },
    { number: 3, title: "Review Order", subtitle: "Confirm and place order" },
  ];


  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!canPlaceOrder || !paymentMethod) return;


    setLoading(true);
    setMessage("");

    try {
      const payload = cartToCreateOrderSimplified({
        cartItems: cartItems.map((item) => ({
          product: { _id: item.productId },
          variant: item.variantId ? { _id: item.variantId } : null,
          quantity: item.quantity,
        })),
        deliveryInfo,
        paymentMethod: paymentMethod as PaymentMethod,
        source,
          buildId,
   
      });

      const res = await createOrderAction(payload);


      if (!res.success) {
        const errorMessage = res.message || "Something went wrong. Please try again.";
        setMessage(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (res.success) {
  const successMessage = res.message || "Order placed successfully! 🎉";
  setMessage(successMessage);
  toast.success(successMessage);

  // Only clear cart if the order came from the cart
  if (source === "cart") {
    dispatch(clearCart());
    await persistor.flush();
  }

  router.push("/account/orders");
}



    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryContinue = () => {
    if (isDeliveryComplete) {
      setOpenSection(2);
    }
  };

  const handlePaymentContinue = () => {
    if (isPaymentComplete) {
      setOpenSection(3);
    }
  };

  /* ================= UI ================= */

  return (
    <section className="bg-gray-50  py-8">
      <div className="max-w-6xl mx-auto px-4">
        <ProgressBar currentStep={openSection} steps={progressSteps} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - Accordion Sections */}
          <div className="lg:col-span-2 space-y-4">


            {/* SECTION 1: Delivery Information */}
            <AccordionSection
              icon={<MapPin className="w-5  h-5" />}
              title="Delivery Information"
              isOpen={openSection === 1}
              isComplete={isDeliveryComplete}
              onClick={() => setOpenSection(1)}
              disabled={false}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Input
                  label="Full Name"
                  value={deliveryInfo.name}
                  onChange={(v) => setDeliveryInfo({ ...deliveryInfo, name: v })}
                  placeholder="John Doe"
                />
                <Input
                  label="Phone Number"
                  value={deliveryInfo.phone}
                  onChange={(v) => setDeliveryInfo({ ...deliveryInfo, phone: v })}
                  placeholder="+977 9812345678"
                />
                <Input
                  label="City"
                  value={deliveryInfo.city}
                  onChange={(v) => setDeliveryInfo({ ...deliveryInfo, city: v })}
                  placeholder="Kathmandu"
                />
                <Input
                  label="Postal Code"
                  value={deliveryInfo.postalCode}
                  onChange={(v) =>
                    setDeliveryInfo({ ...deliveryInfo, postalCode: v })
                  }
                  placeholder="44600"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={deliveryInfo.address}
                    onChange={(v) =>
                      setDeliveryInfo({ ...deliveryInfo, address: v })
                    }
                    placeholder="Street address, building, apartment"
                  />
                </div>
                <Input
                  label="Country"
                  value={deliveryInfo.country}
                  onChange={(v) =>
                    setDeliveryInfo({ ...deliveryInfo, country: v })
                  }
                  placeholder="Nepal"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={deliveryInfo.instructions || ""}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        instructions: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={2}
                    placeholder="e.g., Call before delivery, Leave at door"
                  />
                </div>
              </div>

              <button
                className="mt-6 w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!isDeliveryComplete}
                onClick={handleDeliveryContinue}
              >
                Continue to Payment
              </button>
            </AccordionSection>

            {/* SECTION 2: Payment Method */}
            <AccordionSection
              icon={<CreditCard className="w-5 h-5" />}
              title="Payment Method"
              isOpen={openSection === 2}
              isComplete={isPaymentComplete}
              onClick={() => {
                if (isDeliveryComplete) {
                  setOpenSection(2);
                }
              }}
              disabled={!isDeliveryComplete}
            >
              <div className="space-y-3 mt-6">


                <p className="text-sm text-gray-600 mb-4">
                  Please select your preferred payment method
                </p>



                {(["COD", "OnlineUpload"] as PaymentMethod[]).map((method) => (
                  <label
                    key={method}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === method
                      ? "border-primary bg-red-50 ring-2 ring-red-200"  // ✅ Proper styling
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="mt-1 w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {method === "COD"
                          ? "Cash on Delivery"
                          : "Online Payment (Upload Receipt)"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {method === "COD"
                          ? "Pay when your order arrives"
                          : "Upload your payment receipt after completing the transaction"}
                      </div>
                    </div>
                  </label>
                ))}

                {paymentMethod === "OnlineUpload" && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Payment Receipt
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setReceipt(file);

                        if (file && file.type.startsWith("image/")) {
                          const url = URL.createObjectURL(file);
                          setReceiptPreview(url);
                        } else {
                          setReceiptPreview(null);
                        }
                      }}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />

                    {receipt && (
                      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                            <Check className="w-4 h-4" />
                            Receipt uploaded successfully
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setReceipt(null);
                              setReceiptPreview(null);
                            }}
                            className="text-sm bg-primary px-2 rounded-lg text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                        </div>

                        {receiptPreview ? (
                          <div className="relative w-full max-w-xs">
                            <Image
                              src={receiptPreview}
                              alt="Receipt preview"
                              width={400}
                              height={400}
                              className="rounded-lg border object-contain bg-gray-50"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            Uploaded file: <span className="font-medium">{receipt.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                className="mt-6 w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!isPaymentComplete}
                onClick={handlePaymentContinue}
              >
                Review Order
              </button>
            </AccordionSection>

            {/* SECTION 3: Review & Place Order */}
            <AccordionSection
              icon={<Package className="w-5 h-5" />}
              title="Review & Place Order"
              isOpen={openSection === 3}
              isComplete={false}
              onClick={() => {
                if (isDeliveryComplete && isPaymentComplete) {
                  setOpenSection(3);
                }
              }}
              disabled={!isDeliveryComplete || !isPaymentComplete}
            >
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-600">
                    {deliveryInfo.name} | {deliveryInfo.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {deliveryInfo.address}, {deliveryInfo.city}{" "}
                    {deliveryInfo.postalCode}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : `Online Payment - Receipt: ${receipt?.name || "Uploaded"}`}
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canPlaceOrder || loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-center font-medium ${message.includes("success")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                  >
                    {message}
                  </div>
                )}
              </div>
            </AccordionSection>
          </div>

          {/* RIGHT - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 p-6 rounded-lg shadow-sm sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="space-y-4 mb-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    {item.image && (
                      <Image
                        width={1000}
                        height={1000}
                        src={item.image}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-gray-500">{item.variantName}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × Rs.{item.price}
                      </p>
                    </div>
                    <div className="font-medium text-sm">
                      Rs.{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal (including tax)</span>
                  <span>Rs.{subtotal}</span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>Rs.{subtotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= ACCORDION SECTION ================= */

function AccordionSection({
  icon,
  title,
  isOpen,
  isComplete,
  onClick,
  disabled = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  isOpen: boolean;
  isComplete: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 border-gray-200 transition  ${disabled ? "opacity-50" : ""}`}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 transition disabled:cursor-not-allowed"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete
            ? "bg-green-500 text-white"
            : isOpen
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-600"
            }`}
        >
          {isComplete ? <Check className="w-5 h-5" /> : icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{title}</span>
            {isComplete && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Completed
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && <div className="p-4 pt-0 border-t">{children}</div>}
    </div>
  );
}

/* ================= INPUT ================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
      />
    </div>
  );
}