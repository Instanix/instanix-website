import type { AgentKey } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";
import type { DemoScenarioKey } from "./industries";

export type CrmField = keyof Dictionary["web"]["demo"]["fields"];

/**
 * One beat of the scripted demo. The text for each beat is the line at the same
 * index in `demo.scenarios[scenario].lines`, so the script and the copy must stay
 * the same length (checked by `assertDemoScripts`).
 */
export type DemoStep =
  | { readonly kind: "customer" }
  | { readonly kind: "agent" }
  | { readonly kind: "event"; readonly agent: AgentKey }
  | { readonly kind: "crm"; readonly field: CrmField };

const customer: DemoStep = { kind: "customer" };
const agent: DemoStep = { kind: "agent" };
const event = (key: AgentKey): DemoStep => ({ kind: "event", agent: key });
const crm = (field: CrmField): DemoStep => ({ kind: "crm", field });

export const DEMO_SCRIPTS: Record<DemoScenarioKey, readonly DemoStep[]> = {
  automotive: [
    customer,
    event("atlas"),
    crm("source"),
    crm("need"),
    event("poseidon"),
    agent,
    customer,
    event("atlas"),
    crm("details"),
    agent,
    customer,
    event("zeus"),
    crm("booking"),
    event("hermes"),
    agent,
    crm("status"),
  ],
  inspection: [
    customer,
    event("atlas"),
    crm("source"),
    crm("need"),
    agent,
    customer,
    event("zeus"),
    crm("booking"),
    agent,
    crm("details"),
    event("oracle"),
    event("hermes"),
    agent,
    crm("status"),
  ],
  realEstate: [
    customer,
    event("atlas"),
    crm("source"),
    crm("need"),
    agent,
    customer,
    event("atlas"),
    crm("details"),
    event("poseidon"),
    agent,
    customer,
    event("zeus"),
    crm("booking"),
    event("hermes"),
    agent,
    crm("status"),
  ],
  clinics: [
    customer,
    event("zeus"),
    crm("source"),
    crm("need"),
    agent,
    customer,
    event("zeus"),
    crm("booking"),
    agent,
    customer,
    crm("details"),
    event("hermes"),
    agent,
    crm("status"),
  ],
};

export const DEMO_SCENARIOS = Object.keys(DEMO_SCRIPTS) as DemoScenarioKey[];

/** Fails the build if a translation's lines drift out of step with the script. */
export function assertDemoScripts(scenarios: Dictionary["web"]["demo"]["scenarios"]): void {
  for (const key of DEMO_SCENARIOS) {
    if (scenarios[key].lines.length !== DEMO_SCRIPTS[key].length) {
      throw new Error(`Demo scenario "${key}" has ${scenarios[key].lines.length} lines but ${DEMO_SCRIPTS[key].length} script steps`);
    }
  }
}
