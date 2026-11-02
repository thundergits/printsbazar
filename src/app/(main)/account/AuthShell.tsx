import Link from "next/link";
import Image from "next/image";
import { Package, Truck, Shield, Sparkles, Star } from "lucide-react";

const PERKS = [
  { icon: Package, text: "Premium Quality" },
  { icon: Truck, text: "Fast Delivery" },
  { icon: Shield, text: "Happiness Guarantee" },
];

/** Shared input styles for the login and signup forms */
export const fieldCls =
  "w-full pl-11 pr-4 py-3.5 rounded-2xl border border-cream-200 bg-cream-50/60 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
export const iconCls = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none";
export const labelCls = "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2";

/** Two-panel layout for the account auth pages: dark logo panel + form panel */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-10 sm:py-14 bg-gradient-to-br from-cream-50 via-[#fbf3e6] to-[#f3e3c8] overflow-hidden">
      <div className="absolute -top-32 -right-24 w-96 h-96 bg-brand-200 rounded-full opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-[#f1d9b5] rounded-full opacity-60 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1.05fr_1fr] bg-white rounded-[2rem] shadow-2xl shadow-maroon-900/20 overflow-hidden ring-1 ring-brand-200/60">
        {/* Brand panel — compact band on mobile, full panel from md up */}
        <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_#2a2420_0%,_#1c1917_55%,_#0a0908_100%)] px-6 py-8 md:p-10 lg:p-12 text-white flex flex-col items-center justify-center text-center">
          {/* Gold rings + glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-brand-400/20 pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-brand-400/10 pointer-events-none" />
          <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full border border-brand-400/15 pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(#d4af37 1px, transparent 1px)", backgroundSize: "22px 22px" }}
          />

          <div className="relative w-full max-w-sm">
            <Link href="/" aria-label="PrintsBazar home" className="inline-block">
              <Image
                src="/images/print-bazar-logo.png"
                alt="PrintsBazar"
                width={472}
                height={306}
                priority
                className="w-32 md:w-48 lg:w-52 h-auto mx-auto drop-shadow-[0_8px_24px_rgba(212,175,55,0.25)]"
              />
            </Link>

            {/* Ornament */}
            <div className="flex items-center justify-center gap-3 my-5 md:my-7">
              <span className="h-px w-10 md:w-14 bg-gradient-to-r from-transparent to-brand-400" />
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="h-px w-10 md:w-14 bg-gradient-to-l from-transparent to-brand-400" />
            </div>

            <h2 className="font-display text-2xl md:text-4xl font-bold leading-tight">
              Gifts change.{" "}
              <br className="hidden md:block" />
              <span className="italic font-normal text-gradient">Memories remain.</span>
            </h2>

            {/* Perks */}
            <ul className="hidden md:grid grid-cols-3 gap-3 mt-10">
              {PERKS.map((p) => (
                <li key={p.text} className="flex flex-col items-center gap-2 rounded-2xl border border-brand-400/20 bg-white/[0.04] backdrop-blur px-2 py-4">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-maroon-900 shadow-lg shadow-brand-500/20">
                    <p.icon className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] lg:text-xs font-medium text-white/80 leading-tight">{p.text}</span>
                </li>
              ))}
            </ul>

            {/* Rating chip */}
            <div className="hidden md:inline-flex items-center gap-2 mt-8 rounded-full border border-brand-400/30 bg-white/5 px-4 py-2 text-xs">
              <span className="flex">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />)}
              </span>
              <span className="font-semibold text-white">4.9 / 5 Rating</span>
              <span className="text-white/50">· Customer loved</span>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="relative p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-50 rounded-bl-[5rem] pointer-events-none" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
