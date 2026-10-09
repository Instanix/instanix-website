import type { Dictionary, Locale } from "@ix/i18n";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { assertDemoScripts } from "@/lib/demo-script";
import { INDUSTRIES, type DemoScenarioKey } from "@/lib/industries";
import { LiveDemo } from "./live-demo";
import { Intro, Section } from "./site-chrome";

/** The simulated WhatsApp demo with its heading and call to action. */
export function DemoSection({
  locale,
  t,
  only,
  heading = true,
}: {
  readonly locale: Locale;
  readonly t: Dictionary;
  /** Show a single scenario (used on industry pages). */
  readonly only?: DemoScenarioKey;
  readonly heading?: boolean;
}) {
  const d = t.web.demo;
  assertDemoScripts(d.scenarios);
  return (
    <Section id="demo" className="space-y-8">
      {heading ? <Intro eyebrow={d.eyebrow} title={d.title} body={d.body} /> : null}
      <LiveDemo locale={locale} copy={d} {...(only ? { initial: only, scenarios: [only] } : {})} />
    </Section>
  );
}

/** Bento spans, in the order of INDUSTRIES: one lead tile, one wide tile, two small ones. */
const BENTO = ["sm:col-span-2 lg:row-span-2", "sm:col-span-2", "", ""] as const;

export function IndustryCards({ locale, t }: { readonly locale: Locale; readonly t: Dictionary }) {
  const copy = t.web.industries;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[13.5rem] lg:grid-cols-4">
      {INDUSTRIES.map(({ key, slug, icon: Icon, flowAgents }, index) => {
        const lead = index === 0;
        const cast = [...new Set(flowAgents)].slice(0, lead ? 3 : 2);
        return (
          <li key={key} className={BENTO[index] ?? ""}>
            <Link
              href={`/${locale}/industries/${slug}`}
              className="ix-spot group relative flex h-full min-h-52 flex-col overflow-hidden rounded-ix-lg border border-line bg-surface p-6 shadow-ix sm:p-7"
            >
              <Icon className="size-6 text-brand-text" aria-hidden="true" />
              <h3 className={`mt-4 font-extrabold tracking-tight ${lead ? "text-3xl sm:text-4xl" : "text-xl"}`}>{copy.items[key].name}</h3>
              <p className={`mt-2 text-pretty text-muted ${lead ? "max-w-sm text-base sm:text-lg" : "max-w-xs text-sm"}`}>{copy.items[key].headline}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-brand-text">
                {copy.view}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />
              </span>
              {/* The agents that work this industry, standing at the far edge of the tile. */}
              <span
                dir="ltr"
                aria-hidden="true"
                className={`pointer-events-none absolute end-3 bottom-0 flex items-end ${lead ? "h-[62%]" : "hidden h-[78%] lg:flex"} ${index > 1 ? "lg:hidden" : ""}`}
              >
                {cast.map((agentKey, i) => (
                  <img
                    key={agentKey}
                    src={`/agents/${agentKey}.webp`}
                    alt=""
                    width={400}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className={`w-auto object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5 ${i === 0 ? "h-full" : "-ms-6 h-[84%]"}`}
                  />
                ))}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
