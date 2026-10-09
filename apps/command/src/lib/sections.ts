import type { Dictionary } from "@ix/i18n";

/** Primary navigation destinations that are not built yet (docs/04_UI_UX_DESIGN_SYSTEM.md, SaaS Shell). */
export const SECTION_KEYS = [
  "tasks",
  "approvals",
  "clients",
  "projects",
  "automations",
  "knowledge",
  "integrations",
  "analytics",
  "usage",
  "settings",
] as const satisfies readonly (keyof Dictionary["command"]["sections"])[];

export type SectionKey = (typeof SECTION_KEYS)[number];

export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}
