"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Suspense } from "react";
import { ADMIN_STATUS_COLOR as STATUS_COLOR, ORDER_STATUSES, statusLabel } from "@/lib/orderStatus";

const STATUSES = ["", ...ORDER_STATUSES];

interface Order {
  id: string; orderNumber: string; guestName: string; guestEmail: string;
  guestPhone: string; status: string; paymentStatus: string; paymentMethod: string;
  total: number; createdAt: string; items: Array<{ productName: string; quantity: number }>;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") || "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = (status: string) => {
    setLoading(true);
    const url = `/api/admin/orders${status ? `?status=${status}` : ""}`;
    fetch(url).then(r => r.json()).then(d => {
      setOrders(d.orders || []);
      setTotal(d.total || 0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(statusFilter); }, [statusFilter]);

  const filtered = search
    ? orders.filter(o =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (o.guestName || "").toLowerCase().includes(search.toLowerCase()) ||
        (o.guestEmail || "").toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || "all"}
            onClick={() => router.push(s ? `/admin/orders?status=${s}` : "/admin/orders")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              statusFilter === s
                ? "bg-brand-500 border-brand-500 text-white"
                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
            )}
          >
            {s ? statusLabel(s) : "All"}
          </button>
        ))}
      </div>

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by order #, name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <span className="text-sm text-gray-400">{total} orders</span>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-14 text-sm">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  {["Order #", "Customer", "Items", "Status", "Payment", "Total", "Date", ""].map(h => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-brand-400 font-medium whitespace-nowrap">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">{order.orderNumber}</Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="group block">
                        <p className="text-white font-medium group-hover:text-brand-400 group-hover:underline">{order.guestName || "—"}</p>
                        <p className="text-gray-500 text-xs">{order.guestEmail}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {order.items[0]?.productName}
                      {order.items.length > 1 && <span className="text-gray-500 text-xs"> +{order.items.length - 1}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap", STATUS_COLOR[order.status])}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize",
                        order.paymentStatus === "paid"
                          ? "bg-green-400/10 text-green-400 border-green-400/20"
                          : "bg-gray-400/10 text-gray-400 border-gray-400/20"
                      )}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-white whitespace-nowrap">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-gray-500 hover:text-brand-400 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <OrdersContent />
    </Suspense>
  );
}
