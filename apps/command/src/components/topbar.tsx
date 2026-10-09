import { otherLocale, type Dictionary, type Locale } from "@ix/i18n";
import { Logo } from "@ix/ui";
import { ThemeToggle } from "@ix/ui/client";
import { Building2, ChevronsUpDown, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { setLocale } from "@/lib/actions";

export function Topbar({ locale, t }: { readonly locale: Locale; readonly t: Dictionary }) {
  const other = otherLocale(locale);
  const shell = t.command.shell;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-md sm:px-6">
      <Link href="/" aria-label={t.command.nav.command} className="rounded-lg lg:hidden">
        <Logo variant="mark" className="text-xl" />
      </Link>

      {/* Organization switcher: inert until auth + organizations exist (Phase 1). */}
      <button
        type="button"
        disabled
        title={shell.organizationHint}
        className="hidden h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-muted md:inline-flex"
      >
        <Building2 className="size-4" aria-hidden="true" />
        <span>{shell.noOrganization}</span>
        <ChevronsUpDown className="size-3.5" aria-hidden="true" />
      </button>

      {/* Global Ask IX entry: inert until the agent runtime exists (Phase 2–3). */}
      <div className="ix-glass relative flex h-10 min-w-0 flex-1 items-center rounded-xl md:max-w-xl">
        <Sparkles className="pointer-events-none absolute start-3 size-4 text-brand-text" aria-hidden="true" />
        <input
          type="search"
          disabled
          aria-label={shell.askPlaceholder}
          aria-describedby="ask-ix-hint"
          placeholder={shell.askPlaceholder}
          className="h-full w-full min-w-0 rounded-xl bg-transparent ps-9 pe-3 text-sm placeholder:text-muted disabled:cursor-not-allowed"
        />
        <span id="ask-ix-hint" className="sr-only">
          {shell.askUnavailable}
        </span>
      </div>

      <div className="ms-auto flex items-center gap-2">
        <form action={setLocale}>
          <input type="hidden" name="locale" value={other} />
          <button
            type="submit"
            lang={other}
            aria-label={t.common.switchLanguageLabel}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-fg-soft transition-colors hover:border-brand hover:text-brand-text"
          >
            <Globe className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t.common.switchLanguage}</span>
          </button>
        </form>
        <ThemeToggle labels={{ useLight: t.common.useLightTheme, useDark: t.common.useDarkTheme }} />
      </div>
    </header>
  );
}
