"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

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

/** Inertial page scrolling. Off for people who ask for reduced motion. */
export function SmoothScroll() {
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
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.in = "";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`ix-reveal ${className}`} style={{ "--d": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}
