import { AGENTS, getAgent } from "@ix/agents";
import { AgentFigure } from "@ix/ui";
import Link from "next/link";
import { TeamBuilder } from "@/components/team-builder";
import { Intro, PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { GOALS, SOLUTIONS } from "@/lib/catalog";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/solutions", (t) => ({ title: t.web.solutionsPage.eyebrow, description: t.web.solutionsPage.body }));
}

export default async function SolutionsPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const w = t.web;

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
        <Section reveal={false}>
          <ul className="grid gap-5 md:grid-cols-2">
            {SOLUTIONS.map((solution) => {
              const copy = w.solutions.items[solution.key];
              return (
                <li key={solution.key} className="ix-reveal">
                  <article className="ix-spot relative flex h-full min-h-72 flex-col overflow-hidden rounded-[2rem] border border-line bg-surface p-7 shadow-ix sm:p-9">
                    <h2 className="max-w-[60%] text-3xl leading-[1.08] font-extrabold tracking-tight sm:text-4xl">{copy.title}</h2>
                    <p className="mt-3 max-w-[58%] text-base text-pretty text-muted sm:text-lg">{copy.body}</p>
                    <ul className="mt-auto flex flex-wrap gap-2 pt-6">
                      {solution.agents.map((key) => (
                        <li key={key}>
                          <Link
                            href={`/${locale}/agents/${key}`}
                            className="ix-btn-glass inline-flex h-9 items-center rounded-full px-3.5 text-xs font-bold tracking-wide transition-[border-color,background-color,transform] duration-300"
                          >
                            <bdi dir="ltr">{getAgent(key).name}</bdi>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {/* The team for this solution, standing at the far edge */}
                    <span dir="ltr" aria-hidden="true" className="pointer-events-none absolute end-4 bottom-0 flex h-[78%] items-end">
                      {solution.agents.slice(0, 2).map((key, i) => (
                        <img
                          key={key}
                          src={`/agents/${key}.webp`}
                          alt=""
                          width={400}
                          height={900}
                          loading="lazy"
                          decoding="async"
                          className={`w-auto object-contain drop-shadow-[0_18px_22px_rgb(6_23_58/0.28)] ${i === 0 ? "h-full" : "-ms-8 h-[86%]"}`}
                        />
                      ))}
                    </span>
                  </article>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>

      <Section className="space-y-8">
        <Intro eyebrow={w.build.eyebrow} title={w.build.title} body={w.build.body} />
        <TeamBuilder
          locale={locale}
          agents={AGENTS.map((agent) => ({ agent, role: t.agents[agent.key].role }))}
          presets={GOALS.map(({ key, agents }) => ({ key, label: w.build.goals[key].label, agents }))}
          labels={{
            presets: w.build.goalsLabel,
            roster: w.build.rosterTitle,
            board: w.build.boardTitle,
            empty: w.build.boardEmpty,
            add: w.build.add,
            remove: w.build.remove,
            clear: w.build.clear,
            covers: w.build.covers,
            limit: w.build.limit,
            send: w.build.send,
            draft: w.build.draft,
          }}
        />
      </Section>
    </SiteChrome>
  );
}
