import { AGENT_KEYS, getAgent, isAgentKey, type AgentKey } from "@ix/agents";
import { getDictionary, isLocale } from "@ix/i18n";
import { AgentAvatar, AgentFigure, buttonClass, Card, Eyebrow } from "@ix/ui";
import { ArrowLeft, ArrowRight, CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { AgentWorkbench } from "@/components/agent-workbench";
import { SolutionCard } from "@/components/blocks";
import { Section, SiteChrome } from "@/components/site-chrome";
import { AGENT_WORK } from "@/lib/agent-work";
import { fill } from "@/lib/assessment-draft";
import { SOLUTIONS } from "@/lib/catalog";
import { alternatesFor } from "@/lib/page";

interface Props {
  readonly params: Promise<{ locale: string; agent: string }>;
}

export function generateStaticParams() {
  return AGENT_KEYS.map((agent) => ({ agent }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, agent } = await params;
  if (!isLocale(locale) || !isAgentKey(agent)) return {};
  const copy = getDictionary(locale).agents[agent];
  return {
    title: `${getAgent(agent).name} — ${copy.role} — IX`,
    description: copy.summary,
    alternates: alternatesFor(locale, `/agents/${agent}`),
  };
}

export default async function AgentPage({ params }: Props) {
  const { locale, agent: agentParam } = await params;
  // Both segments are untrusted URL input.
  if (!isLocale(locale) || !isAgentKey(agentParam)) notFound();
  const t = getDictionary(locale);
  const agent = getAgent(agentParam);
  const copy = t.agents[agent.key];
  const a = t.web.agentsPage;
  const { items: workItems, ...workLabels } = a.work;
  const work = workItems[agent.key];
  const name = { name: agent.name };

  const solutions = SOLUTIONS.filter((solution) => solution.agents.includes(agent.key));
  const teammates = [...new Set(solutions.flatMap((solution) => solution.agents))].filter(
    (key): key is AgentKey => key !== agent.key,
  );

  return (
    <SiteChrome locale={locale} t={t} path={`/agents/${agent.key}`}>
      <div style={{ "--agent": agent.accent } as CSSProperties} className="relative isolate -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_75%_35%,color-mix(in_srgb,var(--agent)_30%,transparent),transparent_70%)]"
        />
        <Section className="grid items-end gap-8 pt-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="space-y-6 pb-4 lg:pb-16">
            <Link
              href={`/${locale}/agents`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-soft transition-colors hover:text-brand-text"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
              {a.back}
            </Link>
            <div className="space-y-2">
              <p className="font-mono text-sm font-semibold text-muted">
                <bdi dir="ltr">{agent.id}</bdi>
              </p>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
                <bdi dir="ltr">{agent.name}</bdi>
              </h1>
              <p className="text-2xl font-bold text-fg-soft">{copy.role}</p>
            </div>
            <p className="max-w-xl text-lg text-pretty text-fg-soft sm:text-xl">{copy.summary}</p>
            <Eyebrow>{copy.domain}</Eyebrow>
            <div>
              <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
                {a.cta}
                <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="relative flex h-[22rem] justify-center sm:h-[30rem]">
            <div
              aria-hidden="true"
              className="ix-anim-pulse absolute inset-x-0 bottom-0 h-20 rounded-[100%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--agent)_60%,transparent),transparent)] blur-lg"
            />
            <AgentFigure agent={agent} priority className="relative" />
          </div>
        </Section>
      </div>

      {/* What changes when this agent takes the work */}
      <Section className="space-y-8">
        <h2 className="max-w-3xl text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl">{fill(a.work.jobTitle, name)}</h2>
        <div style={{ "--agent": agent.accent } as CSSProperties} className="grid gap-4 md:grid-cols-2">
          <div className="rounded-ix-lg border border-line bg-surface-2 p-6 sm:p-8">
            <p className="text-xs font-extrabold tracking-widest text-muted uppercase">{fill(a.work.without, name)}</p>
            <p className="mt-4 text-xl leading-relaxed text-pretty text-fg-soft">{work.before}</p>
          </div>
          <div className="relative overflow-hidden rounded-ix-lg border border-[color-mix(in_srgb,var(--agent)_45%,var(--ix-line))] bg-surface p-6 shadow-ix-lg sm:p-8">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(26rem_14rem_at_100%_0%,color-mix(in_srgb,var(--agent)_18%,transparent),transparent_70%)]"
            />
            <p className="relative text-xs font-extrabold tracking-widest text-fg-soft uppercase">{fill(a.work.withAgent, name)}</p>
            <p className="relative mt-4 text-xl leading-relaxed font-semibold text-pretty">{work.after}</p>
          </div>
        </div>
      </Section>

      {/* The agent doing one sample task, live */}
      <Section id="work" className="space-y-8">
        <div className="max-w-2xl space-y-4">
          <Eyebrow>{a.work.demoEyebrow}</Eyebrow>
          <h2 className="text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl">{fill(a.work.demoTitle, name)}</h2>
        </div>
        <AgentWorkbench
          agent={agent}
          item={work}
          labels={workLabels}
          kind={AGENT_WORK[agent.key].kind}
          needsApproval={AGENT_WORK[agent.key].approval}
        />
      </Section>

      <Section className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">{a.skillsTitle}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {copy.skills.map((skill) => (
              <li key={skill} className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-4 py-3 text-sm font-semibold">
                <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-brand-text" aria-hidden="true" />
                {skill}
              </li>
            ))}
          </ul>
        </Card>
        {teammates.length > 0 ? (
          <Card className="space-y-5 p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight">{a.teammatesTitle}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {teammates.map((key) => {
                const mate = getAgent(key);
                return (
                  <li key={key}>
                    <Link
                      href={`/${locale}/agents/${key}`}
                      className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 transition-colors hover:bg-brand-soft"
                    >
                      <AgentAvatar agent={mate} size="md" />
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold tracking-wide">
                          <bdi dir="ltr">{mate.name}</bdi>
                        </span>
                        <span className="block truncate text-xs text-muted">{t.agents[key].role}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        ) : null}
      </Section>

      {solutions.length > 0 ? (
        <Section className="space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{a.solutionsTitle}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map((solution) => (
              <li key={solution.key}>
                <SolutionCard solutionKey={solution.key} t={t} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </SiteChrome>
  );
}
