"use client";

import type { AgentDefinition, AgentKey } from "@ix/agents";
import type { Locale } from "@ix/i18n";
import { AgentAvatar, buttonClass, cn } from "@ix/ui";
import { ArrowRight, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type DragEvent } from "react";
import { fill, saveAssessmentDraft } from "@/lib/assessment-draft";

export interface BuilderAgent {
  readonly agent: AgentDefinition;
  readonly role: string;
}

export interface BuilderPreset {
  readonly key: string;
  readonly label: string;
  readonly agents: readonly AgentKey[];
}

const MAX_TEAM = 6;
const DRAG_TYPE = "text/x-ix-agent";

/**
 * Visitors assemble their own IX team by dragging agents onto a board (or tapping them),
 * then send that team to the assessment form as the start of their request.
 */
export function TeamBuilder({
  locale,
  agents,
  presets,
  labels,
}: {
  readonly locale: Locale;
  readonly agents: readonly BuilderAgent[];
  readonly presets: readonly BuilderPreset[];
  readonly labels: {
    readonly presets: string;
    readonly roster: string;
    readonly board: string;
    readonly empty: string;
    readonly add: string;
    readonly remove: string;
    readonly clear: string;
    readonly covers: string;
    readonly limit: string;
    readonly send: string;
    readonly draft: string;
  };
}) {
  const router = useRouter();
  const [team, setTeam] = useState<readonly AgentKey[]>(["zeus"]);
  const [over, setOver] = useState(false);
  const byKey = new Map(agents.map((entry) => [entry.agent.key, entry]));
  const full = team.length >= MAX_TEAM;

  const add = (key: AgentKey) => setTeam((current) => (current.includes(key) || current.length >= MAX_TEAM ? current : [...current, key]));
  const remove = (key: AgentKey) => setTeam((current) => current.filter((k) => k !== key));

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setOver(false);
    const key = event.dataTransfer.getData(DRAG_TYPE);
    if (byKey.has(key as AgentKey)) add(key as AgentKey);
  }

  function send() {
    const names = team.map((key) => byKey.get(key)?.agent.name ?? key).join(", ");
    saveAssessmentDraft(fill(labels.draft, { team: names }));
    router.push(`/${locale}/assessment`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
      {/* Roster */}
      <div className="ix-glass-strong rounded-ix-lg p-5 sm:p-6">
        <div role="group" aria-label={labels.presets} className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button key={preset.key} type="button" onClick={() => setTeam(preset.agents.slice(0, MAX_TEAM))} className={buttonClass("secondary", "sm")}>
              {preset.label}
            </button>
          ))}
        </div>
        <p className="mt-5 text-xs font-extrabold tracking-widest text-muted uppercase">{labels.roster}</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {agents.map(({ agent, role }) => {
            const chosen = team.includes(agent.key);
            return (
              <li key={agent.key}>
                <button
                  type="button"
                  draggable={!chosen && !full}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(DRAG_TYPE, agent.key);
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => (chosen ? remove(agent.key) : add(agent.key))}
                  aria-pressed={chosen}
                  aria-label={`${chosen ? labels.remove : labels.add}: ${agent.name}`}
                  disabled={!chosen && full}
                  style={{ "--agent": agent.accent } as CSSProperties}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-2xl border p-2 text-start transition-[border-color,background-color,opacity,transform] duration-300",
                    chosen
                      ? "border-[var(--agent)] bg-[color-mix(in_srgb,var(--agent)_10%,transparent)]"
                      : "cursor-grab border-line bg-surface hover:-translate-y-0.5 hover:border-[var(--agent)] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-45",
                  )}
                >
                  <AgentAvatar agent={agent} size="sm" />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span dir="ltr" className="block truncate text-xs font-extrabold tracking-wide rtl:text-end">
                      {agent.name}
                    </span>
                    <span className="block truncate text-[0.7rem] text-muted">{role}</span>
                  </span>
                  {chosen ? null : <Plus className="size-4 shrink-0 text-muted transition-colors group-hover:text-fg" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Board */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex min-h-[26rem] flex-col overflow-hidden rounded-ix-lg border-2 border-dashed p-5 transition-colors duration-300 sm:p-6",
          over ? "border-brand bg-[color-mix(in_srgb,var(--ix-brand)_10%,transparent)]" : "border-line-strong bg-surface",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-extrabold tracking-widest text-muted uppercase">
            {labels.board} · <span className="tabular-nums">{team.length}/{MAX_TEAM}</span>
          </p>
          {team.length > 0 ? (
            <button type="button" onClick={() => setTeam([])} className="text-xs font-semibold text-muted hover:text-fg">
              {labels.clear}
            </button>
          ) : null}
        </div>

        {team.length === 0 ? (
          <p className="m-auto max-w-xs text-center text-sm text-muted">{labels.empty}</p>
        ) : (
          <ul dir="ltr" aria-live="polite" className="flex flex-1 items-end justify-center pt-4">
            {team.map((key) => {
              const entry = byKey.get(key);
              if (!entry) return null;
              return (
                <li key={key} className="ix-anim-in group relative -mx-3 h-56 sm:-mx-2 sm:h-64" style={{ "--agent": entry.agent.accent } as CSSProperties}>
                  <span className="absolute inset-x-2 bottom-0 h-4 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--agent)_70%,transparent),transparent)] blur-sm" />
                  <img
                    src={`/agents/${key}-sm.webp`}
                    alt={entry.agent.name}
                    width={400}
                    height={900}
                    loading="lazy"
                    className="relative h-full w-auto object-contain drop-shadow-[0_18px_22px_rgb(6_23_58/0.3)] transition-transform duration-300 group-hover:-translate-y-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => remove(key)}
                    aria-label={`${labels.remove}: ${entry.agent.name}`}
                    className="absolute top-0 left-1/2 grid size-7 -translate-x-1/2 place-items-center rounded-full border border-line bg-surface text-fg-soft opacity-0 shadow-ix-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {team.length > 0 ? (
          <div className="mt-4 space-y-3 border-t border-line pt-4">
            <p className="text-sm text-fg-soft">
              <span className="font-bold text-fg">{labels.covers}: </span>
              {team.map((key) => byKey.get(key)?.role).filter(Boolean).join(" · ")}
            </p>
            {full ? <p className="text-xs text-muted">{labels.limit}</p> : null}
            <button type="button" onClick={send} className={buttonClass("primary", "md")}>
              {labels.send}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
