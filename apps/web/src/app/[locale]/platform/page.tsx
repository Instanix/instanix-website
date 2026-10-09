import { getAgent } from "@ix/agents";
import { AgentFigure, buttonClass, Card } from "@ix/ui";
import { ArrowRight, BarChart3, BookOpen, LayoutDashboard, Plug, ShieldCheck, Users, Workflow, type LucideIcon } from "lucide-react";
import { GuardGrid, HowBand } from "@/components/blocks";
import { Intro, PageHero, Section, SiteChrome } from "@/components/site-chrome";
import Link from "next/link";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

/** Same order as `platformPage.modules` in the dictionaries. */
const MODULE_ICONS: readonly LucideIcon[] = [LayoutDashboard, Users, Workflow, Plug, BookOpen, ShieldCheck, BarChart3];

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/platform", (t) => ({ title: t.web.nav.platform, description: t.web.platformPage.body }));
}

export default async function PlatformPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const p = t.web.platformPage;

  return (
    <SiteChrome locale={locale} t={t} path="/platform">
      <PageHero
        eyebrow={p.eyebrow}
        title={
          <>
            <span className="block">{p.line1}</span>
            <span className="ix-gradient-text block">{p.accent}</span>
          </>
        }
        body={p.body}
        art={<AgentFigure agent={getAgent("zeus")} priority />}
      >
        <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
          {t.web.hero.primaryCta}
          <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </PageHero>

      <Section>
        <HowBand t={t} />
      </Section>

      <Section className="space-y-8">
        <Intro eyebrow={p.modulesEyebrow} title={p.modulesTitle} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.modules.map((module, i) => {
            const Icon = MODULE_ICONS[i] ?? LayoutDashboard;
            return (
              <li key={module.name}>
                <Card className="h-full space-y-3 p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-ix-lg">
                  <span className="grid size-11 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--ix-cyan),var(--ix-primary))] text-white shadow-ix-glow">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 dir="ltr" className="text-start text-lg font-extrabold tracking-tight rtl:text-end">
                    {module.name}
                  </h3>
                  <p className="text-sm text-muted">{module.body}</p>
                </Card>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section className="grid gap-10 lg:grid-cols-[25rem_1fr] lg:items-center">
        <div className="space-y-5">
          <Intro eyebrow={t.web.guard.eyebrow} title={t.web.guard.title} body={t.web.guard.body} />
          <div className="hidden h-64 justify-start lg:flex">
            <AgentFigure agent={getAgent("ares")} />
          </div>
        </div>
        <GuardGrid t={t} />
      </Section>
    </SiteChrome>
  );
}
