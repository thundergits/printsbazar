import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "orange" | "red" | "green" | "gold" | "gray";
  className?: string;
}

export default function Badge({ children, variant = "orange", className }: BadgeProps) {
  const variants = {
    orange: "bg-brand-100 text-brand-700",
    red:    "bg-red-100 text-red-700",
    green:  "bg-green-100 text-green-700",
    gold:   "bg-gold-400 text-maroon-900",
    gray:   "bg-gray-100 text-gray-600",
  };

  return (
    <span className={cn("badge", variants[variant], className)}>
      {children}
    </span>
  );
}
