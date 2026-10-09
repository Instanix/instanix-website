import type { AgentKey } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";
import {
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  CircleDollarSign,
  FileText,
  Headset,
  Plug,
  Settings2,
  TrendingUp,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  siAirtable,
  siClaude,
  siGmail,
  siGoogle,
  siGooglegemini,
  siGooglesheets,
  siHubspot,
  siMake,
  siMistralai,
  siN8n,
  siNotion,
  siOdoo,
  siSupabase,
  siTelegram,
  siWhatsapp,
  siZapier,
  siZoho,
  type SimpleIcon,
} from "simple-icons";

export type SolutionKey = keyof Dictionary["web"]["solutions"]["items"];
export type ServiceKey = keyof Dictionary["web"]["servicesPage"]["items"];
export type GoalKey = keyof Dictionary["web"]["build"]["goals"];
export type ToolCategoryKey = keyof Dictionary["web"]["integrationsPage"]["categories"];

/** The four services Instanix sells. `slug` is the public URL segment, so it never changes casually. */
export const SERVICES: readonly { key: ServiceKey; slug: string; icon: LucideIcon; agents: readonly AgentKey[] }[] = [
  { key: "automation", slug: "business-automation", icon: Workflow, agents: ["zeus", "hephaestus"] },
  { key: "agents", slug: "ai-agents", icon: Bot, agents: ["zeus", "atlas", "hermes"] },
  { key: "systems", slug: "business-systems", icon: Building2, agents: ["apollo", "midas"] },
  { key: "integrations", slug: "system-integration", icon: Plug, agents: ["hephaestus", "poseidon"] },
];

/** Which agents staff each solution. */
export const SOLUTIONS: readonly { key: SolutionKey; icon: LucideIcon; agents: readonly AgentKey[] }[] = [
  { key: "sales", icon: TrendingUp, agents: ["zeus", "atlas", "hermes"] },
  { key: "support", icon: Headset, agents: ["athena", "hermes"] },
  { key: "operations", icon: Settings2, agents: ["zeus", "hephaestus"] },
  { key: "finance", icon: CircleDollarSign, agents: ["midas", "themis"] },
  { key: "legal", icon: FileText, agents: ["themis", "zeus"] },
  { key: "people", icon: Users, agents: ["hestia", "apollo"] },
  { key: "knowledge", icon: BookOpen, agents: ["poseidon", "athena"] },
  { key: "analytics", icon: BarChart3, agents: ["oracle", "poseidon"] },
];

export const GOALS: readonly { key: GoalKey; agents: readonly AgentKey[] }[] = [
  { key: "sales", agents: ["zeus", "atlas", "hermes"] },
  { key: "support", agents: ["zeus", "athena", "hermes"] },
  { key: "finance", agents: ["zeus", "midas", "themis"] },
  { key: "contracts", agents: ["zeus", "themis", "hermes"] },
  { key: "operations", agents: ["zeus", "hephaestus", "hestia"] },
  { key: "knowledge", agents: ["zeus", "poseidon", "athena"] },
];

/**
 * Tools IX is designed to work with. Marks come from the Simple Icons set;
 * vendors that are not in that set (OpenAI, Slack, Microsoft) are shown by
 * name until official logo files from their brand kits are added.
 */
export interface Tool {
  readonly name: string;
  readonly icon?: SimpleIcon;
}

export const TOOL_CATEGORIES: readonly { key: ToolCategoryKey; tools: readonly Tool[] }[] = [
  {
    key: "automation",
    tools: [
      { name: "n8n", icon: siN8n },
      { name: "Make", icon: siMake },
      { name: "Zapier", icon: siZapier },
    ],
  },
  {
    key: "models",
    tools: [{ name: "OpenAI" }, { name: "Claude", icon: siClaude }, { name: "Gemini", icon: siGooglegemini }, { name: "Mistral AI", icon: siMistralai }],
  },
  {
    key: "data",
    tools: [
      { name: "Notion", icon: siNotion },
      { name: "Airtable", icon: siAirtable },
      { name: "Supabase", icon: siSupabase },
      { name: "Google Sheets", icon: siGooglesheets },
    ],
  },
  {
    key: "messaging",
    tools: [{ name: "WhatsApp", icon: siWhatsapp }, { name: "Telegram", icon: siTelegram }, { name: "Gmail", icon: siGmail }, { name: "Slack" }],
  },
  {
    key: "business",
    tools: [
      { name: "HubSpot", icon: siHubspot },
      { name: "Odoo", icon: siOdoo },
      { name: "Zoho", icon: siZoho },
      { name: "Google Workspace", icon: siGoogle },
      { name: "Microsoft 365" },
    ],
  },
];

/** The short strip on the home page. */
export const FEATURED_TOOLS: readonly Tool[] = [
  { name: "n8n", icon: siN8n },
  { name: "Make", icon: siMake },
  { name: "Zapier", icon: siZapier },
  { name: "OpenAI" },
  { name: "Claude", icon: siClaude },
  { name: "Gemini", icon: siGooglegemini },
  { name: "Notion", icon: siNotion },
  { name: "Airtable", icon: siAirtable },
  { name: "Supabase", icon: siSupabase },
  { name: "WhatsApp", icon: siWhatsapp },
];
