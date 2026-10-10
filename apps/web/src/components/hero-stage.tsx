"use client";

import { getAgent, type AgentKey } from "@ix/agents";
import type { Dictionary, Locale } from "@ix/i18n";
import { buttonClass, Eyebrow } from "@ix/ui";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { saveAssessmentDraft } from "@/lib/assessment-draft";
import { prefersReducedMotion } from "./motion";

/**
 * The cast on stage, front to back. `x` is the offset from center in percent of the
 * stage width, `size` the height relative to ZEUS, `depth` how far it moves with the pointer.
 */
const CAST: readonly { key: AgentKey; x: number; size: number; depth: number; back?: boolean }[] = [
  { key: "zeus", x: 0, size: 1, depth: 1 },
  { key: "athena", x: -14, size: 0.87, depth: 0.72 },
  { key: "hephaestus", x: 14, size: 0.87, depth: 0.72 },
  { key: "hermes", x: -26.5, size: 0.76, depth: 0.5 },
  { key: "atlas", x: 26.5, size: 0.76, depth: 0.5 },
  { key: "poseidon", x: -37.5, size: 0.66, depth: 0.32 },
  { key: "ares", x: 37.5, size: 0.66, depth: 0.32 },
  { key: "apollo", x: -7.5, size: 0.8, depth: 0.2, back: true },
  { key: "midas", x: 7.5, size: 0.8, depth: 0.2, back: true },
  { key: "themis", x: -20.5, size: 0.7, depth: 0.16, back: true },
  { key: "oracle", x: 20.5, size: 0.7, depth: 0.16, back: true },
  { key: "hestia", x: -46, size: 0.56, depth: 0.12, back: true },
];

