import { getAgent } from "@ix/agents";
import { AgentFigure, Card } from "@ix/ui";
import { AppWindow, Building2, LayoutDashboard, Settings2, Users, Workflow, type LucideIcon } from "lucide-react";
import { Intro, PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

/** Same order as `appsPage.items` in the dictionaries. */
const APP_ICONS: readonly LucideIcon[] = [Users, Building2, AppWindow, Settings2, LayoutDashboard, Workflow];

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/business-applications", (t) => ({ title: t.web.nav.apps, description: t.web.appsPage.body }));
}

export default async function BusinessApplicationsPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const w = t.web;
  const p = w.appsPage;

  return (
    <SiteChrome locale={locale} t={t} path="/business-applications">
      <PageHero
        eyebrow={w.apps.eyebrow}
        title={
          <>
            <span className="block">{w.apps.line1}</span>
            <span className="ix-gradient-text block">{w.apps.accent}</span>
            <span className="block">{w.apps.line3}</span>
          </>
        }
        body={p.body}
        art={<AgentFigure agent={getAgent("apollo")} priority />}
      />

      <Section className="space-y-8">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{p.itemsTitle}</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.items.map((item, i) => {
            const Icon = APP_ICONS[i] ?? AppWindow;
            return (
              <li key={item.title}>
                <Card className="h-full space-y-3 p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-ix-lg">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-text">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted">{item.body}</p>
                </Card>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section className="space-y-8">
        <Intro eyebrow={p.approachEyebrow} title={p.approachTitle} />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.approach.map((step, i) => (
            <li key={step.title}>
              <Card className="h-full space-y-3 p-6">
                <span
                  dir="ltr"
                  className="grid size-10 place-items-center rounded-full bg-[linear-gradient(135deg,var(--ix-cyan),var(--ix-primary))] text-sm font-extrabold text-white"
                >
                  {i + 1}
                </span>
                <h3 className="text-lg font-extrabold tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>
    </SiteChrome>
  );
}
