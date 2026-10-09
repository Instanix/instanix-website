import { getAgent } from "@ix/agents";
import { AgentAvatar, AgentFigure, Card } from "@ix/ui";
import Link from "next/link";
import { BuildTeam, type BuildGoal } from "@/components/build-team";
import { Intro, PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { GOALS, SOLUTIONS } from "@/lib/catalog";
import { COMMAND_URL } from "@/lib/env";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/solutions", (t) => ({ title: t.web.solutionsPage.eyebrow, description: t.web.solutionsPage.body }));
}

export default async function SolutionsPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const w = t.web;

  const goals: BuildGoal[] = GOALS.map(({ key, agents }) => ({
    key,
    label: w.build.goals[key].label,
    body: w.build.goals[key].body,
    agents: agents.map((agentKey) => ({ agent: getAgent(agentKey), role: t.agents[agentKey].role })),
  }));

  return (
    <SiteChrome locale={locale} t={t} path="/solutions">
      <div className="space-y-10">
        <PageHero
          eyebrow={w.solutionsPage.eyebrow}
          title={w.solutionsPage.title}
          body={w.solutionsPage.body}
          art={
            <>
              <AgentFigure agent={getAgent("atlas")} className="-me-8 h-[84%]" />
              <AgentFigure agent={getAgent("zeus")} priority className="relative z-10" />
              <AgentFigure agent={getAgent("midas")} className="-ms-8 h-[84%]" />
            </>
          }
        />
        <Section>
          <ul className="grid gap-5 md:grid-cols-2">
            {SOLUTIONS.map((solution) => {
              const copy = w.solutions.items[solution.key];
              const Icon = solution.icon;
              return (
                <li key={solution.key}>
                  <Card className="flex h-full flex-col gap-5 p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--ix-cyan),var(--ix-primary))] text-white shadow-ix-glow">
                        <Icon className="size-6" aria-hidden="true" />
                      </span>
                      <div className="space-y-1">
                        <h2 className="text-xl font-extrabold tracking-tight">{copy.title}</h2>
                        <p className="text-muted">{copy.body}</p>
                      </div>
                    </div>
                    <div className="mt-auto space-y-3 border-t border-line pt-4">
                      <p className="text-xs font-extrabold tracking-widest text-fg-soft uppercase">{w.solutions.teamLabel}</p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {solution.agents.map((key) => {
                          const agent = getAgent(key);
                          return (
                            <li key={key}>
                              <Link
                                href={`/${locale}/agents/${key}`}
                                className="flex items-center gap-3 rounded-xl bg-surface-2 p-2.5 transition-colors hover:bg-brand-soft"
                              >
                                <AgentAvatar agent={agent} size="sm" className="size-12" />
                                <span className="min-w-0">
                                  <span className="block text-sm font-extrabold tracking-wide">
                                    <bdi dir="ltr">{agent.name}</bdi>
                                  </span>
                                  <span className="block truncate text-xs text-muted">{t.agents[key].role}</span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>

      <Section className="space-y-8">
        <Intro eyebrow={w.build.eyebrow} title={w.build.title} body={w.build.body} />
        <BuildTeam
          goals={goals}
          labels={{ goals: w.build.goalsLabel, recommended: w.build.recommended, cta: w.build.cta }}
          ctaHref={COMMAND_URL}
        />
      </Section>
    </SiteChrome>
  );
}
