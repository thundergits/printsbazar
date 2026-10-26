"use client";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/orders":    "Orders",
  "/admin/products":  "Products",
  "/admin/coupons":   "Coupons",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] || "Admin";

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between flex-shrink-0">
      <h1 className="text-white font-semibold text-lg">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-maroon-600 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
