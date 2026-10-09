"use client";

import { cn } from "@ix/ui";
import {
  BarChart3,
  BookOpen,
  Building2,
  CircleCheckBig,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  ListTodo,
  Plug,
  Settings,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./i18n-provider";

type NavKey = keyof ReturnType<typeof useI18n>["t"]["command"]["nav"];

const PRIMARY: readonly { key: NavKey; href: string; icon: LucideIcon }[] = [
  { key: "command", href: "/", icon: LayoutDashboard },
  { key: "team", href: "/team", icon: Users },
  { key: "tasks", href: "/tasks", icon: ListTodo },
  { key: "approvals", href: "/approvals", icon: CircleCheckBig },
  { key: "clients", href: "/clients", icon: Building2 },
  { key: "projects", href: "/projects", icon: FolderKanban },
  { key: "automations", href: "/automations", icon: Workflow },
  { key: "knowledge", href: "/knowledge", icon: BookOpen },
  { key: "integrations", href: "/integrations", icon: Plug },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "usage", href: "/usage", icon: Gauge },
  { key: "settings", href: "/settings", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SideNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav aria-label={t.common.primaryNav} className="flex flex-col gap-1">
      {PRIMARY.map(({ key, href, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-on-primary shadow-ix-glow" : "text-fg-soft hover:bg-surface-2 hover:text-fg",
            )}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{t.command.nav[key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile is action-first: Pulse, Approvals, Ask IX, Clients, Agents. */
export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const m = t.command.mobileNav;
  const tabs = [
    { href: "/", label: m.pulse, icon: LayoutDashboard },
    { href: "/approvals", label: m.approvals, icon: CircleCheckBig },
    null,
    { href: "/clients", label: m.clients, icon: Building2 },
    { href: "/team", label: m.agents, icon: Users },
  ] as const;

  return (
    <nav
      aria-label={m.label}
      className="ix-glass fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 items-end rounded-2xl px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-ix-lg lg:hidden"
    >
      {tabs.map((tab) =>
        tab === null ? (
          // Ask IX has no runtime behind it yet, so it is visibly and semantically disabled.
          <button
            key="ask"
            type="button"
            disabled
            title={t.command.shell.askUnavailable}
            className="flex flex-col items-center gap-1 pb-1 text-[0.7rem] font-semibold text-muted"
          >
            <span className="-mt-6 grid size-12 place-items-center rounded-full bg-primary text-on-primary opacity-60 shadow-ix-glow">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            {m.ask}
          </button>
        ) : (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive(pathname, tab.href) ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl py-1.5 text-[0.7rem] font-semibold transition-colors",
              isActive(pathname, tab.href) ? "text-brand-text" : "text-muted hover:text-fg",
            )}
          >
            <tab.icon className="size-5" aria-hidden="true" />
            <span className="max-w-full truncate px-1">{tab.label}</span>
          </Link>
        ),
      )}
    </nav>
  );
}
