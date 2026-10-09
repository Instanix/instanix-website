import type { AgentKey } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";
import { Building, Car, Settings2, Stethoscope, type LucideIcon } from "lucide-react";

export type IndustryKey = keyof Dictionary["web"]["industries"]["items"];
export type DemoScenarioKey = keyof Dictionary["web"]["demo"]["scenarios"];

export interface Industry {
  readonly key: IndustryKey;
  /** Public URL segment; changing it breaks inbound links. */
  readonly slug: string;
  readonly icon: LucideIcon;
  /** One agent per step of the industry's `flow` in the dictionaries, in the same order. */
  readonly flowAgents: readonly [AgentKey, AgentKey, AgentKey, AgentKey, AgentKey];
  /** The live-demo scenario shown on this industry's page, when there is one. */
  readonly demo?: DemoScenarioKey;
  /** Automotive is where Instanix has shipped work (SCANNO), so it carries the proof block. */
  readonly hasScannoProof?: boolean;
}

export const INDUSTRIES: readonly Industry[] = [
  {
    key: "automotive",
    slug: "car-showrooms",
    icon: Car,
    flowAgents: ["atlas", "poseidon", "zeus", "hermes", "oracle"],
    demo: "automotive",
    hasScannoProof: true,
  },
  { key: "realEstate", slug: "real-estate", icon: Building, flowAgents: ["atlas", "atlas", "hermes", "zeus", "oracle"], demo: "realEstate" },
  { key: "clinics", slug: "clinics", icon: Stethoscope, flowAgents: ["hermes", "zeus", "hermes", "hermes", "ares"], demo: "clinics" },
  { key: "operations", slug: "business-operations", icon: Settings2, flowAgents: ["zeus", "hephaestus", "midas", "hestia", "oracle"] },
];
