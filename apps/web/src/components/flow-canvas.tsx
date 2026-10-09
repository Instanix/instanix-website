"use client";

import { getAgent, type AgentKey } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";
import { AgentAvatar, buttonClass } from "@ix/ui";
import { Check, MessageCircle, Play, RotateCcw, ScrollText, Send, ShieldCheck, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "./motion";

type Copy = Dictionary["web"]["flow"];
type NodeKey = keyof Copy["nodes"];

interface FlowNode {
  readonly key: NodeKey;
  /** Center of the node on the canvas, in percent. */
  readonly x: number;
  readonly y: number;
  /** The stage of the run in which this node works. */
  readonly stage: number;
  readonly agent?: AgentKey;
  readonly icon?: LucideIcon;
}

const NODES: readonly FlowNode[] = [
  { key: "trigger", x: 9, y: 50, stage: 0, icon: MessageCircle },
  { key: "zeus", x: 25.5, y: 50, stage: 1, agent: "zeus" },
  { key: "atlas", x: 42, y: 22, stage: 2, agent: "atlas" },
  { key: "poseidon", x: 42, y: 78, stage: 2, agent: "poseidon" },
  { key: "hermes", x: 58.5, y: 50, stage: 3, agent: "hermes" },
  { key: "approval", x: 75, y: 50, stage: 4, icon: ShieldCheck },
  { key: "send", x: 91, y: 22, stage: 5, icon: Send },
  { key: "audit", x: 91, y: 78, stage: 5, icon: ScrollText },
];

const EDGES: readonly (readonly [NodeKey, NodeKey])[] = [
  ["trigger", "zeus"],
  ["zeus", "atlas"],
  ["zeus", "poseidon"],
  ["atlas", "hermes"],
  ["poseidon", "hermes"],
  ["hermes", "approval"],
  ["approval", "send"],
  ["approval", "audit"],
];

/** The run pauses here until a person approves. */
const APPROVAL_STAGE = 4;
const LAST_STAGE = 5;
/** Log lines shown once each stage starts; the indexes point into `copy.log`. */
const STAGE_LOG: readonly (readonly number[])[] = [[0], [1], [2, 3], [4], [5], [6, 7]];
/** Who each log line belongs to. */
const LOG_AGENT: readonly (AgentKey | null)[] = [null, "zeus", "atlas", "poseidon", "hermes", null, null, null];
const STEP_MS = 1400;

const node = (key: NodeKey): FlowNode => {
  const found = NODES.find((n) => n.key === key);
  if (!found) throw new Error(`Unknown flow node: ${key}`);
  return found;
};

/** -1 = not started, 0..LAST_STAGE = that stage is working, LAST_STAGE + 1 = finished. */
type Stage = number;

function stateOf(n: FlowNode, stage: Stage): "idle" | "active" | "done" {
  if (stage > n.stage) return "done";
  return stage === n.stage ? "active" : "idle";
}

function NodeTile({ n, copy, stage }: { readonly n: FlowNode; readonly copy: Copy; readonly stage: Stage }) {
  const state = stateOf(n, stage);
  const agent = n.agent ? getAgent(n.agent) : null;
  const Icon = n.icon;
  const waiting = n.key === "approval" && state === "active";
  return (
    <div
      style={{ "--ring": waiting ? "var(--ix-warning)" : (agent?.accent ?? "var(--ix-brand)") } as CSSProperties}
      className={`relative flex w-full items-center gap-2 rounded-2xl border bg-surface p-2 text-start shadow-ix transition-[border-color,opacity,transform] duration-500 ${
        state === "idle" ? "border-line opacity-55" : "border-[var(--ring)]"
      } ${state === "active" ? "ix-node-active scale-[1.04]" : ""}`}
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
          {agent ? <span dir="ltr">{agent.name}</span> : copy.nodes[n.key].sub}
        </span>
        <span className="block text-[0.8rem] leading-tight font-bold text-balance">{copy.nodes[n.key].title}</span>
      </span>
      {state === "done" ? (
        <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-success text-white shadow-ix-sm">
          <Check className="size-3.5" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}

/** An n8n-style canvas that runs one customer message through the team, pausing for approval. */
export function FlowCanvas({ copy }: { readonly copy: Copy }) {
  const [stage, setStage] = useState<Stage>(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // Advance on a timer, except at the approval gate, which waits for the visitor.
  useEffect(() => {
    if (stage < 0 || stage > LAST_STAGE || stage === APPROVAL_STAGE) return;
    const timer = setTimeout(() => setStage((s) => s + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [stage]);

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

  const waiting = stage === APPROVAL_STAGE;
  const finished = stage > LAST_STAGE;
  const status = stage < 0 ? copy.status.idle : waiting ? copy.status.waiting : finished ? copy.status.done : copy.status.running;
  const lines = STAGE_LOG.slice(0, Math.max(0, Math.min(stage, LAST_STAGE) + 1)).flat();

  return (
    <div ref={rootRef} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="ix-glass-strong relative overflow-hidden rounded-ix-lg">
        <div className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-bold text-fg-soft">
            <span
              className={`size-2 rounded-full ${waiting ? "bg-warning" : finished ? "bg-success" : stage < 0 ? "bg-muted" : "ix-anim-pulse bg-brand"}`}
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
            {EDGES.map(([from, to]) => {
              const a = node(from);
              const b = node(to);
              const mid = (a.x + b.x) / 2;
              const d = `M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
              const state = stateOf(b, stage);
              return (
                <g key={`${from}-${to}`} fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke">
                  <path d={d} stroke="var(--ix-line-strong)" vectorEffect="non-scaling-stroke" />
                  {state === "idle" ? null : (
                    <path
                      key={stage < 0 ? "idle" : `run-${b.stage}`}
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
          {NODES.map((n) => (
            <div
              key={n.key}
              className="absolute w-[15%] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
              style={{ insetInlineStart: `${n.x}%`, top: `${n.y}%` }}
            >
              <NodeTile n={n} copy={copy} stage={stage} />
            </div>
          ))}
        </div>

        {/* Small screens: the same run as a vertical list. */}
        <ol className="space-y-2 p-4 lg:hidden">
          {NODES.map((n) => (
            <li key={n.key}>
              <NodeTile n={n} copy={copy} stage={stage} />
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
              const key = LOG_AGENT[index];
              return (
                <li key={index} className="ix-anim-in flex items-start gap-2.5 text-sm text-fg-soft">
                  {key ? (
                    <AgentAvatar agent={getAgent(key)} size="xs" className="mt-0.5" />
                  ) : (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand ms-2 me-2" />
                  )}
                  <span>{copy.log[index]}</span>
                </li>
              );
            })}
          </ol>
        )}
        {waiting ? (
          <div className="ix-anim-in mt-4 space-y-2 rounded-2xl border border-warning/50 bg-[color-mix(in_srgb,var(--ix-warning)_10%,transparent)] p-3">
            <p className="text-xs font-semibold text-fg-soft">{copy.approvalHint}</p>
            <button type="button" onClick={() => setStage(LAST_STAGE)} className={buttonClass("primary", "sm", "w-full")}>
              <ShieldCheck className="size-4" aria-hidden="true" />
              {copy.approve}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
