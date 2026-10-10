import type { AgentKey } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";

export type DepartmentKey = keyof Dictionary["web"]["office"]["departments"];

export interface Department {
  readonly key: DepartmentKey;
  /** Center of the platform on the office floor, in the 1000 by 640 drawing space. */
  readonly x: number;
  readonly y: number;
  readonly color: `#${string}`;
  readonly agents: readonly AgentKey[];
}

/** The floor is drawn in this space and scaled to its container. */
export const FLOOR = { width: 1000, height: 640 } as const;
/** ZEUS and the IX mark sit in the middle; every route starts here. */
export const HUB = { x: 500, y: 330 } as const;

/** Six departments around the hub. Colors echo the agents who work there. */
export const DEPARTMENTS: readonly Department[] = [
  { key: "sales", x: 235, y: 165, color: "#4F46E5", agents: ["atlas", "hermes"] },
  { key: "support", x: 765, y: 165, color: "#14B8A6", agents: ["poseidon", "athena"] },
  { key: "finance", x: 140, y: 355, color: "#EAB308", agents: ["midas", "oracle"] },
  { key: "legal", x: 860, y: 355, color: "#E5484D", agents: ["themis", "ares"] },
  { key: "operations", x: 250, y: 540, color: "#F5A524", agents: ["hephaestus", "hestia"] },
  { key: "product", x: 750, y: 540, color: "#A855F7", agents: ["apollo"] },
];

export interface OfficeTask {
  /** Index into `office.tasks` in the dictionaries. */
  readonly text: number;
  readonly agent: AgentKey;
  /** Sensitive work stops at an approval the visitor gives. */
  readonly approval: boolean;
}

/** The sample workload, in the same order as `office.tasks` in the dictionaries. */
export const OFFICE_TASKS: readonly OfficeTask[] = [
  { text: 0, agent: "zeus", approval: false },
  { text: 1, agent: "atlas", approval: false },
  { text: 2, agent: "hermes", approval: true },
  { text: 3, agent: "poseidon", approval: false },
  { text: 4, agent: "athena", approval: false },
  { text: 5, agent: "midas", approval: true },
  { text: 6, agent: "oracle", approval: false },
  { text: 7, agent: "themis", approval: false },
  { text: 8, agent: "ares", approval: true },
  { text: 9, agent: "hephaestus", approval: false },
  { text: 10, agent: "hestia", approval: false },
  { text: 11, agent: "apollo", approval: false },
];

export function departmentOf(agent: AgentKey): Department | null {
  return DEPARTMENTS.find((department) => department.agents.includes(agent)) ?? null;
}

/** Fails the build if the task copy drifts out of step with the workload. */
export function assertOffice(copy: Dictionary["web"]["office"]): void {
  if (copy.tasks.length !== OFFICE_TASKS.length) {
    throw new Error(`The office has ${OFFICE_TASKS.length} tasks but the dictionary has ${copy.tasks.length} lines`);
  }
}
