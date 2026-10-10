import { getAgent } from "@ix/agents";
import { AgentFigure, buttonClass } from "@ix/ui";
import { ArrowRight, CircleCheck } from "lucide-react";
import Link from "next/link";
import { AgentStack } from "@/components/blocks";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { SERVICES } from "@/lib/catalog";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/services", (t) => ({ title: t.web.servicesPage.eyebrow, description: t.web.servicesPage.body }));
}

export default async function ServicesPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const p = t.web.servicesPage;

  return (
    <SiteChrome locale={locale} t={t} path="/services">
      <div className="space-y-10">
        <PageHero
          eyebrow={p.eyebrow}
          title={
            <>
              <span className="block">{p.line1}</span>
              <span className="ix-gradient-text block">{p.accent}</span>
            </>
          }
          body={p.body}
          art={
            <>
              <AgentFigure agent={getAgent("hephaestus")} className="-me-8 h-[84%]" />
              <AgentFigure agent={getAgent("zeus")} priority className="relative z-10" />
              <AgentFigure agent={getAgent("apollo")} className="-ms-8 h-[84%]" />
            </>
          }
        >
          <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
            {t.web.hero.primaryCta}
            <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </PageHero>

        <Section reveal={false}>
          <ol className="space-y-5">
            {SERVICES.map(({ key, slug, agents }, index) => {
              const copy = p.items[key];
              return (
                <li key={key} className="ix-reveal">
                  <Link
                    href={`/${locale}/services/${slug}`}
                    className="ix-spot group relative grid gap-8 overflow-hidden rounded-[2rem] border border-line bg-surface p-7 shadow-ix sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center"
                  >
                    <div className="space-y-5">
                      <p dir="ltr" className="font-mono text-sm font-bold text-brand-text rtl:text-end">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h2 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl">{copy.title}</h2>
                      <p className="max-w-xl text-lg text-pretty text-fg-soft">{copy.body}</p>
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-text">
                        {t.web.serviceDetail.learnMore}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="space-y-5">
                      <ul className="space-y-3">
                        {copy.points.map((point) => (
                          <li key={point} className="flex items-start gap-3 border-b border-line pb-3 text-base font-semibold last:border-0">
                            <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden="true" />
                            {point}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-extrabold tracking-widest text-muted uppercase">{p.teamLabel}</p>
                        <AgentStack agents={agents} />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Section>
      </div>
    </SiteChrome>
  );
}
