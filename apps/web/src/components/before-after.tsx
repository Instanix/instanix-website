"use client";

import type { Dictionary } from "@ix/i18n";
import { ChevronsLeftRight } from "lucide-react";
import { useState, type CSSProperties } from "react";

type Copy = Dictionary["web"]["compare"];

function Day({ copy, side }: { readonly copy: Copy; readonly side: "before" | "after" }) {
  const after = side === "after";
  return (
    <div className={`flex h-full flex-col ${after ? "bg-surface" : "bg-[color-mix(in_srgb,var(--ix-danger)_7%,var(--ix-surface-2))]"}`}>
      <p
        className={`px-5 pt-5 text-xs font-extrabold tracking-widest uppercase sm:px-8 sm:pt-7 ${after ? "text-end text-brand-text" : "text-muted"}`}
      >
        {after ? copy.after : copy.before}
      </p>
      <ol className="flex flex-1 flex-col justify-around px-5 pb-5 sm:px-8 sm:pb-7">
        {copy.rows.map((row) => (
          // Both layers use the same row height, so the two days line up under the handle.
          <li key={row.time} className="grid h-20 grid-cols-[3.5rem_1fr] items-center gap-4 border-b border-line/70 last:border-0">
            <span dir="ltr" className="font-mono text-sm font-bold text-muted tabular-nums">
              {row.time}
            </span>
            <span className={`line-clamp-2 text-sm font-semibold sm:text-base ${after ? "text-fg" : "text-fg-soft"}`}>
              {after ? row.after : row.before}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * One working day shown twice: by hand, and with IX. A handle splits the view; it is a
 * real range input, so it works with touch, mouse and the keyboard.
 */
export function BeforeAfter({ copy }: { readonly copy: Copy }) {
  const [position, setPosition] = useState(50);
  return (
    <div className="space-y-3">
      <div
        className="relative h-[30rem] overflow-hidden rounded-ix-lg border border-line shadow-ix-lg select-none"
        style={{ "--pos": `${position}%` } as CSSProperties}
      >
        <Day copy={copy} side="after" />
        {/* The manual day covers the start side, up to the handle. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--pos))_0_0)] rtl:[clip-path:inset(0_0_0_calc(100%-var(--pos)))]"
        >
          <Day copy={copy} side="before" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-brand shadow-ix-glow rtl:translate-x-1/2" style={{ insetInlineStart: "var(--pos)" }}>
          <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-on-primary shadow-ix-glow">
            <ChevronsLeftRight className="size-5" />
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={95}
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
