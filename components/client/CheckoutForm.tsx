"use client";

import { useState, useMemo } from "react";
import { createOrderAction } from "@/lib/server/actions/public/order/orderActions";
import { cartToCreateOrderSimplified } from "@/lib/server/mappers/commands/cartToCreateOrder";
import { PaymentMethod } from "@/lib/server/fetchers/fetchOrders";
import { AuthUser } from "@/redux/features/auth/userSlice";
import { ChevronDown, Check, MapPin, CreditCard, Package } from "lucide-react";
import Image from "@/components/ui/optimized-image";

import { clearCart } from "@/redux/features/cart/cartSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { getOrCreatePersistor } from "@/redux/store";
import { ProgressBar, ProgressStep } from "@/app/(root)/checkout/progressBar";

/* ================= CONSTANTS ================= */

const COD_ADVANCE = 5000;
const OUTSIDE_KATHMANDU_CHARGE = 1000;

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
    paymentMethod && receipt !== null
  );

  const canPlaceOrder = isDeliveryComplete && isPaymentComplete;

  /* ---------------- PRICE CALCULATIONS ---------------- */

  const subtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems]
  );

  const isOutsideKathmandu = useMemo(() => {
    if (!deliveryInfo.city) return false;

    const ktmValleyCities = ["kathmandu", "bhaktapur", "lalitpur"];
    return !ktmValleyCities.includes(deliveryInfo.city.toLowerCase().trim());
  }, [deliveryInfo.city]);

  const deliveryCharge = useMemo(() => {
    return isOutsideKathmandu ? OUTSIDE_KATHMANDU_CHARGE : 0;
  }, [isOutsideKathmandu]);

  const codAdvance = useMemo(() => {
    return paymentMethod === "COD" ? COD_ADVANCE : 0;
  }, [paymentMethod]);

  const totalPrice = useMemo(() => {
    return subtotal + deliveryCharge;
  }, [subtotal, deliveryCharge]);

  const remainingBalance = useMemo(() => {
    return totalPrice - codAdvance;
  }, [totalPrice, codAdvance]);

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
        paymentProof: receipt,
      });

      const res = await createOrderAction(payload);

      if (!res.success) {
        const errorMessage =
          res.message || "Something went wrong. Please try again.";
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
          await getOrCreatePersistor().flush();
        }

        router.push("/account/orders");
      }
    } catch {
      const errorMsg = "Something went wrong. Please try again.";
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryContinue = () => {
    if (!isDeliveryComplete) {
      toast.error("Please fill in all delivery information");
      return;
    }
    setOpenSection(2);
  };

  const handlePaymentContinue = () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!receipt) {
      toast.error(
        paymentMethod === "COD"
          ? "Please upload your COD advance payment receipt"
          : "Please upload your payment receipt"
      );
      return;
    }

    setOpenSection(3);
  };

  /* ================= UI ================= */

  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <ProgressBar currentStep={openSection} steps={progressSteps} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - Accordion Sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* SECTION 1: Delivery Information */}
            <AccordionSection
              icon={<MapPin className="w-5 h-5" />}
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
                  required
                />
                <Input
                  label="Phone Number"
                  value={deliveryInfo.phone}
                  onChange={(v) =>
                    setDeliveryInfo({ ...deliveryInfo, phone: v })
                  }
                  placeholder="+977 9812345678"
                  required
                />
                <Input
                  label="City"
                  value={deliveryInfo.city}
                  onChange={(v) => setDeliveryInfo({ ...deliveryInfo, city: v })}
                  placeholder="Kathmandu"
                  required
                />
                <Input
                  label="Postal Code"
                  value={deliveryInfo.postalCode}
                  onChange={(v) =>
                    setDeliveryInfo({ ...deliveryInfo, postalCode: v })
                  }
                  placeholder="44600"
                  required
                />
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={deliveryInfo.address}
                    onChange={(v) =>
                      setDeliveryInfo({ ...deliveryInfo, address: v })
                    }
                    placeholder="Street address, building, apartment"
                    required
                  />
                </div>
                <Input
                  label="Country"
                  value={deliveryInfo.country}
                  onChange={(v) =>
                    setDeliveryInfo({ ...deliveryInfo, country: v })
                  }
                  placeholder="Nepal"
                  required
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

              {isOutsideKathmandu && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p className="font-medium">📦 Delivery Charge Applied</p>
                  <p className="mt-1">
                    Rs. {OUTSIDE_KATHMANDU_CHARGE} will be added for delivery
                    outside Kathmandu valley.
                  </p>
                </div>
              )}

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
                } else {
                  toast.error("Please complete delivery information first");
                }
              }}
              disabled={!isDeliveryComplete}
            >
              <div className="space-y-3 mt-6">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Select a payment method that suits you
                </p>

                {(["COD", "OnlineUpload"] as PaymentMethod[]).map((method) => (
                  <label
                    key={method}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === method
                        ? "border-primary bg-red-50 ring-2 ring-red-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method}
                      onChange={() => {
                        setPaymentMethod(method);
                        // Clear receipt when switching methods
                        setReceipt(null);
                        setReceiptPreview(null);
                      }}
                      className="mt-1 w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {method === "COD"
                          ? "Cash on Delivery"
                          : "Online Payment (Full Amount)"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {method === "COD"
                          ? `Pay Rs. ${COD_ADVANCE} advance now, remaining on delivery`
                          : "Upload your full payment receipt"}
                      </div>
                    </div>
                  </label>
                ))}

                {/* COD ADVANCE PAYMENT UPLOAD */}
                {paymentMethod === "COD" && (
                  <div className="mt-4 space-y-4">
                    {/* Info Box */}
                    <div className="p-4  border-2 border-yellow-300 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">💰</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-yellow-900 mb-1">
                            COD Advance Payment Required
                          </p>
                          <p className="text-sm text-yellow-800 mb-2">
                            Please pay Rs. {COD_ADVANCE} advance now to confirm your order.
                            You&apos;ll pay the remaining Rs. {remainingBalance} when your order is delivered.
                          </p>
                          <div className="text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-md">
                            <p className="font-semibold mb-1">Payment Instructions:</p>
                            <ul className="list-disc  list-inside space-y-1">
                              <li>Transfer Rs. {COD_ADVANCE} to our account</li>
                              <li>Take a screenshot of the payment confirmation</li>
                              <li>Upload the screenshot below</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upload Section */}
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload COD Advance Payment Receipt{" "}
                        <span className="text-red-500">*</span>
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
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-red-700 file:cursor-pointer"
                      />

                      {receipt && (
                        <div className="mt-4 rounded-lg border-2 border-green-200 bg-green-50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                              <Check className="w-5 h-5" />
                              Advance payment receipt uploaded
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReceipt(null);
                                setReceiptPreview(null);
                              }}
                              className="text-sm bg-red-500 px-3 py-1 rounded-lg text-white hover:bg-red-600 transition"
                            >
                              Remove
                            </button>
                          </div>

                          {receiptPreview ? (
                            <div className="relative w-full max-w-xs mx-auto">
                              <Image
                                src={receiptPreview}
                                alt="COD advance receipt preview"
                                width={400}
                                height={400}
                                className="rounded-lg border-2 border-gray-300 object-contain bg-white"
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              Uploaded file:{" "}
                              <span className="font-medium">{receipt.name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {!receipt && (
                        <p className="mt-2 text-xs text-red-600 font-medium">
                          ⚠️ COD advance payment receipt is required to proceed
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ONLINE UPLOAD FULL PAYMENT */}
                {paymentMethod === "OnlineUpload" && (
                  <div className="mt-4 space-y-4">
                    {/* Info Box */}
                    <div className="p-4  border-2 border-blue-300 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">💳</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-blue-900 mb-1">
                            Full Payment Required
                          </p>
                          <p className="text-sm text-blue-800 mb-2">
                            Please pay the full amount of Rs. {totalPrice} now to confirm your order.
                          </p>
                          <div className="text-xs  text-blue-700 bg-blue-50 px-3 py-2 rounded-md">
                            <p className="mb-1 font-semibold">Payment Instructions:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Transfer Rs. {totalPrice} to our account</li>
                              <li>Take a screenshot of the payment confirmation</li>
                              <li>Upload the screenshot below</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upload Section */}
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Payment Receipt{" "}
                        <span className="text-red-500">*</span>
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
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-red-700 file:cursor-pointer"
                      />

                      {receipt && (
                        <div className="mt-4 rounded-lg border-2 border-green-200 bg-green-50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                              <Check className="w-5 h-5" />
                              Payment receipt uploaded
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReceipt(null);
                                setReceiptPreview(null);
                              }}
                              className="text-sm bg-red-500 px-3 py-1 rounded-lg text-white hover:bg-red-600 transition"
                            >
                              Remove
                            </button>
                          </div>

                          {receiptPreview ? (
                            <div className="relative w-full max-w-xs mx-auto">
                              <Image
                                src={receiptPreview}
                                alt="Payment receipt preview"
                                width={400}
                                height={400}
                                className="rounded-lg border-2 border-gray-300 object-contain bg-white"
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              Uploaded file:{" "}
                              <span className="font-medium">{receipt.name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {!receipt && (
                        <p className="mt-2 text-xs text-red-600 font-medium">
                          ⚠️ Payment receipt is required to proceed
                        </p>
                      )}
                    </div>
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
                } else if (!isDeliveryComplete) {
                  toast.error("Please complete delivery information first");
                } else if (!isPaymentComplete) {
                  toast.error("Please complete payment method selection");
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
                    {deliveryInfo.postalCode}, {deliveryInfo.country}
                  </p>
                  {deliveryInfo.instructions && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      Instructions: {deliveryInfo.instructions}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === "COD"
                      ? `Cash on Delivery (Advance Paid: Rs. ${COD_ADVANCE})`
                      : `Online Payment (Full Amount Paid: Rs. ${totalPrice})`}
                  </p>
                </div>

                {receiptPreview && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Receipt Preview</h4>
                    <div className="relative w-full max-w-xs mx-auto">
                      <Image
                        src={receiptPreview}
                        alt="Payment receipt"
                        width={400}
                        height={400}
                        className="rounded-lg border object-contain bg-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canPlaceOrder || loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-center font-medium ${
                      message.includes("success")
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

          {/* RIGHT - Order Summary - SIMPLIFIED & ELEGANT */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm sticky top-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Summary</h3>

              {/* Items List */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                    {item.image && (
                      <Image
                        width={60}
                        height={60}
                        src={item.image}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-gray-500">{item.variantName}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        {item.quantity} × Rs.{item.price}
                      </p>
                    </div>
                    <div className="font-medium text-sm text-gray-800">
                      Rs.{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">Rs.{subtotal}</span>
                </div>

                {deliveryCharge > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Charge</span>
                    <span className="font-medium">Rs.{deliveryCharge}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-semibold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>Rs.{totalPrice}</span>
                </div>

                {/* COD Payment Breakdown */}
                {paymentMethod === "COD" && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
                      <span>Advance Payment</span>
                      <span className="font-medium">Rs.{codAdvance}</span>
                    </div>

                    <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-primary">
                      <span>Pay on Delivery</span>
                      <span>Rs.{remainingBalance}</span>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600">
                        You&apos;ll pay <span className="font-semibold">Rs.{remainingBalance}</span> in cash when your order arrives
                      </p>
                    </div>
                  </>
                )}

                {/* Online Payment Note */}
                {paymentMethod === "OnlineUpload" && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600">
                      Full payment of <span className="font-semibold">Rs.{totalPrice}</span> is required
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Note */}
              {deliveryCharge > 0 && (
                <div className="mt-4 p-2.5 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-xs text-blue-700">
                    Delivery charge applies for addresses outside Kathmandu Valley
                  </p>
                </div>
              )}
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
      className={`bg-white rounded-lg shadow-sm border-2 border-gray-200 transition ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 transition disabled:cursor-not-allowed"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isComplete
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
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
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
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
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
