"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  CheckCircle, Lock, ChevronDown, ChevronUp, ArrowLeft, ArrowRight,
  Smartphone, CreditCard, Banknote, ShoppingBag, Tag, X,
  Truck, MapPin, User, Mail, Phone, Home, Landmark, Building2,
  Map as MapIcon, Hash, ShieldCheck, LucideIcon,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";
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
        theme: { color: "#c9a227" },
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
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-cream-50 via-[#fbf3e6] to-cream-100">
        <div className="relative w-full max-w-md text-center bg-white rounded-[2rem] shadow-card border border-brand-100/60 px-6 py-12 sm:px-10 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand-100/60 blur-2xl pointer-events-none" />
          <div className="relative mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-cream-100 to-brand-100 ring-8 ring-brand-50 flex items-center justify-center">
            <ShoppingBag className="w-11 h-11 text-brand-500" strokeWidth={1.5} />
          </div>
          <h2 className="relative font-display text-3xl font-bold text-maroon-700 mb-6">
            Your cart is <span className="italic font-normal text-gradient">empty</span>
          </h2>
          <button
            onClick={() => router.push("/products")}
            className="relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-8 py-4 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <ShoppingBag className="w-5 h-5" /> Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-cream-50 via-[#fbf3e6] to-cream-100">
        <div className="relative w-full max-w-md text-center bg-white rounded-[2rem] shadow-2xl shadow-maroon-900/10 border border-brand-100/60 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300" />
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-green-100/60 blur-3xl pointer-events-none" />
          <div className="relative px-6 py-10 sm:px-10">
            <div className="relative mx-auto mb-6 w-24 h-24">
              <span className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 ring-8 ring-green-50 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle className="w-11 h-11 text-white" />
              </div>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-maroon-700 mb-2">
              Order <span className="italic font-normal text-gradient">Placed!</span>
            </h2>
            <p className="text-gray-500 mb-3">Thank you, {form.name.split(" ")[0]}!</p>
            {successOrderNumber && (
              <p className="inline-block mb-4 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 px-4 py-2 font-mono text-sm font-bold text-brand-700">
                #{successOrderNumber}
              </p>
            )}
            <p className="text-sm text-gray-400 mb-6">
              Save your order number to track your order. We&apos;ve also emailed it to{" "}
              <span className="font-medium text-gray-600">{form.email}</span>, with a link to track it.
              {deliveryEst && (
                <span className="flex items-center justify-center gap-1.5 mt-3 rounded-full bg-green-50 border border-green-100 px-3 py-1.5 text-green-700">
                  <Truck className="w-4 h-4" />
                  Expected delivery: <strong>{deliveryEst.earliestFormatted} – {deliveryEst.latestFormatted}</strong>
                </span>
              )}
            </p>
            <div className="flex items-start gap-3 rounded-2xl bg-cream-50 border border-cream-200 p-4 mb-7 text-left">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-600 shadow-sm flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600 mb-0.5">Delivering to</p>
                <p className="font-semibold text-maroon-700">{form.name}</p>
                <p className="text-sm text-gray-500">{form.line1}, {form.city}, {form.state} – {form.pincode}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 rounded-full border-2 border-maroon-700 py-3 text-sm font-semibold text-maroon-700 transition-colors hover:bg-maroon-700 hover:text-white"
                onClick={() => router.push(`/track-order?${new URLSearchParams({ order: successOrderNumber, email: form.email })}`)}
              >
                Track Order
              </button>
              <button
                className="flex-1 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5"
                onClick={() => router.push("/products")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const STEPS = [
    { id: "address", label: "Delivery Address", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
  ] as const;

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-gradient-to-b from-cream-50 via-[#fbf6ec] to-cream-50 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title + progress */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-500/30 items-center justify-center text-white">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-maroon-700">
                <span className="italic font-normal text-gradient">Checkout</span>
              </h1>
            </div>

            {/* Progress steps */}
            <ol className="flex items-center gap-2 sm:gap-3 rounded-full bg-white border border-brand-100/60 shadow-card p-1.5 self-start sm:self-auto">
              {STEPS.map((s, i) => {
                const done = s.id === "address" && step === "payment";
                const active = step === s.id;
                return (
                  <li key={s.id} className="flex items-center gap-2 sm:gap-3">
                    {i > 0 && <span className={`w-6 sm:w-10 h-0.5 rounded-full ${step === "payment" ? "bg-brand-400" : "bg-cream-200"}`} />}
                    <span
                      className={`flex items-center gap-2 rounded-full pl-1.5 pr-3 sm:pr-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                        active ? "bg-maroon-700 text-white" : done ? "text-green-700" : "text-gray-400"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          done ? "bg-green-500 text-white" : active ? "bg-gradient-to-br from-brand-300 to-brand-600 text-white" : "bg-cream-100 text-gray-400"
                        }`}
                      >
                        {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </span>
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              {step === "address" && (
                <div className="bg-white rounded-3xl shadow-card border border-brand-100/60 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300" />
                  <div className="p-5 sm:p-7">
                    <SectionTitle icon={MapPin} first="Delivery" accent="Address" />
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name *" icon={User} placeholder="Priya Sharma" autoComplete="name" value={form.name} onChange={update("name")} error={errors.name} />
                        <Field label="Email *" icon={Mail} type="email" placeholder="priya@example.com" autoComplete="email" value={form.email} onChange={update("email")} error={errors.email} />
                      </div>
                      <Field label="Mobile Number *" icon={Phone} type="tel" placeholder="9876543210" autoComplete="tel" value={form.phone} onChange={update("phone")} error={errors.phone} />
                      <Field label="Address Line 1 *" icon={Home} placeholder="House no., Street, Area" autoComplete="address-line1" value={form.line1} onChange={update("line1")} error={errors.line1} />
                      <Field label="Address Line 2 (optional)" icon={Landmark} placeholder="Landmark, Apartment, etc." autoComplete="address-line2" value={form.line2} onChange={update("line2")} />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="City *" icon={Building2} placeholder="Jaipur" autoComplete="address-level2" value={form.city} onChange={update("city")} error={errors.city} />
                        <div>
                          <label className={labelCls}>State *</label>
                          <div className="relative">
                            <MapIcon className={iconCls} />
                            <select
                              value={form.state}
                              onChange={update("state")}
                              className={`${fieldCls} appearance-none pr-10 cursor-pointer ${errors.state ? errorFieldCls : ""}`}
                            >
                              <option value="">Select state</option>
                              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {errors.state && <p className="mt-1.5 text-xs text-red-500">{errors.state}</p>}
                        </div>
                        <div>
                          <Field label="Pincode *" icon={Hash} placeholder="302001" inputMode="numeric" autoComplete="postal-code" value={form.pincode} onChange={update("pincode")} error={errors.pincode} />
                          {/* Delivery estimate */}
                          {estimateLoading && (
                            <p className="mt-1.5 text-xs text-gray-400 animate-pulse flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Checking delivery…
                            </p>
                          )}
                          {deliveryEst && !estimateLoading && (
                            <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                              <Truck className="w-3 h-3 flex-shrink-0" />
                              Delivery in {deliveryEst.minDays}–{deliveryEst.maxDays} days
                              ({deliveryEst.earliestFormatted} – {deliveryEst.latestFormatted})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delivery region info */}
                    {deliveryEst && (
                      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-green-50 border border-green-100 p-3.5 text-sm text-green-700">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span>{deliveryEst.message}</span>
                      </div>
                    )}

                    <button
                      onClick={handleAddressNext}
                      className="mt-7 flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 py-4 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      Continue to Payment <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div className="bg-white rounded-3xl shadow-card border border-brand-100/60 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300" />
                  <div className="p-5 sm:p-7">
                    <div className="flex items-start justify-between gap-3">
                      <SectionTitle icon={CreditCard} first="Payment" accent="Method" />
                      <button
                        onClick={() => setStep("address")}
                        className="flex-shrink-0 inline-flex items-center gap-1 rounded-full border border-brand-200 px-3 py-1.5 text-xs sm:text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Edit address
                      </button>
                    </div>

                    {/* Address recap */}
                    <div className="flex items-start gap-3 rounded-2xl bg-cream-50 border border-cream-200 p-4 mb-6 text-sm">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-600 shadow-sm flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600 mb-0.5">Delivering to</p>
                        <p className="font-semibold text-maroon-700">{form.name}</p>
                        <p className="text-gray-600">{form.line1}, {form.city}, {form.state} – {form.pincode}</p>
                        <p className="text-gray-500">{form.phone}</p>
                        {deliveryEst && (
                          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700">
                            <Truck className="w-3 h-3" />
                            Est. delivery: {deliveryEst.earliestFormatted} – {deliveryEst.latestFormatted}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment methods */}
                    <div className="space-y-3 mb-6">
                      {PAYMENT_METHODS.map((method) => {
                        const selected = paymentMethod === method.id;
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              selected
                                ? "border-brand-500 bg-brand-50/70 shadow-md shadow-brand-500/10"
                                : "border-cream-200 hover:border-brand-200 hover:bg-cream-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method.id}
                              checked={selected}
                              onChange={() => setPaymentMethod(method.id)}
                              className="sr-only"
                            />
                            <span
                              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                selected ? "bg-gradient-to-br from-brand-300 to-brand-600 text-white" : "bg-cream-100 text-brand-600"
                              }`}
                            >
                              <method.icon className="w-5 h-5" strokeWidth={1.75} />
                            </span>
                            <span className={`flex-1 font-medium text-sm sm:text-base ${selected ? "text-maroon-700" : "text-gray-700"}`}>{method.label}</span>
                            <span
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selected ? "border-brand-500" : "border-gray-300"
                              }`}
                            >
                              {selected && <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {paymentMethod !== "cod" && (
                      <div className="flex items-start gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-4 mb-6 text-sm text-blue-700">
                        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p>Secure payment powered by <strong>Razorpay</strong>. Your payment info is encrypted and never stored on our servers.</p>
                      </div>
                    )}
                    {paymentMethod === "cod" && (
                      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 p-4 mb-6 text-sm text-amber-700">
                        <Banknote className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p>Pay <strong>{formatPrice(total)}</strong> in cash when your order is delivered. ₹20 COD handling fee may apply on orders below ₹299.</p>
                      </div>
                    )}

                    <Button size="lg" className="w-full rounded-full py-4 shadow-lg shadow-brand-500/30" onClick={handlePlaceOrder} loading={loading}>
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
                </div>
              )}
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1 lg:sticky lg:top-24 order-first lg:order-none">
              <div className="bg-white rounded-3xl shadow-card border border-brand-100/60 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300" />
                <div className="p-5 sm:p-6">
                  <button
                    className="flex items-center justify-between w-full mb-4 lg:cursor-default"
                    onClick={() => setShowOrderSummary(!showOrderSummary)}
                  >
                    <h3 className="font-display text-xl font-bold text-maroon-700 text-left">
                      Order <span className="italic font-normal text-gradient">Summary</span>
                      <span className="ml-2 align-middle font-sans text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </span>
                    </h3>
                    <span className="lg:hidden flex items-center gap-2 text-gray-400">
                      <span className="text-sm font-bold text-brand-600">{formatPrice(total)}</span>
                      {showOrderSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  <div className={`space-y-3 mb-5 ${showOrderSummary ? "block" : "hidden lg:block"}`}>
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-cream-50 transition-colors">
                        <div className="relative w-14 h-14 flex-shrink-0">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-100 ring-1 ring-cream-200">
                            <Image
                              src={item.uploadedImage || item.image}
                              alt={item.name}
                              fill
                              className={item.uploadedImage ? "object-contain bg-white" : "object-cover"}
                              sizes="56px"
                            />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-maroon-700 text-brand-300 text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-maroon-700 truncate">{item.name}</p>
                          {item.variantInfo && <p className="text-xs text-gray-400 truncate">{item.variantInfo}</p>}
                        </div>
                        <p className="text-sm font-semibold text-brand-600 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Coupon code */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-500" /> Coupon Code
                    </p>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-green-300 bg-green-50 px-4 py-2.5">
                        <div>
                          <p className="text-sm font-bold text-green-700 font-mono">{appliedCoupon.code}</p>
                          <p className="text-xs text-green-600">Saved {formatPrice(appliedCoupon.discount)}</p>
                        </div>
                        <button onClick={handleRemoveCoupon} aria-label="Remove coupon" className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full border-2 border-dashed border-brand-200 bg-cream-50 p-1 focus-within:border-brand-400 transition-colors">
                        <input
                          type="text"
                          placeholder="Enter code (e.g. MAA20)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 outline-none"
                        />
                        <Button
                          size="sm"
                          onClick={handleApplyCoupon}
                          loading={couponLoading}
                          className="shrink-0 rounded-full !bg-maroon-700 hover:!bg-brand-600 px-5"
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2.5 text-sm rounded-2xl bg-cream-50 p-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span><span className="font-medium text-gray-800">{formatPrice(sub)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-medium text-gray-800"}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon ({appliedCoupon?.code})</span>
                        <span className="font-medium">−{formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline font-bold pt-3 border-t border-dashed border-cream-200">
                      <span className="text-maroon-700">Total</span>
                      <span className="text-2xl text-brand-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {sub < 499 && (
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-center text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-3 py-2">
                      <Truck className="w-3.5 h-3.5 flex-shrink-0" /> Add {formatPrice(499 - sub)} more for FREE shipping!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const fieldCls =
  "w-full pl-11 pr-4 py-3 rounded-2xl border border-cream-200 bg-cream-50/60 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const errorFieldCls = "!border-red-400 focus:!ring-red-100";
const iconCls = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2";

function SectionTitle({ icon: Icon, first, accent }: { icon: LucideIcon; first: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-500/30 flex items-center justify-center text-white flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="font-display text-2xl font-bold text-maroon-700">
        {first} <span className="italic font-normal text-gradient">{accent}</span>
      </h2>
    </div>
  );
}

function Field({
  label, icon: Icon, error, className, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: LucideIcon; error?: string }) {
  return (
    <div className="w-full">
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <Icon className={iconCls} />
        <input className={`${fieldCls} ${error ? errorFieldCls : ""} ${className ?? ""}`} {...props} />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
