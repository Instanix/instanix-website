import { AGENTS, type AgentState } from "@ix/agents";
import { AgentAvatar, Badge, Card } from "@ix/ui";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getI18n } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.command.team.title };
}

/**
 * Agent instances are per-organization records (Phase 1–2). Until they exist,
 * every agent is truthfully shown as Offline — never a simulated "Active".
 */
const STATE_WITHOUT_INSTANCE: AgentState = "offline";

export default async function TeamPage() {
  const { t } = await getI18n();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.command.team.title}</h1>
        <p className="max-w-2xl text-muted">{t.command.team.subtitle}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {AGENTS.map((agent) => (
          <li key={agent.key}>
            <Card style={{ "--agent": agent.accent } as CSSProperties} className="relative h-full overflow-hidden p-5">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--agent)_14%,transparent),transparent)]"
              />
              <div className="relative flex items-start gap-4">
                <AgentAvatar agent={agent} size="lg" />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-mono text-xs font-semibold text-muted">
                      <bdi dir="ltr">{agent.id}</bdi>
                    </p>
                  <h2 className="truncate text-lg font-extrabold tracking-tight">
                    <bdi dir="ltr">{agent.name}</bdi>
                  </h2>
                  <p className="text-sm text-fg-soft">{t.agents[agent.key].role}</p>
                </div>
              </div>
              <div className="relative mt-4 flex flex-wrap items-center gap-2">
                <Badge dot>{t.agentStates[STATE_WITHOUT_INSTANCE]}</Badge>
              </div>
              <p className="relative mt-4 border-t border-line pt-3 text-xs text-muted">{t.command.team.lastActivityNone}</p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
