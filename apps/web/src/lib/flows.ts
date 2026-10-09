import type { AgentKey } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";
import {
  BellRing,
  Camera,
  FileText,
  Gauge,
  Megaphone,
  MessageCircle,
  ScrollText,
  Send,
  ShieldCheck,
  Timer,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export type FlowKey = keyof Dictionary["web"]["flow"]["scenarios"];

export interface FlowNode {
  /** Matches a key under `flow.scenarios[flow].nodes` in the dictionaries. */
  readonly key: string;
  /** Center of the node on the canvas, in percent. */
  readonly x: number;
  readonly y: number;
  /** The stage of the run in which this node works. */
  readonly stage: number;
  readonly agent?: AgentKey;
  readonly icon?: LucideIcon;
}

export interface FlowDefinition {
  readonly nodes: readonly FlowNode[];
  readonly edges: readonly (readonly [string, string])[];
  /** Log lines shown when each stage starts; the indexes point into the scenario's `log`. */
  readonly stageLog: readonly (readonly number[])[];
  /** Who each log line belongs to, by log index. */
  readonly logAgents: readonly (AgentKey | null)[];
  /** When set, the run pauses at this stage until a person approves. */
  readonly approvalStage?: number;
}

/** Columns of the six-step canvas shared by the straight-through workflows. */
const COLUMNS = [9, 26, 43, 60, 77, 93] as const;

/** One trigger, one step, two parallel steps, then three steps in a row. */
function straightThrough(
  nodes: readonly [FlowNode["key"], AgentKey | LucideIcon][],
  logAgents: readonly (AgentKey | null)[],
): FlowDefinition {
  const place: readonly (readonly [number, number, number])[] = [
    [COLUMNS[0], 50, 0],
    [COLUMNS[1], 50, 1],
    [COLUMNS[2], 22, 2],
    [COLUMNS[2], 78, 2],
    [COLUMNS[3], 50, 3],
    [COLUMNS[4], 50, 4],
    [COLUMNS[5], 50, 5],
  ];
  const built = nodes.map(([key, actor], index): FlowNode => {
    const [x, y, stage] = place[index] ?? [50, 50, 0];
    return typeof actor === "string" ? { key, x, y, stage, agent: actor } : { key, x, y, stage, icon: actor };
  });
  const k = built.map((n) => n.key) as [string, string, string, string, string, string, string];
  return {
    nodes: built,
    edges: [
      [k[0], k[1]],
      [k[1], k[2]],
      [k[1], k[3]],
      [k[2], k[4]],
      [k[3], k[4]],
      [k[4], k[5]],
      [k[5], k[6]],
    ],
    stageLog: [[0], [1], [2, 3], [4], [5], [6]],
    logAgents,
  };
}

export const FLOWS: Record<FlowKey, FlowDefinition> = {
  sales: {
    nodes: [
      { key: "trigger", x: 9, y: 50, stage: 0, icon: MessageCircle },
      { key: "zeus", x: 25.5, y: 50, stage: 1, agent: "zeus" },
      { key: "atlas", x: 42, y: 22, stage: 2, agent: "atlas" },
      { key: "poseidon", x: 42, y: 78, stage: 2, agent: "poseidon" },
      { key: "hermes", x: 58.5, y: 50, stage: 3, agent: "hermes" },
      { key: "approval", x: 75, y: 50, stage: 4, icon: ShieldCheck },
      { key: "send", x: 91, y: 22, stage: 5, icon: Send },
      { key: "audit", x: 91, y: 78, stage: 5, icon: ScrollText },
    ],
    edges: [
      ["trigger", "zeus"],
      ["zeus", "atlas"],
      ["zeus", "poseidon"],
      ["atlas", "hermes"],
      ["poseidon", "hermes"],
      ["hermes", "approval"],
      ["approval", "send"],
      ["approval", "audit"],
    ],
    stageLog: [[0], [1], [2, 3], [4], [5], [6, 7]],
    logAgents: [null, "zeus", "atlas", "poseidon", "hermes", null, null, null],
    approvalStage: 4,
  },
  inspection: straightThrough(
    [
      ["vin", Camera],
      ["decode", "poseidon"],
      ["history", "athena"],
      ["obd", Gauge],
      ["analyze", "oracle"],
      ["report", FileText],
      ["send", "hermes"],
    ],
    [null, "poseidon", "athena", null, "oracle", null, "hermes"],
  ),
  dental: straightThrough(
    [
      ["message", MessageCircle],
      ["zeus", "zeus"],
      ["file", "atlas"],
      ["booking", "hermes"],
      ["lab", "hephaestus"],
      ["track", Timer],
      ["fitting", BellRing],
    ],
    [null, "zeus", "atlas", "hermes", "hephaestus", null, null],
  ),
  forex: straightThrough(
    [
      ["lead", Megaphone],
      ["score", "atlas"],
      ["checks", "themis"],
      ["profile", "athena"],
      ["welcome", "hermes"],
      ["route", UserCheck],
      ["dashboard", "oracle"],
    ],
    [null, "atlas", "themis", "athena", "hermes", null, "oracle"],
  ),
};

export const FLOW_KEYS = Object.keys(FLOWS) as FlowKey[];

export interface FlowNodeCopy {
  readonly title: string;
  readonly sub: string;
}

/** A scenario's node copy, addressed by node key. */
export function flowNodeCopy(copy: Dictionary["web"]["flow"], flow: FlowKey): Readonly<Record<string, FlowNodeCopy>> {
  return copy.scenarios[flow].nodes;
}

/** Fails the build if a translation drifts out of step with a workflow's definition. */
export function assertFlows(copy: Dictionary["web"]["flow"]): void {
  for (const key of FLOW_KEYS) {
    const definition = FLOWS[key];
    const nodes = flowNodeCopy(copy, key);
    for (const node of definition.nodes) {
      if (!nodes[node.key]) throw new Error(`Workflow "${key}" has no copy for node "${node.key}"`);
    }
    const lines = copy.scenarios[key].log.length;
    if (lines !== definition.logAgents.length || lines !== definition.stageLog.flat().length) {
      throw new Error(`Workflow "${key}" has ${lines} log lines but its definition expects ${definition.logAgents.length}`);
    }
  }
}
