import type { AgentKey } from "@ix/agents";
import type { ArtifactKind } from "@/components/agent-workbench";

/**
 * How each agent's sample task is shown on its page. The task text lives in the
 * dictionaries (`agentsPage.work.items`). `approval` marks work that must end with a
 * person's decision: money, access, and messages to customers.
 */
export const AGENT_WORK: Record<AgentKey, { readonly kind: ArtifactKind; readonly approval: boolean }> = {
  zeus: { kind: "list", approval: false },
  athena: { kind: "sheet", approval: false },
  hephaestus: { kind: "list", approval: false },
  poseidon: { kind: "sheet", approval: false },
  ares: { kind: "list", approval: true },
  hermes: { kind: "message", approval: true },
  apollo: { kind: "list", approval: false },
  midas: { kind: "sheet", approval: true },
  themis: { kind: "list", approval: false },
  atlas: { kind: "sheet", approval: false },
  oracle: { kind: "sheet", approval: false },
  hestia: { kind: "list", approval: false },
};
