import { getAgent, type AgentDefinition, type AgentKey } from "@ix/agents";
import type { Dictionary, Locale } from "@ix/i18n";
import { AgentAvatar, AgentFigure, Card } from "@ix/ui";
import {
  ArrowRight,
  Database,
  Fingerprint,
  KeyRound,
  Network,
  ScrollText,
  ShieldCheck,
  Target,
  Timer,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { SOLUTIONS, type SolutionKey, type Tool } from "@/lib/catalog";

const HOW_ICONS: readonly LucideIcon[] = [Target, Network, Users, Database, UserCheck, ScrollText];
const GUARD_ICONS: readonly LucideIcon[] = [UserCheck, Fingerprint, Users, ScrollText, KeyRound, Timer];

/** Dark, accent-lit agent card that links to the agent's page. Sized by its container. */
export function AgentCard({
  agent,
  locale,
  t,
  className = "",
}: {
  readonly agent: AgentDefinition;
  readonly locale: Locale;
  readonly t: Dictionary;
  readonly className?: string;
}) {
  return (
    <Link
      href={`/${locale}/agents/${agent.key}`}
      style={{ "--agent": agent.accent } as CSSProperties}
      className={`group relative block aspect-[3/4] overflow-hidden rounded-ix-lg bg-[linear-gradient(165deg,color-mix(in_srgb,var(--agent)_80%,#0b1d42),#0b1d42_60%,#040b1c)] shadow-ix-lg ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1.5 ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-[10%] top-[8%] aspect-square rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--agent)_70%,white),transparent_68%)] opacity-60 blur-2xl"
      />
      <div className="absolute inset-x-0 top-[7%] flex h-[150%] justify-center transition-transform duration-500 group-hover:scale-105">
        <AgentFigure agent={agent} className="drop-shadow-[0_10px_24px_rgb(0_0_0/0.45)]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-[linear-gradient(180deg,transparent,#040b1c_45%)] px-4 pt-14 pb-4 text-white">
        <div className="min-w-0">
          <p className="font-mono text-[0.7rem] font-semibold text-white/70">
            <bdi dir="ltr">{agent.id}</bdi>
          </p>
          <h3 className="text-lg font-extrabold tracking-wide">
            <bdi dir="ltr">{agent.name}</bdi>
          </h3>
          <p className="text-xs text-white/80">{t.agents[agent.key].role}</p>
        </div>
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition-colors group-hover:bg-primary"
        >
          <ArrowRight className="size-4 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );
}

/** Overlapping avatars plus names, e.g. "ZEUS + ATLAS + HERMES". */
export function AgentStack({ agents }: { readonly agents: readonly AgentKey[] }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2 rtl:space-x-reverse">
        {agents.map((key) => (
          <AgentAvatar key={key} agent={getAgent(key)} size="sm" className="ring-2 ring-surface" />
        ))}
      </div>
      <p dir="ltr" className="text-[0.7rem] font-bold tracking-wide text-fg-soft">
        {agents.map((key) => getAgent(key).name).join(" + ")}
      </p>
    </div>
  );
}

export function SolutionCard({ solutionKey, t }: { readonly solutionKey: SolutionKey; readonly t: Dictionary }) {
  const solution = SOLUTIONS.find((s) => s.key === solutionKey);
  if (!solution) return null;
  const copy = t.web.solutions.items[solutionKey];
  const Icon = solution.icon;
  return (
    <Card className="flex h-full flex-col gap-3 p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-ix-lg">
      <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-text">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="font-bold">{copy.title}</h3>
      <p className="text-sm text-muted">{copy.body}</p>
      <div className="mt-auto pt-2">
        <AgentStack agents={solution.agents} />
      </div>
    </Card>
  );
}

/** The dark "From Tasks to Results" band. Stays dark in both themes. */
export function HowBand({ t, action }: { readonly t: Dictionary; readonly action?: ReactNode }) {
  const h = t.web.how;
  return (
    <div className="relative overflow-hidden rounded-ix-lg bg-[linear-gradient(120deg,var(--ix-ink),var(--ix-ink-2)_55%,#0a3a8c)] p-8 text-on-ink shadow-ix-lg sm:p-10 lg:p-12">
      <div aria-hidden="true" className="absolute -end-20 -top-24 size-96 rounded-full bg-brand/30 blur-3xl" />
      <div aria-hidden="true" className="ix-grid-lines absolute inset-0 opacity-40" />
      <div className="relative grid gap-10 lg:grid-cols-[17rem_1fr] lg:items-center">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-ink-line px-3 py-1 text-xs font-bold tracking-widest uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-cyan" />
            {h.eyebrow}
          </p>
          <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            <span className="block">{h.line1}</span>
            <span className="block text-[#5cc4ff]">{h.accent}</span>
          </h2>
          <p className="text-on-ink-muted">{h.body}</p>
          {action}
        </div>
        <ol className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 xl:grid-cols-6">
          {h.steps.map((step, i) => {
            const Icon = HOW_ICONS[i] ?? Target;
            const approval = i === 4;
            return (
              <li key={step.title} className="relative flex flex-col items-center gap-3 text-center">
                {i > 0 ? (
                  <ArrowRight
                    aria-hidden="true"
                    className="absolute -start-3 top-6 hidden size-4 -translate-x-1/2 text-[#5cc4ff] xl:block rtl:translate-x-1/2 rtl:rotate-180"
                  />
                ) : null}
                <span
                  className={`grid size-16 place-items-center rounded-full border-2 bg-white/5 ${approval ? "border-[#ff7b8a] text-[#ff9aa6] shadow-[0_0_28px_rgb(255_90_110/0.45)]" : "border-[#5cc4ff] text-[#8ad6ff] shadow-[0_0_28px_rgb(0_145_255/0.45)]"}`}
                >
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <span className="space-y-1">
                  <span className="block text-sm font-bold">{step.title}</span>
                  <span className="block text-xs text-on-ink-muted">{step.body}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function GuardGrid({ t }: { readonly t: Dictionary }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {t.web.guard.items.map((item, i) => {
        const Icon = GUARD_ICONS[i] ?? ShieldCheck;
        return (
          <li key={item.title}>
            <Card className="h-full space-y-3 p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-text">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-muted">{item.body}</p>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

/** Near-black brand marks follow the text color so they stay visible in dark mode. */
function markColor(hex: string): string {
  const value = Number.parseInt(hex, 16);
  const brightest = Math.max((value >> 16) & 255, (value >> 8) & 255, value & 255);
  return brightest < 48 ? "currentColor" : `#${hex}`;
}

export function ToolMark({ tool, size = "sm" }: { readonly tool: Tool; readonly size?: "sm" | "lg" }) {
  const large = size === "lg";
  return (
    <span dir="ltr" className={`flex items-center font-bold whitespace-nowrap text-fg ${large ? "gap-3 text-base" : "gap-1.5 text-sm"}`}>
      {tool.icon ? (
        <svg viewBox="0 0 24 24" className={`shrink-0 ${large ? "size-7" : "size-5"}`} aria-hidden="true" fill={markColor(tool.icon.hex)}>
          <path d={tool.icon.path} />
        </svg>
      ) : large ? (
        <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-extrabold text-fg-soft">
          {tool.name.charAt(0)}
        </span>
      ) : null}
      {tool.name}
    </span>
  );
}
