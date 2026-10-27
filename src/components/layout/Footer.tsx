"use client";
import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import Image from "next/image";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "Acrylic Photos", href: "/customise/acrylic-print" },
  { label: "Wall Clocks", href: "/customise/wall-clocks" },
  { label: "Name Plates", href: "/customise/acrylic-name-plate" },
  { label: "Fridge Magnets", href: "/products?category=fridge-magnets" },
  { label: "Keychains", href: "/products?category=keychains" },
  { label: "Track Order", href: "/track-order" },
];

const SUPPORT_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return & Refund", href: "/return-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "FAQ", href: "/faq" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
           <div className="mb-4 w-full">
  <Link href="/" aria-label="PrintsBazar Home" className="inline-flex">
    <Image
      src="/images/print-bazar-logo.png"
      alt="PrintsBazar Logo"
      width={200}
      height={70}
      priority
      className="w-[180px] h-auto object-contain object-left"
    />
  </Link>
</div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Gifts change. Memories remain. Custom prints, photo gifts & signage crafted with love, across India.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+918969179285" className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                +91 8969179285
              </a>
              <a href="mailto:hello@printsbazar.in" className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                hello@printsbazar.in
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs">C.R. Complex, R.K. Bhattacharya Road, Patna – 800001</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Products</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-brand-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-brand-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Social */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Stay Connected</h4>
            <p className="text-xs text-gray-400 mb-3">Get exclusive deals & new arrivals in your inbox.</p>
            <form className="flex gap-2 mb-5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-brand-500 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Go
              </button>
            </form>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/printsbazar.in/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-600 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61592304432771"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} PrintsBazar. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 opacity-70">Paytm</span>
            <span>|</span>
            <span>UPI · Cards · COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
