import { AGENTS, getAgent } from "@ix/agents";
import { AgentFigure, buttonClass } from "@ix/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BeforeAfter } from "@/components/before-after";
import { GuardGrid, ToolMark } from "@/components/blocks";
import { FlowCanvas } from "@/components/flow-canvas";
import { GulfMap } from "@/components/gulf-map";
import { HeroStage } from "@/components/hero-stage";
import { Reveal } from "@/components/motion";
import { SavingsCalculator } from "@/components/savings-calculator";
import { DemoSection, IndustryCards } from "@/components/sections";
import { Intro, Section, SiteChrome } from "@/components/site-chrome";
import { TeamBuilder } from "@/components/team-builder";
import { TeamShowcase } from "@/components/team-showcase";
import { FEATURED_TOOLS, GOALS } from "@/lib/catalog";
import { assertFlows } from "@/lib/flows";
import { loadPage, type LocaleParams } from "@/lib/page";

export default async function HomePage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const w = t.web;
  assertFlows(w.flow);

  return (
    <SiteChrome locale={locale} t={t}>
      <div>
        <HeroStage locale={locale} t={t} />
        {/* Tool strip */}
        <Section className="relative z-10 mt-10 space-y-3">
          <div className="ix-glass-strong flex flex-col gap-5 rounded-ix-lg px-6 py-5 lg:flex-row lg:items-center lg:gap-6">
            <h2 className="shrink-0 text-xs leading-relaxed font-extrabold tracking-widest text-fg-soft uppercase lg:max-w-48">
              {w.connect.title}
            </h2>
            <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-3">
              {FEATURED_TOOLS.map((tool) => (
                <li key={tool.name}>
                  <ToolMark tool={tool} />
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/integrations`} className={buttonClass("secondary", "sm", "shrink-0 self-start lg:self-auto")}>
              {w.links.viewIntegrations}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
          <p className="px-2 text-xs text-muted">{w.connect.note}</p>
        </Section>
      </div>

      <TeamShowcase
        agents={AGENTS.map((agent) => ({
          agent,
          role: t.agents[agent.key].role,
          summary: t.agents[agent.key].summary,
          skills: t.agents[agent.key].skills,
          href: `/${locale}/agents/${agent.key}`,
        }))}
        labels={{
          eyebrow: w.team.eyebrow,
          title: w.team.title,
          statement: w.team.statement,
          list: w.team.listLabel,
          skills: w.team.skillsLabel,
          profile: w.team.profile,
          skip: w.team.skip,
        }}
        nextHref="#flow"
      />

      {/* One message, the whole team: the workflow canvas */}
      <Section id="flow" className="space-y-8">
        <Reveal>
          <Intro eyebrow={w.flow.eyebrow} title={w.flow.title} body={w.flow.body} />
        </Reveal>
        <Reveal delay={0.1}>
          <FlowCanvas copy={w.flow} />
          <p className="mt-3 px-1 text-xs text-muted">{w.flow.note}</p>
        </Reveal>
      </Section>

      <DemoSection locale={locale} t={t} />

      {/* The same day, by hand and with IX */}
      <Section id="compare" className="space-y-8">
        <Intro eyebrow={w.compare.eyebrow} title={w.compare.title} body={w.compare.body} />
        <BeforeAfter copy={w.compare} />
      </Section>

      {/* Savings calculator */}
      <Section id="calculator" className="space-y-8">
        <Intro eyebrow={w.calc.eyebrow} title={w.calc.title} body={w.calc.body} />
        <SavingsCalculator locale={locale} copy={w.calc} />
      </Section>

      {/* Industries */}
      <Section id="industries" className="space-y-8">
        <Intro eyebrow={w.industries.eyebrow} title={w.industries.title} body={w.industries.body} />
        <IndustryCards locale={locale} t={t} />
      </Section>

      {/* Where we work */}
      <Section id="region" className="space-y-8">
        <Intro eyebrow={w.map.eyebrow} title={w.map.title} body={w.map.body} />
        <GulfMap
          locale={locale}
          copy={w.map}
          industries={Object.fromEntries(Object.entries(w.industries.items).map(([key, item]) => [key, item.name]))}
        />
      </Section>

      {/* Build your IX team */}
      <Section id="build" className="space-y-8">
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

      {/* IX Guard */}
      <Section id="guard" className="grid gap-10 lg:grid-cols-[25rem_1fr] lg:items-center">
        <div className="space-y-5">
          <Intro eyebrow={w.guard.eyebrow} title={w.guard.title} body={w.guard.body} />
          <div className="hidden h-64 justify-start lg:flex">
            <AgentFigure agent={getAgent("ares")} />
          </div>
        </div>
        <GuardGrid t={t} />
      </Section>
    </SiteChrome>
  );
}
