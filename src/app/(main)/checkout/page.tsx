"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  CheckCircle, Lock, ChevronDown, ChevronUp, ArrowLeft,
  Smartphone, CreditCard, Banknote, ShoppingBag, Tag, X,
  Truck, MapPin,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { shippingFor } from "@/lib/pricing";
import toast from "react-hot-toast";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI / Google Pay / PhonePe", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", icon: Banknote },
];

interface DeliveryEstimate {
  region: string;
  minDays: number;
  maxDays: number;
  earliestFormatted: string;
  latestFormatted: string;
  message: string;
}

interface AppliedCoupon {
  code: string;
  discount: number;
  type: string;
  value: number;
}

interface PendingPayment {
  key: string;
  orderNumber: string;
  razorpay: { orderId: string; amount: number; currency: string; keyId: string };
}

// Razorpay typings
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<"address" | "payment" | "success">("address");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState("");
  // An online order already created on the server, reused if the customer closes
  // the Razorpay window and tries again, so retries don't create duplicate orders
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);

  // Delivery estimate
  const [deliveryEst, setDeliveryEst] = useState<DeliveryEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    line1: "", line2: "", city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then(({ user, defaultAddress }: { user: { name: string; email: string; phone?: string | null } | null; defaultAddress: typeof form | null }) => {
        if (!user) return;
        setForm((prev) => ({
          ...prev,
          name: prev.name || defaultAddress?.name || user.name,
          email: prev.email || user.email,
          phone: prev.phone || defaultAddress?.phone || user.phone || "",
          line1: prev.line1 || defaultAddress?.line1 || "",
          line2: prev.line2 || defaultAddress?.line2 || "",
          city: prev.city || defaultAddress?.city || "",
          state: prev.state || defaultAddress?.state || "",
          pincode: prev.pincode || defaultAddress?.pincode || "",
        }));
      })
      .catch(() => {});
  }, []);

  // Fetch delivery estimate when pincode is complete
  const fetchDeliveryEstimate = useCallback(async (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) { setDeliveryEst(null); return; }
    setEstimateLoading(true);
    try {
      const res = await fetch(`/api/delivery-estimate?pincode=${pincode}`);
      if (res.ok) setDeliveryEst(await res.json());
    } catch { /* non-critical */ }
    finally { setEstimateLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchDeliveryEstimate(form.pincode), 500);
    return () => clearTimeout(t);
  }, [form.pincode, fetchDeliveryEstimate]);

  const sub = subtotal();
  const shipping = shippingFor(sub);
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, sub + shipping - couponDiscount);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateAddress = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Valid email required";
    if (!form.phone.match(/^[6-9]\d{9}$/)) errs.phone = "Valid 10-digit mobile number required";
    if (!form.line1.trim()) errs.line1 = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state) errs.state = "State is required";
    if (!form.pincode.match(/^\d{6}$/)) errs.pincode = "Valid 6-digit pincode required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddressNext = () => {
    if (validateAddress()) setStep("payment");
  };

  // ── Apply coupon ────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), orderTotal: sub }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid coupon");
        return;
      }
      setAppliedCoupon(data);
      toast.success(`🎉 Coupon applied! You saved ${formatPrice(data.discount)}`);
    } catch {
      toast.error("Could not apply coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };
  // ───────────────────────────────────────────────────────────────────────────

  // ── Create the order on the server (prices are recomputed there) ───────────
  const orderPayload = () => ({
    guestName: form.name,
    guestEmail: form.email,
    guestPhone: form.phone,
    address: {
      line1: form.line1, line2: form.line2,
      city: form.city, state: form.state, pincode: form.pincode,
    },
    paymentMethod,
    items: items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      variantSelections: i.variantSelections,
      customization: i.customization,
      uploadedImage: i.uploadedImage,
    })),
    couponCode: appliedCoupon?.code,
    expectedTotal: total,
  });

  const createOrder = async (payload: ReturnType<typeof orderPayload>) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Order failed");
    return data as { orderNumber: string; total: number; razorpay: PendingPayment["razorpay"] | null };
  };

  const finishOrder = (orderNumber: string) => {
    setSuccessOrderNumber(orderNumber);
    setPendingPayment(null);
    clearCart();
    setStep("success");
  };
  // ───────────────────────────────────────────────────────────────────────────

  // ── Handle place order button click ────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload = orderPayload();

      if (paymentMethod === "cod") {
        const order = await createOrder(payload);
        finishOrder(order.orderNumber);
        setLoading(false);
        return;
      }

      // Online payment: reuse the open order if nothing changed since the last attempt
      const key = JSON.stringify(payload);
      let pending = pendingPayment?.key === key ? pendingPayment : null;
      if (!pending) {
        const order = await createOrder(payload);
        if (!order.razorpay) throw new Error("Could not initiate payment");
        pending = { key, orderNumber: order.orderNumber, razorpay: order.razorpay };
        setPendingPayment(pending);
      }
      if (!window.Razorpay) throw new Error("Payment window failed to load. Please refresh and try again.");

      const { orderNumber, razorpay } = pending;
      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: "Maa Stickers",
        description: `Order ${orderNumber}`,
        order_id: razorpay.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#7c3aed" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Verify signature server-side; this also confirms the order
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              toast.error(`We couldn't confirm your payment yet. If money was deducted, your order ${orderNumber} will be confirmed automatically — or contact support with payment ID ${response.razorpay_payment_id}.`, { duration: 10000 });
              return;
            }
            finishOrder(orderNumber);
          } catch {
            toast.error(`Payment received but confirmation is delayed. Your order number is ${orderNumber}.`, { duration: 10000 });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast("Payment cancelled. Your cart is still saved.", { icon: "ℹ️" });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────────────

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-14 h-14 text-brand-300 mb-4" strokeWidth={1.5} />
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
        <Button onClick={() => router.push("/products")}>Browse Products</Button>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="card p-10 max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-1">Thank you, {form.name.split(" ")[0]}!</p>
          {successOrderNumber && (
            <p className="text-sm font-mono bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg inline-block mb-3">
              #{successOrderNumber}
            </p>
          )}
          <p className="text-sm text-gray-400 mb-6">
            Save your order number to track your order. We&apos;ve also emailed it to{" "}
            <span className="font-medium text-gray-600">{form.email}</span>, with a link to track it.
            {deliveryEst && (
              <span className="block mt-1">
                Expected delivery: <strong>{deliveryEst.earliestFormatted} – {deliveryEst.latestFormatted}</strong>
              </span>
            )}
          </p>
          <div className="bg-brand-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Delivering to</p>
            <p className="font-medium text-gray-700">{form.name}</p>
            <p className="text-sm text-gray-500">{form.line1}, {form.city}, {form.state} – {form.pincode}</p>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1" variant="secondary" onClick={() => router.push(`/track-order?${new URLSearchParams({ order: successOrderNumber, email: form.email })}`)}>Track Order</Button>
            <Button className="flex-1" onClick={() => router.push("/products")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-cream-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">Checkout</h1>

          {/* Progress steps */}
          <div className="flex items-center gap-3 mb-8 text-sm">
            {["address", "payment"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-gray-300" />}
                <div className={`flex items-center gap-2 ${step === s || (s === "address" && step === "payment") ? "text-brand-600 font-medium" : "text-gray-400"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    (s === "address" && step !== "address") ? "bg-green-500 text-white" :
                    step === s ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-400"
                  }`}>
                    {s === "address" && step !== "address" ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="capitalize hidden sm:inline">{s === "address" ? "Delivery Address" : "Payment"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              {step === "address" && (
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-800 text-lg mb-5">Delivery Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Full Name *" placeholder="Priya Sharma" value={form.name} onChange={update("name")} error={errors.name} />
                      <Input label="Email *" type="email" placeholder="priya@example.com" value={form.email} onChange={update("email")} error={errors.email} />
                    </div>
                    <Input label="Mobile Number *" type="tel" placeholder="9876543210" value={form.phone} onChange={update("phone")} error={errors.phone} />
                    <Input label="Address Line 1 *" placeholder="House no., Street, Area" value={form.line1} onChange={update("line1")} error={errors.line1} />
                    <Input label="Address Line 2 (optional)" placeholder="Landmark, Apartment, etc." value={form.line2} onChange={update("line2")} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input label="City *" placeholder="Jaipur" value={form.city} onChange={update("city")} error={errors.city} />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                        <select value={form.state} onChange={update("state")} className={`input ${errors.state ? "border-red-400" : ""}`}>
                          <option value="">Select state</option>
                          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                      </div>
                      <div>
                        <Input label="Pincode *" placeholder="302001" value={form.pincode} onChange={update("pincode")} error={errors.pincode} />
                        {/* Delivery estimate */}
                        {estimateLoading && (
                          <p className="mt-1 text-xs text-gray-400 animate-pulse flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Checking delivery…
                          </p>
                        )}
                        {deliveryEst && !estimateLoading && (
                          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Delivery in {deliveryEst.minDays}–{deliveryEst.maxDays} days
                            ({deliveryEst.earliestFormatted} – {deliveryEst.latestFormatted})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery region info */}
                  {deliveryEst && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-sm text-blue-700">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{deliveryEst.message}</span>
                    </div>
                  )}

                  <Button size="lg" className="w-full mt-6 rounded-2xl" onClick={handleAddressNext}>
                    Continue to Payment
                  </Button>
                </div>
              )}

              {step === "payment" && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-gray-800 text-lg">Payment Method</h2>
                    <button onClick={() => setStep("address")} className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                      <ArrowLeft className="w-3.5 h-3.5" /> Edit address
                    </button>
                  </div>

                  {/* Address recap */}
                  <div className="bg-cream-100 rounded-xl p-4 mb-6 text-sm">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Delivering to</p>
                    <p className="font-semibold text-gray-800">{form.name}</p>
                    <p className="text-gray-600">{form.line1}, {form.city}, {form.state} – {form.pincode}</p>
                    <p className="text-gray-500">{form.phone}</p>
                    {deliveryEst && (
                      <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Est. delivery: {deliveryEst.earliestFormatted} – {deliveryEst.latestFormatted}
                      </p>
                    )}
                  </div>

                  {/* Payment methods */}
                  <div className="space-y-3 mb-6">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-brand-500 bg-brand-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="accent-brand-500"
                        />
                        <method.icon className="w-6 h-6 text-brand-500" strokeWidth={1.75} />
                        <span className="font-medium text-gray-700">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {paymentMethod !== "cod" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
                      <p>🔒 Secure payment powered by <strong>Razorpay</strong>. Your payment info is encrypted and never stored on our servers.</p>
                    </div>
                  )}
                  {paymentMethod === "cod" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-700">
                      Pay <strong>{formatPrice(total)}</strong> in cash when your order is delivered. ₹20 COD handling fee may apply on orders below ₹299.
                    </div>
                  )}

                  <Button size="lg" className="w-full rounded-2xl" onClick={handlePlaceOrder} loading={loading}>
                    <Lock className="w-4 h-4" />
                    {loading
                      ? "Processing…"
                      : paymentMethod === "cod"
                        ? `Place Order — ${formatPrice(total)}`
                        : `Pay ${formatPrice(total)} Securely`
                    }
                  </Button>
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> 100% secure · SSL encrypted
                  </p>
                </div>
              )}
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-5 sticky top-24">
                <button
                  className="flex items-center justify-between w-full mb-4 lg:cursor-default"
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                >
                  <h3 className="font-semibold text-gray-800">
                    Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})
                  </h3>
                  <span className="lg:hidden text-gray-400">
                    {showOrderSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                <div className={`space-y-3 mb-4 ${showOrderSummary ? "block" : "hidden lg:block"}`}>
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-cream-100">
                        <Image
                          src={item.uploadedImage || item.image}
                          alt={item.name}
                          fill
                          className={item.uploadedImage ? "object-contain bg-white" : "object-cover"}
                          sizes="56px"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        {item.variantInfo && <p className="text-xs text-gray-400 truncate">{item.variantInfo}</p>}
                        <p className="text-sm font-semibold text-brand-600 mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon code */}
                <div className="border-t border-gray-100 pt-4 mb-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Coupon Code
                  </p>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-sm font-bold text-green-700 font-mono">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">Saved {formatPrice(appliedCoupon.discount)}</p>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code (e.g. MAA20)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        className="input text-sm flex-1 min-w-0"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleApplyCoupon}
                        loading={couponLoading}
                        className="shrink-0"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>{formatPrice(sub)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({appliedCoupon?.code})</span>
                      <span>−{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-brand-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {sub < 499 && (
                  <p className="mt-3 text-xs text-center text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    Add {formatPrice(499 - sub)} more for FREE shipping!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
