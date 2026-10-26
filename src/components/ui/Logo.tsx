import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  tagline?: string;
  className?: string;
}

const MARK_SIZES = {
  sm: "w-8 h-8 text-base",
  md: "w-9 h-9 text-lg",
  lg: "w-16 h-16 text-3xl",
};

const TEXT_SIZES = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
};

/** Gold-on-dark monogram mark for PrintsBazar, reused across the header, footer, and admin panel. */
export default function Logo({ size = "md", withText = true, tagline, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex-shrink-0 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md",
          MARK_SIZES[size]
        )}
      >
        <span className="font-display font-bold text-gray-950" style={{ WebkitTextStroke: "0.3px rgba(0,0,0,0.15)" }}>
          P
        </span>
      </div>
      {withText && (
        <div className="leading-tight">
          <span className={cn("font-display font-bold text-white", TEXT_SIZES[size])}>Prints</span>
          <span className={cn("font-display font-bold text-brand-400", TEXT_SIZES[size])}>Bazar</span>
          {tagline && (
            <div className="text-[9px] text-gray-400 font-medium tracking-wider uppercase -mt-0.5">
              {tagline}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
