"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Archive, CheckCircle, ChevronLeft, ChevronRight, Download, Package, Palette, Printer, Truck, Clock, X, Phone, Mail } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { parseCustomization } from "@/lib/customization";
import toast from "react-hot-toast";
import { ADMIN_STATUS_COLOR as STATUS_COLOR, ORDER_STATUSES as STATUSES, statusLabel } from "@/lib/orderStatus";

const STATUS_ICON: Record<string, React.ElementType> = {
  pending: Clock, confirmed: CheckCircle, artwork_review: Palette, printing: Printer,
  packed: Archive, shipped: Truck, delivered: Package, cancelled: X,
};

interface OrderDetail {
  id: string; orderNumber: string; guestName: string; guestEmail: string;
  guestPhone: string; status: string; paymentStatus: string; paymentMethod: string;
  subtotal: number; shippingCost: number; discount: number; total: number;
  shippingAddress: string; notes: string; createdAt: string;
  items: Array<{
    id: string; productName: string; productImage: string;
    quantity: number; price: number; variantInfo?: string;
    customization?: string; uploadedImage?: string;
  }>;
}

interface ViewerImage { src: string; label: string; }

/** Full-screen view of an order item's images, with arrow-key / button navigation */
function ImageViewer({ images, index, onChange, onClose }: {
  images: ViewerImage[]; index: number; onChange: (index: number) => void; onClose: () => void;
}) {
  const current = images[index];
  const go = (step: number) => onChange((index + step + images.length) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-5 py-3 text-white" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium">
          {current.label}
          {images.length > 1 && <span className="text-gray-400 ml-2">{index + 1} / {images.length}</span>}
        </p>
        <div className="flex items-center gap-4">
          <a href={current.src} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300">
            <Download className="w-4 h-4" /> Download
          </a>
          <button onClick={onClose} className="text-gray-400 hover:text-white" title="Close (Esc)">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="relative flex-1 m-4 mt-0">
        <Image src={current.src} alt={current.label} fill unoptimized className="object-contain" sizes="100vw" />
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-900/80 text-white hover:bg-gray-800" title="Previous">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-900/80 text-white hover:bg-gray-800" title="Next">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [viewer, setViewer] = useState<{ images: ViewerImage[]; index: number } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(r => r.json())
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      if (!res.ok) {
        toast.error(updated.error || "Failed to update status");
        return;
      }
      setOrder(updated);
      toast.success(
        updated.customerNotified
          ? `Status updated to ${statusLabel(status)} — customer notified by email`
          : `Status updated to ${statusLabel(status)}`
      );
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const updatePayment = async (paymentStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      const updated = await res.json();
      if (!res.ok) {
        toast.error(updated.error || "Failed to update payment status");
        return;
      }
      setOrder(updated);
      toast.success("Payment status updated");
    } catch {
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="text-center text-gray-400 py-20">Order not found</div>
  );

  let address: Record<string, string> = {};
  try { address = JSON.parse(order.shippingAddress || "{}"); } catch {}

  return (
    <div className="space-y-5 max-w-4xl">
      {viewer && <ImageViewer {...viewer} onChange={(index) => setViewer({ ...viewer, index })} onClose={() => setViewer(null)} />}

      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold text-lg font-mono">{order.orderNumber}</h2>
            <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", STATUS_COLOR[order.status])}>
              {statusLabel(order.status)}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: items + address */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order items */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-300 px-5 py-3.5 border-b border-gray-800">
              Items ({order.items.length})
            </h3>
            <div className="divide-y divide-gray-800">
              {order.items.map((item) => {
                const { frameName, note, photos, texts, font, clock, printUrl } = parseCustomization(item.customization);
                const images: ViewerImage[] = [
                  ...(item.uploadedImage ? [{ src: item.uploadedImage, label: "Customer preview" }] : []),
                  ...photos.map((photo, i) => ({
                    src: photo.originalUrl,
                    label: photos.length > 1 ? `Original photo ${i + 1}` : "Original photo",
                  })),
                  ...(printUrl ? [{ src: printUrl, label: "Print artwork" }] : []),
                ];
                return (
                <div key={item.id} className="px-5 py-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setViewer({ images: images.length ? images : [{ src: item.productImage, label: item.productName }], index: 0 })}
                    className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 hover:ring-2 hover:ring-brand-500 transition"
                    title="View image"
                  >
                    {images.length > 1 && (
                      <span className="absolute bottom-1 right-1 z-10 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/70 text-white">
                        +{images.length - 1}
                      </span>
                    )}
                    <Image
                      src={item.uploadedImage || item.productImage}
                      alt={item.productName}
                      fill
                      unoptimized
                      className={item.uploadedImage ? "object-contain bg-white" : "object-cover"}
                      sizes="80px"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{item.productName}</p>
                    {item.variantInfo && <p className="text-gray-400 text-xs mt-0.5">{item.variantInfo}</p>}
                    {frameName && frameName !== item.productName && (
                      <p className="text-brand-400 text-xs mt-0.5">Frame: {frameName}</p>
                    )}
                    {note && (
                      <p className="text-brand-400 text-xs mt-0.5">Note: {note}</p>
                    )}
                    {item.uploadedImage && (
                      <p className="text-green-400 text-xs mt-0.5 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Custom photo attached
                      </p>
                    )}
                    {texts.map((t) => (
                      <p key={t.label} className="text-gray-300 text-xs mt-0.5">
                        {t.label}: <span className="text-white font-medium">{t.value}</span>
                      </p>
                    ))}
                    {(font || clock) && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        {font && <>Font: {font}</>}
                        {font && clock && " · "}
                        {clock && <>Clock: {clock.face} numbers, {clock.color}</>}
                      </p>
                    )}
                    {photos.map((photo, i) => (
                      <p key={i} className="text-xs mt-0.5">
                        <a href={photo.originalUrl} target="_blank" rel="noopener noreferrer" download className="text-brand-400 underline hover:text-brand-300">
                          Download original{photos.length > 1 ? ` photo ${i + 1}` : ""} for print
                        </a>
                        {photo.crop && (
                          <span className="text-gray-500 ml-2">
                            crop {photo.crop.width}×{photo.crop.height}px at ({photo.crop.x}, {photo.crop.y})
                          </span>
                        )}
                      </p>
                    ))}
                    {printUrl && (
                      <p className="text-xs mt-0.5">
                        <a href={printUrl} target="_blank" rel="noopener noreferrer" download className="text-brand-400 underline hover:text-brand-300">
                          Download print artwork (no clock hands)
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-gray-400 text-xs">× {item.quantity} @ {formatPrice(item.price)}</p>
                  </div>
                </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Delivery Address</h3>
            <div className="text-sm text-gray-300 space-y-0.5">
              <p className="font-semibold text-white">{order.guestName}</p>
              <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
              <p>{address.city}, {address.state} – {address.pincode}</p>
              <p className="text-gray-400 text-xs mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.guestPhone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {order.guestEmail}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: status + summary */}
        <div className="space-y-5">
          {/* Update status */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Update Status</h3>
            <div className="space-y-2">
              {STATUSES.map((s) => {
                const Icon = STATUS_ICON[s] || CheckCircle;
                return (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={updating || order.status === s}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-50",
                      order.status === s
                        ? STATUS_COLOR[s] + " cursor-default"
                        : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{statusLabel(s)}</span>
                    {order.status === s && <span className="text-xs opacity-70">Current</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span><span>{order.shippingCost ? formatPrice(order.shippingCost) : "FREE"}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span><span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-gray-800">
                <span>Total</span><span className="text-brand-400">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Payment Method</span>
                <span className="text-xs text-white capitalize">{order.paymentMethod || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Payment Status</span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium",
                    order.paymentStatus === "paid"
                      ? "bg-green-400/10 text-green-400 border-green-400/20"
                      : "bg-gray-400/10 text-gray-400 border-gray-400/20"
                  )}>
                    {order.paymentStatus}
                  </span>
                  {order.paymentStatus !== "paid" && (
                    <button
                      onClick={() => updatePayment("paid")}
                      className="text-xs text-brand-400 hover:text-brand-300 underline"
                    >
                      Mark paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
