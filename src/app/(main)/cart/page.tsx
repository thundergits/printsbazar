"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Tag, CheckCircle2, Lock, Truck, CreditCard } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_MIN as SHIPPING_THRESHOLD, SHIPPING_FEE as SHIPPING_COST } from "@/lib/pricing";
import { parseCustomization } from "@/lib/customization";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const sub = subtotal();
  const shippingFree = sub >= SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : SHIPPING_COST;
  const couponDiscount = appliedCoupon ? Math.round(sub * appliedCoupon.discount) : 0;
  const total = sub + shipping - couponDiscount;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "MAA20") {
      setAppliedCoupon({ code: "MAA20", discount: 0.2 });
      toast.success("Coupon applied! 20% off");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-cream-50 via-[#fbf3e6] to-cream-100">
        <div className="relative w-full max-w-md text-center bg-white rounded-[2rem] shadow-card border border-brand-100/60 px-6 py-12 sm:px-10 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand-100/60 blur-2xl pointer-events-none" />
          <div className="relative mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-cream-100 to-brand-100 ring-8 ring-brand-50 flex items-center justify-center">
            <ShoppingBag className="w-11 h-11 text-brand-500" strokeWidth={1.5} />
          </div>
          <h2 className="relative font-display text-3xl font-bold text-maroon-700 mb-3">
            Your cart is <span className="italic font-normal text-gradient">empty</span>
          </h2>
          <p className="relative text-gray-500 mb-8 text-sm sm:text-base">
            Looks like you haven&apos;t added anything yet. Explore our collection and create something special!
          </p>
          <Link
            href="/products"
            className="relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-8 py-4 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <ShoppingBag className="w-5 h-5" /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const shippingProgress = Math.min((sub / SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-[#fbf6ec] to-cream-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title row */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-500/30 items-center justify-center text-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-maroon-700 leading-tight">
                Your <span className="italic font-normal text-gradient">Cart</span>
              </h1>
              <span className="inline-block mt-1 rounded-full bg-brand-50 border border-brand-100 px-3 py-0.5 text-xs font-medium text-brand-700">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-maroon-600 hover:text-brand-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Browse Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free shipping progress */}
            {!shippingFree && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-brand-100/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 flex flex-wrap items-center justify-between gap-x-3 text-sm">
                    <span className="text-gray-600">
                      Add <span className="font-semibold text-brand-600">{formatPrice(SHIPPING_THRESHOLD - sub)}</span> more for free shipping!
                    </span>
                    <span className="text-xs text-gray-400">{formatPrice(SHIPPING_THRESHOLD)}</span>
                  </div>
                </div>
                <div className="relative h-2.5 bg-cream-200 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-brand-300 to-brand-600 rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                  <span
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-brand-500 shadow transition-all duration-500"
                    style={{ left: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}
            {shippingFree && (
              <div className="rounded-2xl p-4 border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-green-700 text-sm font-semibold">You&apos;ve got free shipping!</p>
              </div>
            )}

            {items.map((item) => {
              const { frameName, note, texts } = parseCustomization(item.customization);
              return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl p-3 sm:p-4 shadow-card border border-brand-100/60 hover:shadow-card-hover transition-shadow flex gap-3 sm:gap-5"
              >
                {/* Product image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-cream-100 ring-1 ring-cream-200">
                  {item.uploadedImage ? (
                    <Image src={item.uploadedImage} alt={item.name} fill className="object-contain bg-white" sizes="128px" />
                  ) : (
                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="128px" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-sans font-semibold text-maroon-700 text-sm sm:text-base leading-snug line-clamp-2">{item.name}</h3>
                      {item.variantInfo && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.variantInfo}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {texts.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {texts.map((t) => (
                        <p key={t.label} className="text-xs text-gray-500 truncate">
                          {t.label}: <span className="font-medium text-gray-700">{t.value}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {frameName && frameName !== item.name && (
                      <span className="text-[11px] text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                        Frame: {frameName}
                      </span>
                    )}
                    {note && (
                      <span className="text-[11px] text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full max-w-full truncate">
                        Note: {note}
                      </span>
                    )}
                    {item.uploadedImage && (
                      <span className="text-[11px] text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Custom photo uploaded
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-auto pt-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-1 rounded-full bg-cream-100 p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white text-maroon-600 shadow-sm hover:bg-brand-500 hover:text-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-maroon-700">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white text-maroon-600 shadow-sm hover:bg-brand-500 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-base sm:text-lg text-brand-600">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl shadow-card border border-brand-100/60 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300" />
              <div className="p-5 sm:p-6">
                <h2 className="font-display text-2xl font-bold text-maroon-700 mb-5">
                  Order <span className="italic font-normal text-gradient">Summary</span>
                </h2>

                {/* Coupon */}
                <div className="mb-5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                    <Tag className="w-3.5 h-3.5 text-brand-500" />Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-green-300 bg-green-50 px-4 py-3">
                      <span className="text-green-700 text-sm font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> {appliedCoupon.code} applied!
                      </span>
                      <button onClick={() => setAppliedCoupon(null)} className="text-gray-400 hover:text-red-500 text-xs font-medium">Remove</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded-full border-2 border-dashed border-brand-200 bg-cream-50 p-1 focus-within:border-brand-400 transition-colors">
                      <input
                        type="text"
                        placeholder="Try MAA20"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 outline-none"
                      />
                      <button
                        onClick={applyCoupon}
                        className="rounded-full bg-maroon-700 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Breakdown */}
                <div className="space-y-3 text-sm rounded-2xl bg-cream-50 p-4 mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">{formatPrice(sub)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (20%)</span>
                      <span className="font-medium">−{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shippingFree ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      <span className="font-medium text-gray-800">{formatPrice(SHIPPING_COST)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-baseline font-bold border-t border-dashed border-cream-200 pt-3">
                    <span className="text-maroon-700">Total</span>
                    <span className="text-2xl text-brand-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 py-4 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </Link>

                <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                  <span className="flex items-center justify-center gap-1.5 rounded-full bg-cream-50 py-2">
                    <Lock className="w-3.5 h-3.5 text-brand-500" /> Secure checkout
                  </span>
                  <span className="flex items-center justify-center gap-1.5 rounded-full bg-cream-50 py-2">
                    <CreditCard className="w-3.5 h-3.5 text-brand-500" /> UPI · Cards · COD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
