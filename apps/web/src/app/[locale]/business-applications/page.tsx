import { getAgent } from "@ix/agents";
import { AgentFigure } from "@ix/ui";
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

      {/* What we build: a numbered list, not a wall of identical cards */}
      <Section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        <h2 className="text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:sticky lg:top-28 lg:self-start">{p.itemsTitle}</h2>
        <ol>
          {p.items.map((item, i) => {
            const Icon = APP_ICONS[i] ?? AppWindow;
            return (
              <li key={item.title} className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-5 border-b border-line py-6 first:pt-0 last:border-0">
                <span dir="ltr" className="font-mono text-sm font-bold text-brand-text">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{item.title}</h3>
                  <p className="max-w-xl text-base text-pretty text-muted sm:text-lg">{item.body}</p>
                </div>
                <Icon className="size-6 self-center text-muted transition-colors duration-300 group-hover:text-brand-text" aria-hidden="true" />
              </li>
            );
          })}
        </ol>
      </Section>

      {/* How we work: one line of steps */}
      <Section className="space-y-8">
        <Intro eyebrow={p.approachEyebrow} title={p.approachTitle} />
        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {p.approach.map((step, i) => (
            <li key={step.title} className="relative space-y-3 border-t-2 border-line pt-5">
              <span aria-hidden="true" className="absolute -top-0.5 start-0 h-0.5 w-12 bg-primary" />
              <span dir="ltr" className="block font-mono text-sm font-bold text-brand-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">{step.title}</h3>
              <p className="text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>
    </SiteChrome>
  );
}
