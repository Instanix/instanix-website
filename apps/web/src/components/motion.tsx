"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, type CSSProperties, type ReactNode } from "react";

declare global {
  interface Window {
    /** The page's smooth scroller, when motion is allowed. */
    ixLenis?: Lenis;
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Scrolls the page to a vertical position, through the smooth scroller when it is running. */
export function scrollToY(y: number): void {
  if (window.ixLenis) window.ixLenis.scrollTo(y);
  else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/** Surfaces that light up under the pointer; they read the position from CSS variables. */
const LIT = ".ix-header-bar, .ix-spot, .ix-card";

/**
 * Page-wide motion, mounted once:
 * - inertial scrolling (off for people who ask for reduced motion),
 * - `.ix-reveal` elements fade in the first time they enter the viewport,
 * - lit surfaces follow the pointer.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.11, anchors: { offset: -96 } });
    window.ixLenis = lenis;
    let frame = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete window.ixLenis;
    };
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const surface = event.target.closest<HTMLElement>(LIT);
      if (!surface) return;
      const box = surface.getBoundingClientRect();
      const x = `${(((event.clientX - box.left) / box.width) * 100).toFixed(1)}%`;
      const y = `${(((event.clientY - box.top) / box.height) * 100).toFixed(1)}%`;
      surface.style.setProperty("--hx", x);
      surface.style.setProperty("--hy", y);
      surface.style.setProperty("--sx", x);
      surface.style.setProperty("--sy", y);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  // Each page brings its own `.ix-reveal` elements, so observe again after navigation.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const element of document.querySelectorAll(".ix-reveal:not([data-in])")) observer.observe(element);
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

/** Fades and lifts its content in the first time it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  readonly children: ReactNode;
  /** Seconds to wait after entering the viewport. */
  readonly delay?: number;
  readonly className?: string;
}) {
  return (
    <div className={`ix-reveal ${className}`} style={{ "--d": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}
