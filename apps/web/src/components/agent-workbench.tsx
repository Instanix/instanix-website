"use client";

import type { AgentDefinition } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";
import { AgentAvatar, buttonClass, cn } from "@ix/ui";
import { Check, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { fill } from "@/lib/assessment-draft";
import { prefersReducedMotion } from "./motion";

type Work = Dictionary["web"]["agentsPage"]["work"];
type Item = Work["items"][keyof Work["items"]];

/** How the finished work is laid out. */
export type ArtifactKind = "sheet" | "list" | "message";

const STEP_MS = 850;
const ROW_MS = 420;

/**
 * A small workbench on each agent's page: the visitor runs one sample task and watches
 * the agent's steps, then the result builds row by row. Where the work is sensitive the
 * run ends at an approval the visitor has to give.
 */
export function AgentWorkbench({
  agent,
  item,
  labels,
  kind,
  needsApproval,
}: {
  readonly agent: AgentDefinition;
  readonly item: Item;
  readonly labels: Omit<Work, "items">;
  readonly kind: ArtifactKind;
  readonly needsApproval: boolean;
}) {
  // Progress counts beats: one per step, then one per row, then one for the footer.
  const total = item.steps.length + item.rows.length + 1;
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [approved, setApproved] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!running) return;
    if (progress >= total) {
      setRunning(false);
      return;
    }
    const timer = setTimeout(() => setProgress((p) => p + 1), progress < item.steps.length ? STEP_MS : ROW_MS);
    return () => clearTimeout(timer);
  }, [running, progress, total, item.steps.length]);

  // Start once when the workbench scrolls into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!started.current && entries.some((entry) => entry.isIntersecting)) {
          started.current = true;
          setRunning(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  function run() {
    started.current = true;
    setApproved(false);
    if (prefersReducedMotion()) {
      setProgress(total);
      return;
    }
    setProgress(0);
    setRunning(true);
  }

  const stepsDone = Math.min(progress, item.steps.length);
  const rowsShown = Math.max(0, Math.min(progress - item.steps.length, item.rows.length));
  const finished = progress >= total;
  const waiting = finished && needsApproval && !approved;
  const status = running ? labels.working : waiting ? labels.waiting : finished ? (approved ? labels.approved : labels.done) : labels.idle;

  return (
    <div ref={rootRef} style={{ "--agent": agent.accent } as CSSProperties} className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* The task and the agent's steps */}
      <div className="ix-glass-strong flex flex-col rounded-ix-lg p-6 sm:p-7">
        <p className="text-xs font-extrabold tracking-widest text-muted uppercase">{labels.task}</p>
        <p className="mt-2 text-xl leading-snug font-extrabold tracking-tight">{item.task}</p>
        <ol className="mt-6 space-y-3">
          {item.steps.map((step, index) => {
            const done = index < stepsDone;
            const active = running && index === stepsDone;
            return (
              <li key={step} className={cn("flex items-center gap-3 text-sm font-semibold transition-opacity duration-500", done || active ? "opacity-100" : "opacity-40")}>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-500",
                    done ? "border-transparent bg-[var(--agent)] text-white" : "border-line-strong",
                    active && "ix-node-active border-[var(--agent)]",
                  )}
                  style={{ "--ring": agent.accent } as CSSProperties}
                >
                  {done ? <Check className="size-3.5" aria-hidden="true" /> : null}
                </span>
                {step}
              </li>
            );
          })}
        </ol>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
          <p aria-live="polite" className="flex items-center gap-2.5 text-sm font-bold text-fg-soft">
            <AgentAvatar agent={agent} size="sm" />
            {status}
          </p>
          <button type="button" onClick={run} disabled={running} className={buttonClass("secondary", "sm", "h-10")}>
            {progress === 0 ? <Play className="size-4 rtl:rotate-180" aria-hidden="true" /> : <RotateCcw className="size-4" aria-hidden="true" />}
            {progress === 0 ? labels.run : labels.again}
          </button>
        </div>
      </div>

      {/* The result, building as the agent works */}
      <div className="relative flex min-h-80 flex-col overflow-hidden rounded-ix-lg border border-line bg-surface shadow-ix-lg">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(to_right,var(--agent),color-mix(in_srgb,var(--agent)_20%,transparent))]"
        />
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4 sm:px-7">
          <p className="text-sm font-extrabold tracking-tight">{item.task}</p>
          <span dir="ltr" className="font-mono text-xs font-bold text-muted">
            {agent.id}
          </span>
        </div>

        <div className="flex-1 px-6 py-5 sm:px-7">
          {rowsShown === 0 ? (
            <div aria-hidden="true" className="space-y-3">
              {item.rows.map((row) => (
                <div key={row.label} className={cn("ix-skeleton h-9", running ? "" : "[animation-play-state:paused] opacity-50")} />
              ))}
            </div>
          ) : kind === "message" ? (
            <dl className="space-y-3">
              {item.rows.slice(0, rowsShown).map((row, index) =>
                index === item.rows.length - 1 ? (
                  <div key={row.label} className="ix-anim-in">
                    <dt className="sr-only">{row.label}</dt>
                    <dd dir="auto" className="max-w-lg rounded-2xl rounded-es-md bg-[color-mix(in_srgb,var(--agent)_12%,var(--ix-surface-2))] px-4 py-3 text-base leading-relaxed">
                      {row.value}
                    </dd>
                  </div>
                ) : (
                  <div key={row.label} className="ix-anim-in flex items-baseline gap-3 text-sm">
                    <dt className="w-20 shrink-0 text-muted">{row.label}</dt>
                    <dd className="font-bold">{row.value}</dd>
                  </div>
                ),
              )}
            </dl>
          ) : (
            <dl>
              {item.rows.slice(0, rowsShown).map((row, index) => {
                const isTotal = kind === "sheet" && index === item.rows.length - 1;
                return (
                  <div
                    key={row.label}
                    className={cn(
                      "ix-anim-in flex items-baseline justify-between gap-5 border-b border-line py-3 last:border-0",
                      isTotal && "border-t-2 border-t-fg/15 pt-4",
                    )}
                  >
                    <dt className={cn("flex min-w-0 items-baseline gap-2.5 text-sm", isTotal ? "font-extrabold text-fg" : "font-semibold text-fg-soft")}>
                      {kind === "list" ? <span className="mt-1 size-1.5 shrink-0 self-start rounded-full bg-[var(--agent)]" /> : null}
                      {row.label}
                    </dt>
                    <dd
                      className={cn(
                        "shrink-0 text-end",
                        kind === "list"
                          ? "rounded-full bg-[color-mix(in_srgb,var(--agent)_14%,transparent)] px-2.5 py-0.5 text-xs font-bold"
                          : cn("max-w-[60%] tabular-nums", isTotal ? "text-xl font-extrabold" : "text-sm font-bold"),
                      )}
                    >
                      {row.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>

        {finished ? (
          <div className="ix-anim-in flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2 px-6 py-4 sm:px-7">
            <p className="min-w-0 flex-1 text-sm font-semibold text-fg-soft">{item.footer}</p>
            {needsApproval ? (
              approved ? (
                <p className="flex items-center gap-2 text-sm font-bold text-success">
                  <Check className="size-4" aria-hidden="true" />
                  {labels.approved}
                </p>
              ) : (
                <button type="button" onClick={() => setApproved(true)} className={buttonClass("primary", "sm", "h-10")}>
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  {labels.approve}
                </button>
              )
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="px-1 text-xs text-muted lg:col-span-2">{fill(labels.note, { name: agent.name })}</p>
    </div>
  );
}
