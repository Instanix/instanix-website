/**
 * Canonical IX Team (docs/00_MASTER_BLUEPRINT.md §3).
 * IDs, names and order are brand IP — do not rename or renumber.
 * `accent` identifies the role in UI; Instanix itself stays blue.
 */
export const AGENT_KEYS = [
  "zeus",
  "athena",
  "hephaestus",
  "poseidon",
  "ares",
  "hermes",
  "apollo",
  "midas",
  "themis",
  "atlas",
  "oracle",
  "hestia",
] as const;

export type AgentKey = (typeof AGENT_KEYS)[number];

/** Roadmap availability: "mvp" agents ship in the sales vertical slice (Phase 4). */
export type AgentAvailability = "mvp" | "planned";

/** Lifecycle states from docs/04_UI_UX_DESIGN_SYSTEM.md (Agent Experience). */
export const AGENT_STATES = ["offline", "configuring", "ready", "active", "needs_attention"] as const;
export type AgentState = (typeof AGENT_STATES)[number];

export interface AgentDefinition {
  readonly key: AgentKey;
  readonly id: `IX-${string}`;
  readonly name: string;
  readonly accent: `#${string}`;
  readonly availability: AgentAvailability;
}

export const AGENTS: readonly AgentDefinition[] = [
  { key: "zeus", id: "IX-001", name: "ZEUS", accent: "#0091FF", availability: "mvp" },
  { key: "athena", id: "IX-002", name: "ATHENA", accent: "#22C7E8", availability: "planned" },
  { key: "hephaestus", id: "IX-003", name: "HEPHAESTUS", accent: "#F5A524", availability: "planned" },
  { key: "poseidon", id: "IX-004", name: "POSEIDON", accent: "#14B8A6", availability: "planned" },
  { key: "ares", id: "IX-005", name: "ARES", accent: "#E5484D", availability: "planned" },
  { key: "hermes", id: "IX-006", name: "HERMES", accent: "#A855F7", availability: "mvp" },
  { key: "apollo", id: "IX-007", name: "APOLLO", accent: "#F5B301", availability: "planned" },
  { key: "midas", id: "IX-008", name: "MIDAS", accent: "#EAB308", availability: "planned" },
  { key: "themis", id: "IX-009", name: "THEMIS", accent: "#E8A33A", availability: "planned" },
  { key: "atlas", id: "IX-010", name: "ATLAS", accent: "#4F46E5", availability: "mvp" },
  { key: "oracle", id: "IX-011", name: "ORACLE", accent: "#F43F5E", availability: "planned" },
  { key: "hestia", id: "IX-012", name: "HESTIA", accent: "#22C55E", availability: "planned" },
];

export function isAgentKey(value: unknown): value is AgentKey {
  return typeof value === "string" && (AGENT_KEYS as readonly string[]).includes(value);
}

export function getAgent(key: AgentKey): AgentDefinition {
  const agent = AGENTS.find((a) => a.key === key);
  if (!agent) throw new Error(`Unknown agent key: ${key}`);
  return agent;
}