export function HeroStage({ locale, t }: { readonly locale: Locale; readonly t: Dictionary }) {
  const h = t.web.hero;
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [draft, setDraft] = useState("");
  // The stage follows the pointer and opens up as the page scrolls. Both write CSS
  // variables, so React never re-renders for motion.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const onPointer = (event: PointerEvent) => {
      const box = section.getBoundingClientRect();
      target.x = ((event.clientX - box.left) / box.width) * 2 - 1;
      target.y = ((event.clientY - box.top) / box.height) * 2 - 1;
    };
    const tick = () => {
      current.x += (target.x - current.x) * 0.07;
      current.y += (target.y - current.y) * 0.07;
      const box = section.getBoundingClientRect();
      const spread = Math.min(1, Math.max(0, -box.top / (box.height * 0.7)));
      section.style.setProperty("--px", current.x.toFixed(4));
      section.style.setProperty("--py", current.y.toFixed(4));
      section.style.setProperty("--mx", `${((current.x + 1) * 50).toFixed(2)}%`);
      section.style.setProperty("--my", `${((current.y + 1) * 50).toFixed(2)}%`);
      section.style.setProperty("--spread", spread.toFixed(4));
      frame = requestAnimationFrame(tick);
    };
    section.addEventListener("pointermove", onPointer);
    frame = requestAnimationFrame(tick);
    return () => {
      section.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(frame);
    };
  }, []);

  function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveAssessmentDraft(draft);
    router.push(`/${locale}/assessment`);
  }

  return (
    <section ref={sectionRef} className="relative isolate -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
      <div aria-hidden="true" className="ix-stage-light absolute inset-0 -z-10" />

      <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pt-12 text-center sm:px-8 sm:pt-16 lg:pt-20">
        <div className="ix-rise">
          <Eyebrow>{h.eyebrow}</Eyebrow>
        </div>
        <h1
          className="ix-rise mt-6 text-[2.75rem] leading-[1.02] font-extrabold tracking-tight text-balance sm:text-7xl lg:text-[5.75rem]"
          style={{ "--d": "0.08s" } as CSSProperties}
        >
          <span className="block">{h.line1}</span>
          <span className="block">
            {h.line2} <span className="ix-gradient-text">{h.accent}</span> {h.line3}{" "}
            <span dir="ltr" className="ix-gradient-text inline-block">
              {h.brand}
            </span>
          </span>
        </h1>
        <p className="ix-rise mt-6 max-w-2xl text-lg text-pretty text-fg-soft sm:text-xl" style={{ "--d": "0.16s" } as CSSProperties}>
          {h.body}
        </p>

        {/* The assessment starts here: one sentence, then ZEUS takes over. */}
        <form onSubmit={ask} className="ix-rise mt-9 w-full max-w-2xl" style={{ "--d": "0.24s" } as CSSProperties}>
          <div className="ix-glass-strong flex items-center gap-2 rounded-full p-2 ps-6 transition-shadow focus-within:shadow-ix-glow">
            <label htmlFor="hero-prompt" className="sr-only">
              {h.promptLabel}
            </label>
            <input
              id="hero-prompt"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              maxLength={300}
              autoComplete="off"
              placeholder={h.promptPlaceholder}
              className="h-12 min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className={buttonClass("primary", "md", "h-12 shrink-0")}
            >
              <span dir="auto">{h.promptCta}</span>
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {h.promptExamples.map((example) => (
              <li key={example}>
                <button
                  type="button"
                  onClick={() => setDraft(example)}
                  className="ix-btn-glass rounded-full px-3.5 py-1.5 text-xs font-semibold text-fg-soft transition-[border-color,background-color,color,transform] duration-300 hover:text-brand-text"
                >
                  {example}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">{h.promptHint}</p>
        </form>
      </div>

      {/* The characters never mirror in RTL: they carry their serial IDs. */}
      <div dir="ltr" aria-hidden="true" className="relative mx-auto mt-8 h-[21rem] max-w-6xl sm:h-[30rem] lg:h-[38rem]">
        <div className="ix-stage-floor absolute inset-x-[-10%] bottom-[-6%] h-[70%]" />
        {CAST.map(({ key, x, size, depth, back }, index) => {
          const agent = getAgent(key);
          return (
            <div
              key={key}
              className={`ix-rise absolute bottom-0 left-1/2 will-change-transform ${back ? "hidden md:block" : ""}`}
              style={
                {
                  "--d": `${0.3 + index * 0.07}s`,
                  "--agent": agent.accent,
                  height: `${size * 100}%`,
                  marginLeft: `${x}%`,
                  zIndex: Math.round(size * 10) - (back ? 6 : 0),
                } as CSSProperties
              }
            >
              <div
                className="relative h-full"
                style={{
                  transform: `translate3d(calc(-50% + var(--px, 0) * ${depth * 22}px + var(--spread, 0) * ${x * 2.4}px), calc(var(--py, 0) * ${depth * 8}px + var(--spread, 0) * ${(1 - size) * -60}px), 0)`,
                }}
              >
                <span className="absolute inset-x-[-20%] bottom-[-3%] h-[12%] rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--agent)_70%,transparent),transparent)] blur-md" />
                <img
                  src={`/agents/${key}.webp`}
                  srcSet={`/agents/${key}-sm.webp 280w, /agents/${key}.webp 400w`}
                  sizes="(min-width: 1024px) 270px, (min-width: 640px) 215px, 150px"
                  alt=""
                  width={400}
                  height={900}
                  // The back row is hidden on phones; lazy loading means a phone never downloads it.
                  loading={back ? "lazy" : "eager"}
                  decoding="async"
                  fetchPriority={key === "zeus" ? "high" : "auto"}
                  className="relative h-full w-auto max-w-none object-contain drop-shadow-[0_26px_32px_rgb(6_23_58/0.32)]"
                  style={{ filter: back ? "saturate(0.7) brightness(0.82)" : size < 1 ? `saturate(${0.75 + size * 0.25}) brightness(${0.86 + size * 0.14})` : undefined }}
                />
              </div>
            </div>
          );
        })}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-linear-to-b from-transparent to-bg" />
      </div>

      <a
        href="#team"
        className="absolute inset-x-0 bottom-3 z-30 mx-auto flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-fg"
      >
        {h.scroll}
        <ChevronDown className="ix-anim-float size-4" aria-hidden="true" />
      </a>
    </section>
  );
}
