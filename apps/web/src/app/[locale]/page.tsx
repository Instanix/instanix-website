import { AGENTS, getAgent } from "@ix/agents";
import { AgentFigure, buttonClass, Eyebrow } from "@ix/ui";
import { AppWindow, ArrowRight, Building2, LayoutDashboard, Settings2, Users, Workflow, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { GuardGrid, HowBand, SolutionCard, ToolMark } from "@/components/blocks";
import { BuildTeam, type BuildGoal } from "@/components/build-team";
import { CommandPreview } from "@/components/command-preview";
import { FlowCanvas } from "@/components/flow-canvas";
import { HeroStage } from "@/components/hero-stage";
import { Reveal } from "@/components/motion";
import { DemoSection, IndustryCards } from "@/components/sections";
import { Heading, Intro, Section, SiteChrome } from "@/components/site-chrome";
import { TeamShowcase } from "@/components/team-showcase";
import { FEATURED_TOOLS, GOALS, SOLUTIONS } from "@/lib/catalog";
import { loadPage, type LocaleParams } from "@/lib/page";

const APP_ICONS: readonly LucideIcon[] = [Users, Building2, AppWindow, Settings2, LayoutDashboard, Workflow];

export default async function HomePage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const w = t.web;

  const goals: BuildGoal[] = GOALS.map(({ key, agents }) => ({
    key,
    label: w.build.goals[key].label,
    body: w.build.goals[key].body,
    agents: agents.map((agentKey) => ({ agent: getAgent(agentKey), role: t.agents[agentKey].role })),
  }));

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

      {/* Industries */}
      <Section id="industries" className="space-y-8">
        <Intro eyebrow={w.industries.eyebrow} title={w.industries.title} body={w.industries.body} />
        <IndustryCards locale={locale} t={t} />
      </Section>

      {/* How it works */}
      <Section id="how">
        <HowBand
          t={t}
          action={
            <Link href={`/${locale}/platform`} className={buttonClass("on-ink", "md")}>
              {w.links.howItWorks}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          }
        />
      </Section>

      {/* Solutions */}
      <Section id="solutions" className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Intro eyebrow={w.solutions.eyebrow} title={w.solutions.title} body={w.solutions.body} />
          <Link href={`/${locale}/solutions`} className={buttonClass("secondary", "md")}>
            {w.links.viewSolutions}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOLUTIONS.map((solution) => (
            <li key={solution.key}>
              <SolutionCard solutionKey={solution.key} t={t} />
            </li>
          ))}
        </ul>
      </Section>

      {/* Business applications */}
      <Section id="apps" className="grid gap-10 lg:grid-cols-[25rem_1fr] lg:items-center">
        <div className="space-y-5">
          <Eyebrow>{w.apps.eyebrow}</Eyebrow>
          <Heading>
            <span className="block">{w.apps.line1}</span>
            <span className="ix-gradient-text block lg:whitespace-nowrap">{w.apps.accent}</span>
            <span className="block">{w.apps.line3}</span>
          </Heading>
          <p className="text-lg text-pretty text-muted">{w.apps.body}</p>
          <Link href={`/${locale}/business-applications`} className={buttonClass("secondary", "md")}>
            {w.links.exploreApps}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-ix-lg border border-line bg-[linear-gradient(135deg,var(--ix-brand-soft),var(--ix-surface))] p-6 shadow-ix sm:p-10">
          <div aria-hidden="true" className="ix-grid-lines absolute inset-0" />
          <div className="relative grid grid-cols-2 items-center gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
            <div
              aria-hidden="true"
              className="relative col-span-2 mx-auto grid size-32 place-items-center rounded-[28%] bg-[linear-gradient(135deg,var(--ix-cyan),var(--ix-primary))] text-5xl font-extrabold text-white shadow-ix-glow lg:order-2 lg:col-span-1 lg:size-40"
            >
              <span className="ix-anim-pulse absolute -inset-4 rounded-[32%] border border-brand/40" />
              <span dir="ltr">IX</span>
            </div>
            {[w.apps.items.slice(0, 3), w.apps.items.slice(3)].map((group, g) => (
              <ul key={g} className={`space-y-3 ${g === 0 ? "lg:order-1" : "lg:order-3"}`}>
                {group.map((item, i) => {
                  const Icon = APP_ICONS[g * 3 + i] ?? AppWindow;
                  return (
                    <li key={item} className="ix-glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold shadow-ix-sm">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-text">
                        <Icon className="size-4.5" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
      </Section>

      {/* Build your IX team */}
      <Section id="build" className="space-y-8">
        <Intro eyebrow={w.build.eyebrow} title={w.build.title} body={w.build.body} />
        <BuildTeam
          goals={goals}
          labels={{ goals: w.build.goalsLabel, recommended: w.build.recommended, cta: w.build.cta }}
          ctaHref={`/${locale}/assessment`}
        />
      </Section>

      {/* IX Command */}
      <Section id="command" className="grid gap-10 lg:grid-cols-[25rem_1fr] lg:items-center">
        <div className="space-y-5">
          <Eyebrow>{w.command.eyebrow}</Eyebrow>
          <Heading>
            <span className="block">{w.command.line1}</span>
            <span className="ix-gradient-text block lg:whitespace-nowrap">{w.command.accent}</span>
          </Heading>
          <p className="text-lg text-pretty text-muted">{w.command.body}</p>
          <Link href={`/${locale}/platform`} className={buttonClass("secondary", "lg")}>
            {w.command.cta}
            <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
        <CommandPreview t={t} />
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
