import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { icon: Truck, label: "Free Shipping", sub: "On orders above ₹499" },
  { icon: RotateCcw, label: "Easy Returns", sub: "7-day policy" },
  { icon: ShieldCheck, label: "100% Secure", sub: "Encrypted checkout" },
];

export default function TrustStrip({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl shadow-card", className)}>
      {ITEMS.map((item) => (
        <div key={item.label} className="text-center">
          <item.icon className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <p className="text-xs sm:text-sm font-semibold text-gray-800">{item.label}</p>
          <p className="text-[11px] sm:text-xs text-gray-500">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
