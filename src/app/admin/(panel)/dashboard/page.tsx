"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, Package, IndianRupee, TrendingUp,
  Clock, CheckCircle, Truck, ArrowRight, Palette, Printer, Archive, X
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ADMIN_STATUS_COLOR as STATUS_COLOR, statusLabel } from "@/lib/orderStatus";

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string; orderNumber: string; guestName: string; guestEmail: string;
    status: string; total: number; createdAt: string;
    items: Array<{ productName: string }>;
  }>;
  ordersByStatus: Array<{ status: string; _count: { _all: number } }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statusMap = Object.fromEntries(
    (stats?.ordersByStatus || []).map(s => [s.status, s._count._all])
  );

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "from-blue-500 to-blue-600", format: "number" },
          { label: "Total Revenue", value: stats?.totalRevenue ?? 0, icon: IndianRupee, color: "from-brand-500 to-brand-600", format: "currency" },
          { label: "Active Products", value: stats?.totalProducts ?? 0, icon: Package, color: "from-purple-500 to-purple-600", format: "number" },
          { label: "Delivered", value: statusMap["delivered"] ?? 0, icon: TrendingUp, color: "from-green-500 to-green-600", format: "number" },
        ].map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">{card.label}</p>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {card.format === "currency" ? formatPrice(card.value as number) : card.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      {/* Order status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "pending",        icon: Clock },
          { key: "confirmed",      icon: CheckCircle },
          { key: "artwork_review", icon: Palette },
          { key: "printing",       icon: Printer },
          { key: "packed",         icon: Archive },
          { key: "shipped",        icon: Truck },
          { key: "delivered",      icon: Package },
          { key: "cancelled",      icon: X },
        ].map(({ key, icon: Icon }) => (
          <Link
            key={key}
            href={`/admin/orders?status=${key}`}
            className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 text-center transition-colors"
          >
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border mb-2 ${STATUS_COLOR[key]}`}>
              <Icon className="w-3 h-3" />
              {statusLabel(key)}
            </div>
            <p className="text-xl font-bold text-white">{statusMap[key] ?? 0}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {(stats?.recentOrders ?? []).length === 0 && (
            <p className="text-center text-gray-500 py-10 text-sm">No orders yet</p>
          )}
          {(stats?.recentOrders ?? []).map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-white">{order.orderNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${STATUS_COLOR[order.status]}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {order.guestName || order.guestEmail} · {order.items[0]?.productName}
                  {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-brand-400">{formatPrice(order.total)}</p>
                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
