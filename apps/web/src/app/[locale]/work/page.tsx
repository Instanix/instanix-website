import { buttonClass } from "@ix/ui";
import { ArrowUpRight } from "lucide-react";
import { FlowCanvas } from "@/components/flow-canvas";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

/** Only projects that are live and that Instanix actually built are listed here. */
const SCANNO_URL = "https://scanno.qa";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/work", (t) => ({ title: t.web.workPage.eyebrow, description: t.web.workPage.scanno.summary }));
}

export default async function WorkPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const p = t.web.workPage;
  const s = p.scanno;

  return (
    <SiteChrome locale={locale} t={t} path="/work">
      <div className="space-y-10">
        <PageHero eyebrow={p.eyebrow} title={p.title} body={p.body} />

        {/* The project */}
        <Section>
          <div className="ix-on-ink relative overflow-hidden rounded-[2rem] bg-ink px-7 py-12 text-on-ink shadow-ix-lg sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(44rem_24rem_at_100%_0%,color-mix(in_srgb,var(--ix-brand)_55%,transparent),transparent_70%),radial-gradient(28rem_18rem_at_0%_100%,color-mix(in_srgb,var(--ix-cyan)_22%,transparent),transparent_70%)]"
            />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
              <div className="space-y-5">
                <p className="text-sm font-semibold text-on-ink-muted">{s.tag}</p>
                <h2 dir="auto" className="text-5xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                  {s.title}
                </h2>
                <a href={SCANNO_URL} target="_blank" rel="noopener noreferrer" className={buttonClass("on-ink", "lg")}>
                  {s.visit}
                  <ArrowUpRight className="size-4.5 rtl:-scale-x-100" aria-hidden="true" />
                </a>
              </div>
              <p className="text-xl leading-relaxed text-pretty text-on-ink-muted">{s.summary}</p>
            </div>
          </div>
        </Section>

        {/* What was built, as a numbered list */}
        <Section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <h2 className="text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:sticky lg:top-28 lg:self-start">{s.builtTitle}</h2>
          <ol>
            {s.built.map((item, index) => (
              <li key={item} className="flex items-baseline gap-5 border-b border-line py-6 first:pt-0 last:border-0">
                <span dir="ltr" className="font-mono text-sm font-bold text-brand-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xl leading-snug font-semibold text-pretty sm:text-2xl">{item}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* The inspection, as a workflow the visitor can run */}
        <Section className="space-y-6">
          <h2 className="max-w-3xl text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl">{t.web.flow.scenarios.inspection.name}</h2>
          <FlowCanvas copy={t.web.flow} flows={["inspection"]} />
          <p className="px-1 text-xs text-muted">{t.web.flow.note}</p>
        </Section>

        {/* How AI is used */}
        <Section>
          <div className="rounded-[2rem] border border-line bg-surface p-8 shadow-ix sm:p-12">
            <p className="text-sm font-semibold text-brand-text">{s.approachTitle}</p>
            <p className="mt-4 max-w-4xl text-2xl leading-snug font-bold tracking-tight text-balance sm:text-3xl lg:text-4xl">{s.approach}</p>
          </div>
        </Section>
      </div>
    </SiteChrome>
  );
}
