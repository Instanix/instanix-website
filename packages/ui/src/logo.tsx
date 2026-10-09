import { cn } from "./cn";

interface LogoProps {
  /** "full" = the official lockup, "mark" = bolt only. */
  readonly variant?: "full" | "mark";
  /** "auto" follows the theme; "on-ink" is for always-dark surfaces. */
  readonly tone?: "auto" | "on-ink";
  readonly className?: string;
  readonly title?: string;
}

/**
 * The official InstanIX logo, served from the master files in IX-LOGO (built by
 * `pnpm agent-art` into each app's /public/brand). It is never redrawn or recolored.
 */
export function Logo({ variant = "full", tone = "auto", className, title = "InstanIX" }: LogoProps) {
  if (variant === "mark") {
    return (
      <span dir="ltr" className={cn("inline-flex", className)}>
        <img src="/brand/mark.webp" alt={title} width={223} height={256} className="h-[1.6em] w-auto" />
      </span>
    );
  }
  const image = "h-[2.5em] w-auto";
  return (
    // Latin brand IP: it never mirrors in RTL.
    <span dir="ltr" className={cn("inline-flex", className)}>
      {tone === "on-ink" ? (
        <img src="/brand/logo-white.webp" alt={title} width={891} height={220} className={image} />
      ) : (
        <>
          <img src="/brand/logo-navy.webp" alt={title} width={885} height={220} className={cn(image, "dark:hidden")} />
          <img src="/brand/logo-white.webp" alt={title} width={891} height={220} className={cn(image, "hidden dark:block")} />
        </>
      )}
    </span>
  );
}
