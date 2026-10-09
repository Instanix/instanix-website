"use client";

import { getAgent } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";
import { AgentAvatar, buttonClass, cn } from "@ix/ui";
import { Check, CheckCheck, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DEMO_SCENARIOS, DEMO_SCRIPTS, type CrmField, type DemoStep } from "@/lib/demo-script";
import type { DemoScenarioKey } from "@/lib/industries";

type Copy = Dictionary["web"]["demo"];

const CRM_FIELDS: readonly CrmField[] = ["source", "need", "details", "booking", "status"];

/** How long each beat stays on screen before the next one. Agent replies include "typing" time. */
function delayFor(step: DemoStep): number {
  if (step.kind === "agent") return 1500;
  if (step.kind === "customer") return 1100;
  return 750;
}

/**
 * Scripted, simulated conversation: a phone chat on one side, the CRM record and
 * agent activity on the other. No model call and no real data — it is labelled as a demo.
 */
export function LiveDemo({
  copy,
  initial,
  scenarios = DEMO_SCENARIOS,
}: {
  readonly copy: Copy;
  readonly initial?: DemoScenarioKey;
  /** Limit the picker (an industry page shows only its own scenario). */
  readonly scenarios?: readonly DemoScenarioKey[];
}) {
  const [scenario, setScenario] = useState<DemoScenarioKey>(initial ?? scenarios[0] ?? "automotive");
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const script = DEMO_SCRIPTS[scenario];
  const lines = copy.scenarios[scenario].lines;
  const finished = shown >= script.length;
  const next = script[shown];

  useEffect(() => {
    if (!playing || !next) return;
    const timer = window.setTimeout(() => setShown((count) => count + 1), delayFor(next));
    return () => window.clearTimeout(timer);
  }, [playing, next]);

  useEffect(() => {
    const chat = chatRef.current;
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [shown, playing]);

  function play() {
    // People who prefer reduced motion get the finished state instead of the animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(script.length);
      setPlaying(false);
      return;
    }
    setShown(0);
    setPlaying(true);
  }

  function choose(key: DemoScenarioKey) {
    setScenario(key);
    setShown(0);
    setPlaying(false);
  }

  const visible = script.slice(0, shown).map((step, index) => ({ step, text: lines[index] ?? "", index }));
  const messages = visible.filter(({ step }) => step.kind === "customer" || step.kind === "agent");
  const events = visible.filter(({ step }) => step.kind === "event");
  const record = new Map<CrmField, { text: string; index: number }>();
  for (const { step, text, index } of visible) {
    if (step.kind === "crm") record.set(step.field, { text, index });
  }
  const typing = playing && next?.kind === "agent";

  return (
    <div className="space-y-5">
      {scenarios.length > 1 ? (
        <div role="group" aria-label={copy.scenarioLabel} className="flex flex-wrap gap-2">
          {scenarios.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={key === scenario}
              onClick={() => choose(key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                key === scenario ? "bg-primary text-on-primary shadow-ix-glow" : "ix-glass text-fg-soft hover:text-fg",
              )}
            >
              {copy.scenarios[key].name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        {/* Phone */}
        <div className="mx-auto w-full max-w-[22rem] rounded-[2.6rem] bg-[#0b1220] p-2.5 shadow-ix-lg ring-1 ring-white/10">
          <div className="flex h-[34rem] flex-col overflow-hidden rounded-[2.1rem] bg-surface">
            <div className="flex items-center gap-3 bg-[#0d5c4f] px-4 py-3 text-white">
              <span dir="ltr" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-extrabold">
                {copy.scenarios[scenario].business.charAt(0)}
              </span>
              <div className="min-w-0">
                <p dir="ltr" className="truncate text-start text-sm font-bold rtl:text-end">
                  {copy.scenarios[scenario].business}
                </p>
                <p className="text-xs text-white/75">{typing ? copy.typing : copy.online}</p>
              </div>
            </div>
            <div ref={chatRef} aria-live="polite" className="flex-1 space-y-2.5 overflow-y-auto bg-surface-2 p-3">
              {messages.map(({ step, text, index }) => {
                const mine = step.kind === "customer";
                return (
                  <div key={index} className={cn("ix-anim-in flex", mine ? "justify-end" : "justify-start")}>
                    <p
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-ix-sm",
                        mine ? "rounded-ee-md bg-[#d8fdd2] text-[#0b1220]" : "rounded-es-md bg-surface text-fg",
                      )}
                    >
                      {text}
                      {mine ? <CheckCheck className="ms-1.5 inline size-3.5 text-[#3497f9]" aria-hidden="true" /> : null}
                    </p>
                  </div>
                );
              })}
              {typing ? (
                <div className="ix-anim-in flex justify-start">
                  <p className="flex gap-1 rounded-2xl rounded-es-md bg-surface px-4 py-3 shadow-ix-sm" aria-label={copy.typing}>
                    <span className="ix-typing-dot" />
                    <span className="ix-typing-dot [animation-delay:150ms]" />
                    <span className="ix-typing-dot [animation-delay:300ms]" />
                  </p>
                </div>
              ) : null}
            </div>
            <div className="border-t border-line bg-surface p-3">
              <button type="button" onClick={play} disabled={playing && !finished} className={buttonClass("primary", "md", "w-full")}>
                {finished ? <RotateCcw className="size-4" aria-hidden="true" /> : <Play className="size-4 rtl:rotate-180" aria-hidden="true" />}
                {finished ? copy.replay : copy.play}
              </button>
            </div>
          </div>
        </div>

        {/* Behind the scenes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="rounded-ix border border-line bg-surface p-5 shadow-ix">
            <h3 className="text-sm font-extrabold tracking-widest text-fg-soft uppercase">{copy.crmTitle}</h3>
            <dl className="mt-4 space-y-3">
              {CRM_FIELDS.map((field) => {
                const value = record.get(field);
                return (
                  <div key={field} className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                    <dt className="shrink-0 text-sm text-muted">{copy.fields[field]}</dt>
                    <dd
                      key={value?.index ?? "empty"}
                      className={cn("text-end text-sm font-bold", value ? "ix-anim-flash text-fg" : "text-muted")}
                    >
                      {value?.text ?? copy.empty}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="rounded-ix border border-line bg-surface p-5 shadow-ix">
            <h3 className="text-sm font-extrabold tracking-widest text-fg-soft uppercase">{copy.activityTitle}</h3>
            {events.length === 0 ? (
              <p className="mt-4 text-sm text-muted">{copy.activityEmpty}</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {events.map(({ step, text, index }) =>
                  step.kind === "event" ? (
                    <li key={index} className="ix-anim-in flex items-center gap-3">
                      <AgentAvatar agent={getAgent(step.agent)} size="sm" />
                      <p className="min-w-0 flex-1 text-sm font-semibold">{text}</p>
                      <Check className="size-4 shrink-0 text-success" aria-hidden="true" />
                    </li>
                  ) : null,
                )}
              </ol>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted">{copy.note}</p>
    </div>
  );
}
