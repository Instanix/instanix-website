import { AGENTS } from "@ix/agents";
import { AgentCard } from "@/components/blocks";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/agents", (t) => ({ title: t.web.agentsPage.eyebrow, description: t.web.agentsPage.body }));
}

export default async function AgentsPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const a = t.web.agentsPage;

  return (
    <SiteChrome locale={locale} t={t} path="/agents">
      <div className="space-y-10">
        <PageHero eyebrow={a.eyebrow} title={a.title} body={a.body}>
          <p className="border-s-2 border-brand ps-4 text-base font-bold text-fg-soft">{t.web.team.statement}</p>
        </PageHero>
        <Section>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {AGENTS.map((agent) => (
              <li key={agent.key}>
                <AgentCard agent={agent} locale={locale} t={t} />
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </SiteChrome>
  );
}
