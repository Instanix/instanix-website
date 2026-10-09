import { directionOf } from "@ix/i18n";
import { themeInitScript } from "@ix/ui";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { getI18n } from "@/lib/locale";
import "./globals.css";

const latin = Inter({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.command.meta.title, template: `%s · ${t.command.meta.title}` },
    description: t.command.meta.description,
    // The customer app is private: keep it out of search indexes.
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#050b1a" },
  ],
};

export default async function RootLayout({ children }: { readonly children: ReactNode }) {
  const { locale, t } = await getI18n();
  return (
    // data-theme is set before paint by the inline script, so the server/client attribute differs by design.
    <html lang={locale} dir={directionOf(locale)} className={`${latin.variable} ${arabic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="ix-backdrop font-sans text-fg antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          {t.common.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
