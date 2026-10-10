import { getAgent } from "@ix/agents";
import { AgentFigure, Card } from "@ix/ui";
import { KeyRound, ScrollText, ShieldCheck, type LucideIcon } from "lucide-react";
import { ToolMark } from "@/components/blocks";
import { BeamHub } from "@/components/magic";
import { Intro, PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { FEATURED_TOOLS, TOOL_CATEGORIES } from "@/lib/catalog";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

/** Same order as `integrationsPage.govern` in the dictionaries. */
const GOVERN_ICONS: readonly LucideIcon[] = [KeyRound, ShieldCheck, ScrollText];

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/integrations", (t) => ({ title: t.web.nav.integrations, description: t.web.integrationsPage.body }));
}

export default async function IntegrationsPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const p = t.web.integrationsPage;

  return (
    <SiteChrome locale={locale} t={t} path="/integrations">
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
          art={<AgentFigure agent={getAgent("hephaestus")} priority />}
        />

        {/* Your tools on one side, your tools on the other, IX in the middle */}
        <Section>
          <BeamHub
            label={t.web.connect.title}
            incoming={FEATURED_TOOLS.filter((tool) => ["WhatsApp", "Notion", "Airtable"].includes(tool.name))}
            outgoing={FEATURED_TOOLS.filter((tool) => ["n8n", "Claude", "Supabase"].includes(tool.name))}
          />
        </Section>

        <Section className="space-y-5">
          {TOOL_CATEGORIES.map((category) => {
            const copy = p.categories[category.key];
            return (
              <Card key={category.key} className="grid gap-5 p-6 sm:p-7 lg:grid-cols-[18rem_1fr] lg:items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold tracking-tight">{copy.title}</h2>
                  <p className="text-sm text-muted">{copy.body}</p>
                </div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  {category.tools.map((tool) => (
                    <li key={tool.name} className="rounded-xl bg-surface-2 px-4 py-3.5">
                      <ToolMark tool={tool} size="lg" />
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
          <p className="px-2 text-xs text-muted">{t.web.connect.note}</p>
        </Section>
      </div>

      <Section className="space-y-8">
        <Intro eyebrow={p.governEyebrow} title={p.governTitle} />
        <ul className="grid gap-4 md:grid-cols-3">
          {p.govern.map((item, i) => {
            const Icon = GOVERN_ICONS[i] ?? ShieldCheck;
            return (
              <li key={item.title}>
                <Card className="h-full space-y-3 p-6">
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
    </SiteChrome>
  );
}
