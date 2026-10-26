import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { MapPin, Package, ChevronRight } from "lucide-react";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import LogoutButton from "@/components/account/LogoutButton";
import { statusLabel } from "@/lib/orderStatus";

const STATUS_VARIANT: Record<string, "orange" | "green" | "gray" | "red"> = {
  confirmed: "orange",
  artwork_review: "orange",
  printing: "orange",
  packed: "orange",
  shipped: "orange",
  delivered: "green",
  cancelled: "red",
};

export default async function AccountPage() {
  const user = await getCustomerSession();
  if (!user) redirect("/account/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">My Account</h1>
            <p className="text-gray-500 text-sm mt-1">{user.name} · {user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <Link href="/account/addresses" className="card p-5 flex items-center gap-4 mb-8 hover:shadow-lg transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-brand-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Saved Addresses</h3>
            <p className="text-xs text-gray-500">Manage your delivery addresses</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>

        <h2 className="font-semibold text-gray-800 text-lg mb-4">Order History</h2>

        {orders.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-medium">No orders yet</p>
            <Link href="/products" className="text-brand-600 text-sm font-medium hover:text-brand-700 mt-2 inline-block">
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "gray"}>{statusLabel(order.status)}</Badge>
                </div>
                <div className="flex gap-2 mb-3">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                      <Image src={item.uploadedImage || item.productImage} alt={item.productName} fill className="object-cover" sizes="48px" />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-cream-100 flex items-center justify-center text-xs text-gray-500 font-medium flex-shrink-0">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                  <span className="text-gray-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                  <span className="font-semibold text-brand-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
