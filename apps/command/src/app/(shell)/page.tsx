import type { Dictionary } from "@ix/i18n";
import { Card, cn, EmptyState } from "@ix/ui";
import {
  Activity,
  CircleCheckBig,
  FolderKanban,
  Gauge,
  HeartPulse,
  Info,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getI18n } from "@/lib/locale";

type CardKey = keyof Dictionary["command"]["home"]["cards"];

/** Core cards from docs/04_UI_UX_DESIGN_SYSTEM.md (Command Home). */
const CARDS: readonly { key: CardKey; icon: LucideIcon; span: string }[] = [
  { key: "pulse", icon: HeartPulse, span: "lg:col-span-2" },
  { key: "approvals", icon: CircleCheckBig, span: "" },
  { key: "activity", icon: Activity, span: "" },
  { key: "pipeline", icon: TrendingUp, span: "" },
  { key: "projects", icon: FolderKanban, span: "" },
  { key: "usage", icon: Gauge, span: "" },
  { key: "health", icon: Users, span: "lg:col-span-2" },
];

export default async function CommandHome() {
  const { t } = await getI18n();
  const c = t.command;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{c.home.title}</h1>
        <p className="text-muted">{c.home.subtitle}</p>
      </header>

      {/* No workspace is connected in Phase 0, so the screen states that plainly instead of showing sample numbers. */}
      <div role="note" className="ix-glass flex gap-3 rounded-2xl p-4 shadow-ix-sm">
        <Info className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden="true" />
        <div className="space-y-0.5">
          <p className="text-sm font-bold">{c.preview.title}</p>
          <p className="text-sm text-muted">{c.preview.body}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ key, icon: Icon, span }) => (
          <Card key={key} className={cn("flex min-h-56 flex-col", span)}>
            <h2 className="flex items-center gap-2.5 border-b border-line px-5 py-4 text-sm font-bold">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-text">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {c.home.cards[key].title}
            </h2>
            <EmptyState className="flex-1" title={c.home.noData} body={c.home.cards[key].empty} />
          </Card>
        ))}
      </div>
    </div>
  );
}
