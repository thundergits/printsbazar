"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Tag, LogOut,
  ChevronRight, Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Sidebar navigation entries, in display order.
const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
];

/**
 * Persistent left-hand navigation for the /admin panel.
 * Highlights the nav item matching the current route and exposes
 * quick links to view the live store and log out.
 */
export default function AdminSidebar() {
  const pathname = usePathname();

  /** Clears the admin session cookie via the login route's DELETE handler, then redirects to the login page. */
  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Brand */}
    {/* Brand */}
<div className="px-5 py-5 border-b border-gray-800">
  <Link href="/admin/dashboard" className="block">
    <Image
      src="/images/print-bazar-logo.png"
      alt="PrintsBazar"
      width={160}
      height={40}
      style={{ height: 40, width: "auto" }}
      className="object-contain"
      priority
    />
  </Link>
  <p className="text-xs text-gray-400 mt-2">Admin Panel</p>
</div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          // Match the item's own route and any of its sub-routes (e.g. /admin/orders/[id]).
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-brand-400" : "text-gray-500 group-hover:text-white")} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 text-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: view store + logout */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <Store className="w-5 h-5 text-gray-500" />
          View Store
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
