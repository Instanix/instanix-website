"use client";

import type { AgentDefinition } from "@ix/agents";
import { AgentAvatar, buttonClass, cn } from "@ix/ui";
import { ArrowRight, Target } from "lucide-react";
import { useState } from "react";

export interface BuildGoal {
  readonly key: string;
  readonly label: string;
  readonly body: string;
  readonly agents: readonly { readonly agent: AgentDefinition; readonly role: string }[];
}

/** Goal picker: shows which IX agents staff a business goal. Static mapping, no model call. */
export function BuildTeam({
  goals,
  labels,
  ctaHref,
}: {
  readonly goals: readonly BuildGoal[];
  readonly labels: { readonly goals: string; readonly recommended: string; readonly cta: string };
  readonly ctaHref: string;
}) {
  const [selectedKey, setSelectedKey] = useState(goals[0]?.key);
  const selected = goals.find((goal) => goal.key === selectedKey) ?? goals[0];
  if (!selected) return null;

  return (
    <div className="ix-glass grid gap-6 rounded-ix-lg p-4 shadow-ix-lg sm:p-6 lg:grid-cols-[18rem_1fr]">
      <div role="group" aria-label={labels.goals} className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {goals.map((goal) => {
          const active = goal.key === selected.key;
          return (
            <button
              key={goal.key}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedKey(goal.key)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-start text-sm font-semibold transition-colors",
                active ? "bg-primary text-on-primary shadow-ix-glow" : "text-fg-soft hover:bg-surface-2 hover:text-fg",
              )}
            >
              <Target className="size-4 shrink-0" aria-hidden="true" />
              {goal.label}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="flex flex-col gap-5 rounded-ix border border-line bg-surface p-5 sm:p-6">
        <div className="space-y-1.5">
          <h3 className="text-xl font-extrabold tracking-tight">{selected.label}</h3>
          <p className="text-muted">{selected.body}</p>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-bold">{labels.recommended}</p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {selected.agents.map(({ agent, role }) => (
              <li key={agent.key} className="flex flex-col items-center gap-2 rounded-2xl bg-surface-2 p-4 text-center">
                <AgentAvatar agent={agent} size="lg" />
                <p className="text-sm font-extrabold tracking-wide">
                  <bdi dir="ltr">{agent.name}</bdi>
                </p>
                <p className="text-xs text-muted">{role}</p>
              </li>
            ))}
          </ul>
        </div>
        <a href={ctaHref} className={buttonClass("primary", "md", "self-start")}>
          {labels.cta}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
