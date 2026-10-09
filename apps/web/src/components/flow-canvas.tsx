"use client";

import { getAgent } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";
import { AgentAvatar, buttonClass, cn } from "@ix/ui";
import { Check, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FLOW_KEYS, FLOWS, flowNodeCopy, type FlowKey, type FlowNode, type FlowNodeCopy } from "@/lib/flows";
import { prefersReducedMotion } from "./motion";

type Copy = Dictionary["web"]["flow"];

const STEP_MS = 1400;

/** -1 = not started, 0..last = that stage is working, last + 1 = finished. */
type Stage = number;

function stateOf(node: FlowNode, stage: Stage): "idle" | "active" | "done" {
  if (stage > node.stage) return "done";
  return stage === node.stage ? "active" : "idle";
}

function NodeTile({
  node,
  text,
  stage,
  waiting,
}: {
  readonly node: FlowNode;
  readonly text: FlowNodeCopy;
  readonly stage: Stage;
  /** This node is the approval gate and the run is paused on it. */
  readonly waiting: boolean;
}) {
  const state = stateOf(node, stage);
  const agent = node.agent ? getAgent(node.agent) : null;
  const Icon = node.icon;
  return (
    <div
      style={{ "--ring": waiting ? "var(--ix-warning)" : (agent?.accent ?? "var(--ix-brand)") } as CSSProperties}
      className={cn(
        "relative flex w-full items-center gap-2 rounded-2xl border bg-surface p-2 text-start shadow-ix transition-[border-color,opacity,transform] duration-500",
        state === "idle" ? "border-line opacity-55" : "border-[var(--ring)]",
        state === "active" && "ix-node-active scale-[1.04]",
      )}
    >
      {agent ? (
        <AgentAvatar agent={agent} size="sm" className="size-9" />
      ) : (
        <span className="grid size-9 shrink-0 place-items-center rounded-[30%] bg-brand-soft text-brand-text">
          {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
        </span>
      )}
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[0.65rem] font-bold tracking-wider text-muted uppercase">
          {agent ? <span dir="ltr">{agent.name}</span> : text.sub}
        </span>
        <span className="block text-[0.8rem] leading-tight font-bold text-balance">{text.title}</span>
      </span>
      {state === "done" ? (
        <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-success text-white shadow-ix-sm">
          <Check className="size-3.5" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}

/**
 * A workflow canvas that runs a sample job through the team, step by step. Each scenario
 * is a different business; the sales one pauses at a human approval gate.
 */
export function FlowCanvas({ copy }: { readonly copy: Copy }) {
  const [flow, setFlow] = useState<FlowKey>(FLOW_KEYS[0] ?? "sales");
  const [stage, setStage] = useState<Stage>(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const definition = FLOWS[flow];
  const scenario = copy.scenarios[flow];
  const nodeCopy = flowNodeCopy(copy, flow);
  const lastStage = definition.stageLog.length - 1;
  const approvalStage = definition.approvalStage;

  // Advance on a timer, except at an approval gate, which waits for the visitor.
  useEffect(() => {
    if (stage < 0 || stage > lastStage || stage === approvalStage) return;
    const timer = setTimeout(() => setStage((s) => s + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [stage, lastStage, approvalStage]);

  // Start once when the canvas scrolls into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!started.current && entries.some((entry) => entry.isIntersecting)) {
          started.current = true;
          setStage(0);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const run = () => {
    started.current = true;
    setStage(0);
  };
  const choose = (key: FlowKey) => {
    started.current = true;
    setFlow(key);
    setStage(0);
  };

  const waiting = stage === approvalStage;
  const finished = stage > lastStage;
  const status = stage < 0 ? copy.status.idle : waiting ? copy.status.waiting : finished ? copy.status.done : copy.status.running;
  const lines = definition.stageLog.slice(0, Math.max(0, Math.min(stage, lastStage) + 1)).flat();
  const find = (key: string) => definition.nodes.find((n) => n.key === key);

  return (
    <div ref={rootRef} className="space-y-4">
      <div role="group" aria-label={copy.scenarioLabel} className="flex flex-wrap gap-2">
        {FLOW_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={key === flow}
            onClick={() => choose(key)}
            className={buttonClass(key === flow ? "primary" : "secondary", "sm", "h-10")}
          >
            {copy.scenarios[key].name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="ix-glass-strong relative overflow-hidden rounded-ix-lg">
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-bold text-fg-soft">
              <span
                className={cn(
                  "size-2 rounded-full",
                  waiting ? "bg-warning" : finished ? "bg-success" : stage < 0 ? "bg-muted" : "ix-anim-pulse bg-brand",
                )}
              />
              <span aria-live="polite">{status}</span>
            </p>
            <button type="button" onClick={run} className={buttonClass("secondary", "sm")}>
              {stage < 0 ? <Play className="size-4 rtl:rotate-180" aria-hidden="true" /> : <RotateCcw className="size-4" aria-hidden="true" />}
              {stage < 0 ? copy.play : copy.replay}
            </button>
          </div>

          {/* Large screens: the canvas. Positions use logical offsets, so the flow runs right to left in Arabic. */}
          <div className="ix-dots relative hidden aspect-[1000/420] lg:block">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full rtl:-scale-x-100">
              {definition.edges.map(([from, to]) => {
                const a = find(from);
                const b = find(to);
                if (!a || !b) return null;
                const mid = (a.x + b.x) / 2;
                const d = `M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
                return (
                  <g key={`${flow}-${from}-${to}`} fill="none" strokeWidth="2">
                    <path d={d} stroke="var(--ix-line-strong)" vectorEffect="non-scaling-stroke" />
                    {stateOf(b, stage) === "idle" ? null : (
                      <path
                        d={d}
                        pathLength={1}
                        stroke="var(--ix-brand)"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="ix-edge-run"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            {definition.nodes.map((node) => (
              <div
                key={`${flow}-${node.key}`}
                className="absolute w-[15%] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
                style={{ insetInlineStart: `${node.x}%`, top: `${node.y}%` }}
              >
                <NodeTile
                  node={node}
                  text={nodeCopy[node.key] ?? { title: node.key, sub: "" }}
                  stage={stage}
                  waiting={waiting && node.stage === approvalStage}
                />
              </div>
            ))}
          </div>

          {/* Small screens: the same run as a vertical list. */}
          <ol className="space-y-2 p-4 lg:hidden">
            {definition.nodes.map((node) => (
              <li key={`${flow}-${node.key}`}>
                <NodeTile
                  node={node}
                  text={nodeCopy[node.key] ?? { title: node.key, sub: "" }}
                  stage={stage}
                  waiting={waiting && node.stage === approvalStage}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="ix-glass flex min-h-64 flex-col rounded-ix-lg p-4">
          <p className="text-xs font-extrabold tracking-widest text-muted uppercase">{copy.logTitle}</p>
          {lines.length === 0 ? (
            <p className="m-auto text-center text-sm text-muted">{copy.logEmpty}</p>
          ) : (
            <ol className="mt-3 flex-1 space-y-2.5">
              {lines.map((index) => {
                const agent = definition.logAgents[index];
                return (
                  <li key={`${flow}-${index}`} className="ix-anim-in flex items-start gap-2.5 text-sm text-fg-soft">
                    {agent ? (
                      <AgentAvatar agent={getAgent(agent)} size="xs" className="mt-0.5" />
                    ) : (
                      <span className="mx-2 mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
                    )}
                    <span>{scenario.log[index]}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {waiting ? (
            <div className="ix-anim-in mt-4 space-y-2 rounded-2xl border border-warning/50 bg-[color-mix(in_srgb,var(--ix-warning)_10%,transparent)] p-3">
              <p className="text-xs font-semibold text-fg-soft">{copy.approvalHint}</p>
              <button type="button" onClick={() => setStage((s) => s + 1)} className={buttonClass("primary", "sm", "w-full")}>
                <ShieldCheck className="size-4" aria-hidden="true" />
                {copy.approve}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
