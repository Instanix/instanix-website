"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

const BUTTON =
  "grid size-10 place-items-center rounded-full border border-line bg-surface text-fg-soft shadow-ix-sm transition-colors hover:border-brand hover:text-brand-text";

/** Horizontal scroll-snap list with previous/next controls. Works with touch, wheel and keyboard. */
export function Carousel({
  label,
  previousLabel,
  nextLabel,
  children,
}: {
  readonly label: string;
  readonly previousLabel: string;
  readonly nextLabel: string;
  readonly children: ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  function scrollByPage(direction: 1 | -1) {
    const list = listRef.current;
    if (!list) return;
    // In RTL the inline axis is reversed, so "next" scrolls toward negative x.
    const inline = getComputedStyle(list).direction === "rtl" ? -1 : 1;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * inline * list.clientWidth * 0.8, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <div className="space-y-4">
      <ul
        ref={listRef}
        aria-label={label}
        tabIndex={0}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pt-2 pb-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => scrollByPage(-1)} aria-label={previousLabel} className={BUTTON}>
          <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => scrollByPage(1)} aria-label={nextLabel} className={BUTTON}>
          <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
