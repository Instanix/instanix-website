import { useId } from "react";
import { cn } from "./cn";

interface LogoProps {
  /** "full" = bolt + wordmark, "mark" = bolt only. */
  readonly variant?: "full" | "mark";
  /** "auto" follows the theme; "on-ink" is for always-dark surfaces. */
  readonly tone?: "auto" | "on-ink";
  readonly className?: string;
  readonly title?: string;
}

/**
 * Instanix lightning mark, redrawn as vector from IX-LOGO/ICON.png so it stays
 * crisp at any size. Replace the path with the designer's master SVG when available.
 */
export function Logo({ variant = "full", tone = "auto", className, title = "Instanix" }: LogoProps) {
  const gradientId = useId();
  return (
    // The wordmark is Latin brand IP: it never mirrors in RTL.
    <span dir="ltr" className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 1254 1254" className="h-[1.5em] w-[1.5em] shrink-0" role="img" aria-label={title}>
        <defs>
          <linearGradient id={gradientId} x1="200" y1="760" x2="1120" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00E5FF" />
            <stop offset="0.5" stopColor="#0091FF" />
            <stop offset="1" stopColor="#0047FF" />
          </linearGradient>
        </defs>
        <path
          d="M770 180 L690 580 L1075 560 L515 1140 L615 740 L245 740 Z"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="104"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {variant === "full" ? (
        <span aria-hidden="true" className="text-[1.25em] leading-none font-extrabold tracking-tight">
          <span className={tone === "on-ink" ? "text-on-ink" : "text-fg"}>Instan</span>
          <span className="ix-gradient-text">ix</span>
        </span>
      ) : null}
    </span>
  );
}
