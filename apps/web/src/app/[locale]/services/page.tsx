import { getAgent } from "@ix/agents";
import { AgentFigure, buttonClass, Card } from "@ix/ui";
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

        <Section>
          <ul className="grid gap-5 md:grid-cols-2">
            {SERVICES.map(({ key, slug, icon: Icon, agents }) => {
              const copy = p.items[key];
              return (
                <li key={key}>
                  <Card className="flex h-full flex-col gap-5 p-6 sm:p-8">
                    <span className="grid size-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--ix-cyan),var(--ix-primary))] text-white shadow-ix-glow">
                      <Icon className="size-7" aria-hidden="true" />
                    </span>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-extrabold tracking-tight">{copy.title}</h2>
                      <p className="text-muted">{copy.body}</p>
                    </div>
                    <ul className="space-y-2">
                      {copy.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-sm font-semibold">
                          <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-brand-text" aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
                      <div className="space-y-2">
                        <p className="text-xs font-extrabold tracking-widest text-fg-soft uppercase">{p.teamLabel}</p>
                        <AgentStack agents={agents} />
                      </div>
                      <Link
                        href={`/${locale}/services/${slug}`}
                        aria-label={`${t.web.serviceDetail.learnMore}: ${copy.title}`}
                        className={buttonClass("secondary", "sm")}
                      >
                        {t.web.serviceDetail.learnMore}
                        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                      </Link>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </SiteChrome>
  );
}
