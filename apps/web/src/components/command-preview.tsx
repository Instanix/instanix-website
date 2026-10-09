import { AGENTS } from "@ix/agents";
import type { Dictionary } from "@ix/i18n";
import { AgentAvatar, Logo } from "@ix/ui";
import { Sparkles } from "lucide-react";

const NAV_KEYS = ["command", "team", "tasks", "approvals", "clients", "projects", "automations", "knowledge"] as const;

function Bar({ className }: { readonly className: string }) {
  return <span className={`block h-2 rounded-full bg-line ${className}`} />;
}

/**
 * Illustrative frame of the IX Command layout. It deliberately contains no
 * numbers or activity — only structure — so it cannot be read as real results.
 */
export function CommandPreview({ t }: { readonly t: Dictionary }) {
  const c = t.web.command;
  return (
    <figure className="space-y-3">
      <div
        role="img"
        aria-label={c.previewLabel}
        className="overflow-hidden rounded-ix-lg border border-line-strong bg-surface shadow-ix-lg ring-8 ring-fg/5"
      >
        <div aria-hidden="true" className="flex">
          <div className="hidden w-40 shrink-0 space-y-4 border-e border-line bg-surface-2/60 p-3 sm:block">
            <Logo className="text-xs" />
            <ul className="space-y-1">
              {NAV_KEYS.map((key, i) => (
                <li
                  key={key}
                  className={`rounded-lg px-2.5 py-1.5 text-[0.7rem] font-semibold ${i === 0 ? "bg-primary text-on-primary" : "text-fg-soft"}`}
                >
                  {t.command.nav[key]}
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 flex-1 space-y-4 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 px-3 py-2 text-xs text-muted">
              <Sparkles className="size-3.5 text-brand-text" />
              {c.ask}
            </div>
            <p className="text-base font-extrabold tracking-tight">{c.greeting}</p>
            <div className="space-y-2 rounded-xl border border-line p-3">
              <p className="text-xs font-bold">{c.teamStatus}</p>
              <ul className="grid grid-cols-6 gap-2 lg:grid-cols-12">
                {AGENTS.map((agent) => (
                  <li key={agent.key} className="flex flex-col items-center gap-1">
                    <AgentAvatar agent={agent} size="sm" className="size-9" />
                    <span dir="ltr" className="max-w-full truncate text-[0.55rem] font-bold tracking-wide text-fg-soft">
                      {agent.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="grid gap-3 sm:grid-cols-3">
              {c.cards.map((card, i) => (
                <li key={card} className="space-y-3 rounded-xl border border-line p-3">
                  <p className="text-xs font-bold">{card}</p>
                  <Bar className={i === 0 ? "w-3/4" : "w-full"} />
                  <Bar className="w-2/3" />
                  <Bar className={i === 2 ? "w-5/6" : "w-1/2"} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <figcaption className="text-center text-xs text-muted">{c.previewNote}</figcaption>
    </figure>
  );
}
