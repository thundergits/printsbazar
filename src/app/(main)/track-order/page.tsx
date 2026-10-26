"use client";
import { useEffect, useState } from "react";
import {
  Search, Package, Truck, CheckCircle, Clock,
  Palette, Printer, Archive, MapPin
} from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Order Received",
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-500",
    desc: "We've received your order and are reviewing it.",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500",
    desc: "Your order is confirmed and will go into production soon.",
  },
  {
    key: "artwork_review",
    label: "Artwork Review",
    icon: Palette,
    color: "text-purple-500",
    bg: "bg-purple-500",
    desc: "Our team is reviewing your uploaded artwork.",
  },
  {
    key: "printing",
    label: "Printing",
    icon: Printer,
    color: "text-blue-500",
    bg: "bg-blue-500",
    desc: "Your product is being printed with premium quality.",
  },
  {
    key: "packed",
    label: "Packed",
    icon: Archive,
    color: "text-indigo-500",
    bg: "bg-indigo-500",
    desc: "Your order has been carefully packed.",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Truck,
    color: "text-brand-500",
    bg: "bg-brand-500",
    desc: "Your order is on the way!",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-600",
    desc: "Your order has been delivered. Enjoy!",
  },
];

const CANCELLED_STEP = {
  key: "cancelled",
  label: "Cancelled",
  icon: MapPin,
  color: "text-red-500",
  bg: "bg-red-500",
  desc: "This order was cancelled.",
};

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

  return (
    <div className="min-h-screen bg-cream-50 py-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your order number and the email you ordered with</p>
        </div>

        {/* Search form */}
        <div className="card p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Number</label>
              <input
                type="text"
                placeholder="e.g. MS-ABC123-XYZ"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="input"
              />
            </div>
            <Button size="lg" className="w-full rounded-2xl" onClick={handleTrack} loading={loading}>
              <Search className="w-5 h-5" /> Track Order
            </Button>
          </div>
          {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
        </div>

        {/* Order result */}
        {order && (
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Order Number</p>
                <p className="font-bold text-gray-800 text-lg font-mono">{order.orderNumber as string}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeStyle(order.status as string)}`}>
                {getStatusLabel(order.status as string)}
              </span>
            </div>

            {/* Cancelled message */}
            {isCancelled ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 font-medium">This order was cancelled.</p>
                <p className="text-sm text-red-400 mt-1">
                  If you believe this is an error, please contact us.
                </p>
              </div>
            ) : (
              /* Progress steps */
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" style={{ zIndex: 0 }} />
                <div
                  className="absolute top-5 left-5 h-0.5 bg-brand-500 transition-all duration-500"
                  style={{
                    zIndex: 1,
                    width: currentStep >= 0
                      ? `${(currentStep / (activeSteps.length - 1)) * (100 - (10 / activeSteps.length))}%`
                      : "0%",
                  }}
                />
                <div className="flex items-start justify-between relative" style={{ zIndex: 2 }}>
                  {activeSteps.map((step, i) => {
                    const done = i <= currentStep;
                    const current = i === currentStep;
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all border-2 ${
                            done
                              ? `${step.bg} text-white border-transparent shadow-md`
                              : "bg-white border-gray-200 text-gray-300"
                          } ${current ? "ring-4 ring-brand-100" : ""}`}
                        >
                          <step.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] text-center font-medium hidden sm:block leading-tight ${done ? "text-gray-700" : "text-gray-400"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Current step description */}
                {currentStep >= 0 && (
                  <div className="mt-4 p-3 bg-brand-50 rounded-xl text-center">
                    <p className="text-sm text-brand-700 font-medium">
                      {activeSteps[currentStep]?.desc}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Order items */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</p>
              <div className="space-y-2">
                {(order.items as Array<{ productName: string; quantity: number; price: number; variantInfo?: string }>).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      {item.variantInfo && <p className="text-xs text-gray-500">{item.variantInfo}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">× {item.quantity}</p>
                      <p className="font-semibold text-brand-600">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-brand-600">{formatPrice(order.total as number)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
