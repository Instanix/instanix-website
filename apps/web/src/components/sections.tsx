import type { Dictionary, Locale } from "@ix/i18n";
import { buttonClass, Card } from "@ix/ui";
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
      <LiveDemo copy={d} {...(only ? { initial: only, scenarios: [only] } : {})} />
      <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
        {d.cta}
        <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
      </Link>
    </Section>
  );
}

export function IndustryCards({ locale, t }: { readonly locale: Locale; readonly t: Dictionary }) {
  const copy = t.web.industries;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {INDUSTRIES.map(({ key, slug, icon: Icon }) => (
        <li key={key}>
          <Link href={`/${locale}/industries/${slug}`} className="group block h-full">
            <Card className="flex h-full flex-col gap-3 p-6 transition-[transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:shadow-ix-lg">
              <span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--ix-cyan),var(--ix-primary))] text-white shadow-ix-glow">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-extrabold tracking-tight">{copy.items[key].name}</h3>
              <p className="text-sm text-muted">{copy.items[key].headline}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold text-brand-text">
                {copy.view}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />
              </span>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
