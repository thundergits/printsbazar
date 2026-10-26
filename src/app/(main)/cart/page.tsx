"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, CheckCircle2, Lock } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="w-16 h-16 text-brand-300 mb-6" strokeWidth={1.5} />
        <h2 className="font-display text-3xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Looks like you haven&apos;t added anything yet. Explore our collection and create something special!
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-2xl">
            <ShoppingBag className="w-5 h-5" /> Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">Your Cart</h1>
        <p className="text-gray-500 mb-8">{items.length} item{items.length !== 1 ? "s" : ""}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free shipping progress */}
            {!shippingFree && (
              <div className="card p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    Add <span className="font-semibold text-brand-600">{formatPrice(SHIPPING_THRESHOLD - sub)}</span> more for free shipping!
                  </span>
                  <span className="text-gray-400">{formatPrice(SHIPPING_THRESHOLD)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-brand rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((sub / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {shippingFree && (
              <div className="card p-4 border border-green-200 bg-green-50">
                <p className="text-green-700 text-sm font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> You&apos;ve got free shipping!
                </p>
              </div>
            )}

            {items.map((item) => {
              const { frameName, note, texts } = parseCustomization(item.customization);
              return (
              <div key={item.id} className="card p-4 flex gap-4">
                {/* Product image */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-cream-100">
                  {item.uploadedImage ? (
                    <Image src={item.uploadedImage} alt={item.name} fill className="object-contain bg-white" sizes="96px" />
                  ) : (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 mb-0.5 truncate">{item.name}</h3>
                  {item.variantInfo && (
                    <p className="text-xs text-gray-500 mb-1">{item.variantInfo}</p>
                  )}
                  {texts.map((t) => (
                    <p key={t.label} className="text-xs text-gray-600 mb-0.5 truncate">
                      {t.label}: <span className="font-medium text-gray-800">{t.value}</span>
                    </p>
                  ))}
                  {frameName && frameName !== item.name && (
                    <p className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full inline-block mb-1 mr-1">
                      Frame: {frameName}
                    </p>
                  )}
                  {note && (
                    <p className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full inline-block mb-1">
                      Note: {note}
                    </p>
                  )}
                  {item.uploadedImage && (
                    <p className="text-xs text-green-600 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Custom photo uploaded
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-600">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-semibold text-gray-800 text-lg mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />Coupon Code
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <span className="text-green-700 text-sm font-semibold">{appliedCoupon.code} applied!</span>
                    <button onClick={() => setAppliedCoupon(null)} className="text-gray-400 hover:text-red-500 text-xs">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try MAA20"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      className="input text-sm flex-1"
                    />
                    <Button size="sm" onClick={applyCoupon} className="rounded-xl">Apply</Button>
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-sm border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(sub)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (20%)</span>
                    <span>−{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shippingFree ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>{formatPrice(SHIPPING_COST)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-4 mb-6">
                <span>Total</span>
                <span className="text-brand-600">{formatPrice(total)}</span>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full rounded-2xl">
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure checkout</span>
                <span>·</span>
                <span>UPI · Cards · COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
