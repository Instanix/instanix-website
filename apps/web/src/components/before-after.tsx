"use client";

import type { Dictionary } from "@ix/i18n";
import { Check, ChevronsLeftRight, X } from "lucide-react";
import { useState } from "react";

type Copy = Dictionary["web"]["compare"];

/**
 * One working day shown twice, side by side: by hand, and with IX. A handle moves the split
 * and each side reflows to its width. The handle is a real range input, so it works with
 * touch, mouse and the keyboard.
 */
export function BeforeAfter({ copy }: { readonly copy: Copy }) {
  const [position, setPosition] = useState(50);
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-ix-lg border border-line shadow-ix-lg select-none">
        <div className="grid" style={{ gridTemplateColumns: `${position}% 1fr` }}>
          <div className="min-w-0 bg-[color-mix(in_srgb,var(--ix-danger)_7%,var(--ix-surface-2))] px-4 py-6 sm:px-8 sm:py-8">
            <p className="text-xs font-extrabold tracking-widest text-muted uppercase">{copy.before}</p>
            <ol className="mt-3">
              {copy.rows.map((row) => (
                // Both sides use the same row height, so the two days line up across the handle.
                <li key={row.time} className="flex h-24 items-center gap-3 border-b border-line/70 last:border-0 sm:gap-4">
                  <span dir="ltr" className="shrink-0 font-mono text-xs font-bold text-muted tabular-nums sm:text-sm">
                    {row.time}
                  </span>
                  <X className="hidden size-4 shrink-0 text-danger sm:block" aria-hidden="true" />
                  <span className="line-clamp-3 min-w-0 text-sm font-semibold text-fg-soft sm:text-base">{row.before}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="min-w-0 bg-surface px-4 py-6 sm:px-8 sm:py-8">
            <p className="text-xs font-extrabold tracking-widest text-brand-text uppercase">{copy.after}</p>
            <ol className="mt-3">
              {copy.rows.map((row) => (
                <li key={row.time} className="flex h-24 items-center gap-3 border-b border-line/70 last:border-0 sm:gap-4">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success text-white">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <span className="line-clamp-3 min-w-0 text-sm font-bold text-fg sm:text-base">{row.after}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-brand rtl:translate-x-1/2"
          style={{ insetInlineStart: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-on-primary shadow-ix-glow">
            <ChevronsLeftRight className="size-5" />
          </span>
        </div>
        <input
          type="range"
          min={28}
          max={72}
          value={position}
          onChange={(event) => setPosition(Number(event.currentTarget.value))}
          aria-label={copy.handle}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="px-1 text-xs text-muted">{copy.note}</p>
    </div>
  );
}
