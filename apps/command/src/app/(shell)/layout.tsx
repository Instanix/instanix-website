import { Logo } from "@ix/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import { I18nProvider } from "@/components/i18n-provider";
import { MobileNav, SideNav } from "@/components/nav";
import { Topbar } from "@/components/topbar";
import { getI18n } from "@/lib/locale";

export default async function ShellLayout({ children }: { readonly children: ReactNode }) {
  const { locale, t } = await getI18n();
  return (
    <I18nProvider value={{ locale, t }}>
      <div className="flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 overflow-y-auto border-e border-line bg-surface/70 p-4 lg:flex">
          <Link href="/" aria-label={t.command.nav.command} className="rounded-lg px-2 pt-1">
            <Logo className="text-lg" />
          </Link>
          <SideNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar locale={locale} t={t} />
          {/* Bottom padding clears the mobile tab bar. */}
          <main id="main" className="mx-auto w-full max-w-[90rem] flex-1 px-4 pt-6 pb-28 sm:px-6 lg:pb-10">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </I18nProvider>
  );
}
