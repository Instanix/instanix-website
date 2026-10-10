import type { CSSProperties, ReactNode } from "react";
import { ToolMark } from "./blocks";
import type { Tool } from "@/lib/catalog";

/**
 * Two patterns adapted from Magic UI (magicui.design, MIT): an endless marquee and
 * animated beams between nodes. Both are CSS only, restyled to the IX tokens, and stand
 * still for people who ask for reduced motion.
 */

/** A row that scrolls forever. The content is rendered twice so the loop has no seam. */
export function Marquee({ children, label, seconds = 36 }: { readonly children: ReactNode; readonly label: string; readonly seconds?: number }) {
  return (
    // Product names are Latin and never mirror, so the strip always runs left to right.
    <div dir="ltr" role="group" aria-label={label} className="ix-marquee" style={{ "--marquee-s": `${seconds}s` } as CSSProperties}>
      <ul className="ix-marquee-track">{children}</ul>
      <ul aria-hidden="true" className="ix-marquee-track">
        {children}
      </ul>
    </div>
  );
}

const ROWS = [18, 50, 82] as const;

/**
 * A hub with tools on both sides and light travelling along the connections: into IX from
 * one side, out to the other. Decorative, so it is exposed to assistive tech as one image.
 */
export function BeamHub({ incoming, outgoing, label }: { readonly incoming: readonly Tool[]; readonly outgoing: readonly Tool[]; readonly label: string }) {
  const sides = [
    { tools: incoming.slice(0, 3), x: 12, path: (y: number) => `M 12 ${y} C 32 ${y}, 30 50, 50 50` },
    { tools: outgoing.slice(0, 3), x: 88, path: (y: number) => `M 50 50 C 70 50, 68 ${y}, 88 ${y}` },
  ];
  return (
    <div dir="ltr" role="img" aria-label={label} className="relative mx-auto aspect-[16/8] w-full max-w-4xl sm:aspect-[16/6]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full">
        {sides.flatMap((side, s) =>
          side.tools.map((tool, i) => {
            const d = side.path(ROWS[i] ?? 50);
            return (
              <g key={tool.name} fill="none">
                <path d={d} stroke="var(--ix-line-strong)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                <path
                  d={d}
                  pathLength={1}
                  stroke="var(--ix-cyan)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="ix-beam"
                  style={{ animationDelay: `${(s * 3 + i) * 0.45}s` }}
                />
              </g>
            );
          }),
        )}
      </svg>
      {sides.flatMap((side) =>
        side.tools.map((tool, i) => (
          <div
            key={tool.name}
            className="ix-glass-strong absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-2 sm:px-4 sm:py-2.5"
            style={{ left: `${side.x}%`, top: `${ROWS[i] ?? 50}%` }}
          >
            <ToolMark tool={tool} />
          </div>
        )),
      )}
      <div className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28%] border border-line bg-surface shadow-ix-glow sm:size-24">
        <span className="ix-anim-pulse absolute -inset-3 rounded-[32%] border border-brand/40" />
        <img src="/brand/mark.webp" alt="" width={223} height={256} className="h-10 w-auto sm:h-12" />
      </div>
    </div>
  );
}
