"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, Package, Truck, CheckCircle, Clock, Check,
  Palette, Printer, Archive, MapPin, Hash, Mail, ChevronRight,
  XCircle, CalendarDays, CreditCard, ShoppingBag, Headphones,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "pending", label: "Order Received", icon: Clock, desc: "We've received your order and are reviewing it." },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle, desc: "Your order is confirmed and will go into production soon." },
  { key: "artwork_review", label: "Artwork Review", icon: Palette, desc: "Our team is reviewing your uploaded artwork." },
  { key: "printing", label: "Printing", icon: Printer, desc: "Your product is being printed with premium quality." },
  { key: "packed", label: "Packed", icon: Archive, desc: "Your order has been carefully packed." },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "Your order is on the way!" },
  { key: "delivered", label: "Delivered", icon: Package, desc: "Your order has been delivered. Enjoy!" },
];

const CANCELLED_STEP = {
  key: "cancelled",
  label: "Cancelled",
  icon: MapPin,
  desc: "This order was cancelled.",
};

type OrderItem = { productName: string; quantity: number; price: number; variantInfo?: string };

const fieldCls =
  "w-full pl-11 pr-4 py-3.5 rounded-2xl border border-cream-200 bg-cream-50/60 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const iconCls = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2";

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Links in order emails carry ?order=…&email=…, so the order shows up in one click
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedOrder = params.get("order");
    const linkedEmail = params.get("email");
    if (linkedOrder && linkedEmail) {
      setQuery(linkedOrder);
      setEmail(linkedEmail);
      track(linkedOrder, linkedEmail);
    }
  }, []);

  const handleTrack = () => track(query, email);

  const track = async (orderNumber: string, emailAddress: string) => {
    if (!orderNumber.trim() || !emailAddress.trim()) {
      setError("Please enter both your order number and email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ orderNumber: orderNumber.trim(), email: emailAddress.trim() });
      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) {
        setError(
          res.status === 429
            ? "Too many attempts. Please wait a few minutes and try again."
            : "Order not found. Please check your order number and email address."
        );
        setOrder(null);
        return;
      }
      setOrder(await res.json());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = order?.status === "cancelled";
  const activeSteps = isCancelled ? [] : STATUS_STEPS;
  const currentStep = isCancelled
    ? -1
    : STATUS_STEPS.findIndex((s) => s.key === (order?.status as string));

  const getStatusBadgeStyle = (status: string) => {
    if (status === "delivered") return "bg-green-100 text-green-700";
    if (status === "shipped") return "bg-brand-100 text-brand-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    if (status === "printing") return "bg-blue-100 text-blue-700";
    if (status === "artwork_review") return "bg-purple-100 text-purple-700";
    if (status === "packed") return "bg-indigo-100 text-indigo-700";
    if (status === "confirmed") return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusLabel = (status: string) => {
    const step = [...STATUS_STEPS, CANCELLED_STEP].find((s) => s.key === status);
    return step?.label ?? status;
  };

  const n = activeSteps.length;
  const items = (order?.items as OrderItem[] | undefined) ?? [];
  const placedOn = order?.createdAt
    ? new Date(order.createdAt as string).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const paymentStatus = order?.paymentStatus as string | undefined;

  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden pb-14">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-maroon-800 via-maroon-700 to-maroon-800 pt-12 pb-28 sm:pt-16 sm:pb-32">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <Truck className="hidden md:block absolute right-[8%] top-1/2 -translate-y-1/2 w-40 h-40 text-brand-400/10" strokeWidth={1} />
        <Package className="hidden md:block absolute left-[7%] top-1/3 w-24 h-24 text-brand-400/10" strokeWidth={1} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <nav className="flex items-center justify-center gap-1 text-xs text-white/50 mb-5">
            <Link href="/" className="hover:text-brand-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-300">Track Order</span>
          </nav>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Track Your <span className="italic font-normal text-gradient">Order</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base">Enter your order number and the email you ordered with</p>
        </div>
      </section>

      <div className="relative -mt-20 sm:-mt-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Search form */}
        <div className="bg-white rounded-3xl shadow-card border border-brand-100/60 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300" />
          <form
            onSubmit={(e) => { e.preventDefault(); handleTrack(); }}
            className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 md:items-end"
          >
            <div>
              <label className={labelCls}>Order Number</label>
              <div className="relative">
                <Hash className={iconCls} />
                <input
                  type="text"
                  placeholder="e.g. MS-ABC123-XYZ"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={fieldCls}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <div className="relative">
                <Mail className={iconCls} />
                <input
                  type="email"
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldCls}
                />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full md:w-auto rounded-full shadow-lg shadow-brand-500/30 whitespace-nowrap" loading={loading}>
              <Search className="w-5 h-5" /> Track Order
            </Button>
          </form>
          {error && (
            <div className="mx-5 sm:mx-7 mb-5 sm:mb-7 -mt-1 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Order result */}
        {order ? (
          <div className="bg-white rounded-3xl shadow-card border border-brand-100/60 overflow-hidden">
            {/* Summary header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-cream-100 via-brand-50 to-cream-100 px-5 sm:px-7 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-brand-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-500/30 flex items-center justify-center text-white flex-shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600 mb-0.5">Order Number</p>
                  <p className="font-bold text-maroon-700 text-lg font-mono break-all">{order.orderNumber as string}</p>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusBadgeStyle(order.status as string)}`}>
                {getStatusLabel(order.status as string)}
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-8">
              {/* Meta chips */}
              {(placedOn || paymentStatus) && (
                <div className="flex flex-wrap gap-2">
                  {placedOn && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 text-xs text-gray-600">
                      <CalendarDays className="w-3.5 h-3.5 text-brand-500" /> Placed on {placedOn}
                    </span>
                  )}
                  {paymentStatus && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 text-xs text-gray-600 capitalize">
                      <CreditCard className="w-3.5 h-3.5 text-brand-500" /> Payment: {paymentStatus}
                    </span>
                  )}
                </div>
              )}

              {/* Cancelled message */}
              {isCancelled ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                  <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 font-semibold">This order was cancelled.</p>
                  <p className="text-sm text-red-400 mt-1">
                    If you believe this is an error, please <Link href="/contact" className="underline">contact us</Link>.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Desktop: horizontal stepper */}
                  <div className="hidden md:block relative">
                    <div
                      className="absolute top-6 h-1 rounded-full bg-cream-200"
                      style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
                    />
                    <div
                      className="absolute top-6 h-1 rounded-full bg-gradient-to-r from-brand-300 to-brand-600 transition-all duration-700"
                      style={{
                        left: `${50 / n}%`,
                        width: currentStep > 0 ? `${(currentStep / (n - 1)) * (100 - 100 / n)}%` : "0%",
                      }}
                    />
                    <ol className="relative flex">
                      {activeSteps.map((step, i) => {
                        const done = i < currentStep;
                        const current = i === currentStep;
                        return (
                          <li key={step.key} className="flex-1 flex flex-col items-center text-center px-1">
                            <div
                              className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                                current
                                  ? "bg-maroon-700 text-brand-300 ring-4 ring-brand-200 shadow-lg scale-110"
                                  : done
                                  ? "bg-gradient-to-br from-brand-300 to-brand-600 text-white shadow-md"
                                  : "bg-white border-2 border-cream-200 text-gray-300"
                              }`}
                            >
                              {done ? <Check className="w-5 h-5" strokeWidth={3} /> : <step.icon className="w-5 h-5" />}
                              {current && <span className="absolute inset-0 rounded-full animate-ping bg-brand-400/30" />}
                            </div>
                            <span className={`text-xs font-semibold leading-tight ${current ? "text-maroon-700" : done ? "text-gray-600" : "text-gray-400"}`}>
                              {step.label}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  {/* Mobile: vertical timeline */}
                  <ol className="md:hidden relative">
                    {activeSteps.map((step, i) => {
                      const done = i < currentStep;
                      const current = i === currentStep;
                      const last = i === n - 1;
                      return (
                        <li key={step.key} className="relative flex gap-4 pb-5 last:pb-0">
                          {!last && (
                            <span
                              className={`absolute left-5 top-10 bottom-0 w-0.5 -translate-x-1/2 ${i < currentStep ? "bg-brand-400" : "bg-cream-200"}`}
                            />
                          )}
                          <div
                            className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              current
                                ? "bg-maroon-700 text-brand-300 ring-4 ring-brand-200"
                                : done
                                ? "bg-gradient-to-br from-brand-300 to-brand-600 text-white"
                                : "bg-white border-2 border-cream-200 text-gray-300"
                            }`}
                          >
                            {done ? <Check className="w-4 h-4" strokeWidth={3} /> : <step.icon className="w-4 h-4" />}
                          </div>
                          <div className="pt-2">
                            <p className={`text-sm font-semibold ${current ? "text-maroon-700" : done ? "text-gray-600" : "text-gray-400"}`}>
                              {step.label}
                            </p>
                            {current && <p className="text-xs text-brand-700 mt-1">{step.desc}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>

                  {/* Current step description (desktop) */}
                  {currentStep >= 0 && (
                    <div className="hidden md:flex mt-8 items-center justify-center gap-2 rounded-2xl bg-brand-50 border border-brand-100 p-4">
                      {(() => {
                        const StepIcon = activeSteps[currentStep].icon;
                        return <StepIcon className="w-5 h-5 text-brand-600" />;
                      })()}
                      <p className="text-sm text-brand-700 font-medium">{activeSteps[currentStep]?.desc}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Order items + totals */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Items Ordered</p>
                  <div className="rounded-2xl border border-cream-200 divide-y divide-cream-200">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 text-sm">
                        <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-brand-500 flex-shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-maroon-700">{item.productName}</p>
                          {item.variantInfo && <p className="text-xs text-gray-500">{item.variantInfo}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400">× {item.quantity}</p>
                          <p className="font-semibold text-brand-600">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-cream-50 border border-cream-200 p-5 h-fit space-y-2.5 text-sm">
                  {typeof order.subtotal === "number" && (
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                    </div>
                  )}
                  {typeof order.shippingCost === "number" && (
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{order.shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(order.shippingCost)}</span>
                    </div>
                  )}
                  {typeof order.discount === "number" && order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span><span>− {formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-cream-200 text-maroon-700">
                    <span>Total</span>
                    <span className="text-brand-600">{formatPrice(order.total as number)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Help strip */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Mail, title: "Check your email", desc: "Your order number is in the confirmation email we sent you." },
              { icon: Truck, title: "3–7 Days", desc: "Delivered across India within 3–7 business days." },
              { icon: Headphones, title: "Need help?", desc: "Our team is happy to help with your order.", href: "/contact" },
            ].map((tip) => {
              const body = (
                <>
                  <div className="w-11 h-11 rounded-2xl bg-cream-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <tip.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-maroon-700 text-sm">{tip.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{tip.desc}</p>
                  </div>
                </>
              );
              const cls = "flex items-start gap-3 bg-white rounded-2xl p-4 shadow-card border border-brand-100/60";
              return tip.href ? (
                <Link key={tip.title} href={tip.href} className={`${cls} hover:shadow-card-hover hover:-translate-y-0.5 transition-all`}>{body}</Link>
              ) : (
                <div key={tip.title} className={cls}>{body}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
