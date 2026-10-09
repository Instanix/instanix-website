import { otherLocale, type Dictionary, type Locale } from "@ix/i18n";
import { buttonClass, Logo } from "@ix/ui";
import { ThemeToggle } from "@ix/ui/client";
import { Globe } from "lucide-react";
import Link from "next/link";

export function siteLinks(locale: Locale, t: Dictionary): readonly { href: string; label: string }[] {
  const n = t.web.nav;
  return [
    { href: `/${locale}/services`, label: n.services },
    { href: `/${locale}/industries`, label: n.industries },
    { href: `/${locale}/agents`, label: n.team },
    { href: `/${locale}/work`, label: n.work },
    { href: `/${locale}/demo`, label: n.demo },
    { href: `/${locale}/platform`, label: n.platform },
  ];
}

/** `path` is the current page without the locale prefix, so the language switch stays on the same page. */
export function SiteHeader({ locale, t, path = "" }: { readonly locale: Locale; readonly t: Dictionary; readonly path?: string }) {
  const other = otherLocale(locale);
  const n = t.web.nav;

  return (
    <header className="sticky top-0 z-40 px-3 pt-4 sm:px-6">
      <div className="ix-header-bar mx-auto flex h-16 max-w-6xl items-center gap-3 rounded-full ps-5 pe-3">
        <Link href={`/${locale}`} aria-label={t.common.homeLink} className="rounded-lg">
          <Logo className="text-[0.95rem] sm:text-base" />
        </Link>

        <nav aria-label={t.common.primaryNav} className="ms-4 hidden items-center lg:flex">
          {siteLinks(locale, t).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-fg-soft transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--ix-brand)_12%,transparent)] hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Link
            href={`/${other}${path}`}
            hrefLang={other}
            lang={other}
            aria-label={t.common.switchLanguageLabel}
            className="ix-btn-glass inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-fg-soft transition-[border-color,background-color,color,transform] duration-300 hover:text-brand-text"
          >
            <Globe className="size-4" aria-hidden="true" />
            <span>{t.common.switchLanguage}</span>
          </Link>
          <ThemeToggle labels={{ useLight: t.common.useLightTheme, useDark: t.common.useDarkTheme }} />
          <Link href={`/${locale}/assessment`} className={buttonClass("primary", "sm", "h-10 max-sm:hidden")}>
            {n.assessment}
          </Link>
        </div>
      </div>
      {/* Small screens: the page links scroll horizontally under the bar. */}
      <nav aria-label={t.common.primaryNav} className="mx-auto mt-2 flex max-w-6xl gap-1 overflow-x-auto px-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        {siteLinks(locale, t).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="ix-glass shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-fg-soft"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
