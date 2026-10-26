"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Search, Phone, Truck, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Acrylic Photos", href: "/customise/acrylic-print" },
  { label: "Wall Clocks", href: "/customise/wall-clocks" },
  { label: "Name Plates", href: "/customise/acrylic-name-plate" },
  { label: "Products", href: "/products" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
];

interface HeaderProps {
  user?: { name: string; email: string } | null;
}

export default function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-gradient-brand text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center flex-wrap gap-1">
        <Truck className="w-3.5 h-3.5 inline" /> Free shipping on orders above ₹499 | Made in India
        <span className="mx-3">|</span>
        <a href="tel:+919876543210" className="underline hover:no-underline inline-flex items-center gap-1">
          <Phone className="w-3 h-3" /> +91 98765 43210
        </a>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 bg-gray-950 border-b border-gray-800 transition-shadow duration-300",
          scrolled ? "shadow-lg" : ""
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
        {/* Logo Image */}
<Link
  href="/"
  className="flex-shrink-0 flex items-center"
  aria-label="PrintsBazar Home"
>
  <Image
    src="/images/print-bazar-logo.png"
    alt="PrintsBazar Logo"
    width={180}
    height={56}
    priority
    className="h-14 w-auto object-contain"
  />
</Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-brand-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                aria-label="Search"
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg hover:bg-white/5 text-gray-300 hover:text-brand-400 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href={user ? "/account" : "/account/login"}
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg hover:bg-white/5 text-gray-300 hover:text-brand-400 transition-colors"
                aria-label={user ? `Account — ${user.name}` : "Login"}
                title={user ? `Hi, ${user.name.split(" ")[0]}` : "Login"}
              >
                <User className="w-5 h-5" />
              </Link>

              <Link
                href="/cart"
                className="relative flex w-9 h-9 items-center justify-center rounded-lg hover:bg-white/5 text-gray-300 hover:text-brand-400 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-gray-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>

              <button
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-300 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-brand-400 hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={user ? "/account" : "/account/login"}
              className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-brand-400 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {user ? `My Account (${user.name.split(" ")[0]})` : "Login / Sign Up"}
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
