import { directionOf, getDictionary, isLocale, LOCALES } from "@ix/i18n";
import { themeInitScript } from "@ix/ui";
import type { Metadata, Viewport } from "next";
import { Alexandria, Inter, Readex_Pro } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/env";
import { alternatesFor } from "@/lib/page";
import "../globals.css";

const latin = Inter({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
// Arabic: Readex Pro for text (built for reading), Alexandria for headings.
const arabic = Readex_Pro({ subsets: ["arabic"], variable: "--font-arabic", display: "swap" });
const arabicDisplay = Alexandria({ subsets: ["arabic"], variable: "--font-arabic-display", display: "swap" });

interface Props {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
}

/** Only facts the owner has confirmed. No phone, street address, ratings or client claims. */
function organizationJsonLd(description: string, locale: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Instanix",
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        description,
        foundingDate: "2025",
        email: "info@instanix.ae",
        address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
        founder: { "@type": "Person", "@id": `${SITE_URL}/#founder`, name: "Amir Diab" },
        areaServed: ["AE", "QA", "SA", "KW", "BH", "OM", "EG"],
        knowsAbout: ["AI agents", "Business process automation", "Workflow automation", "CRM", "ERP", "Business applications"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Instanix",
        inLanguage: locale,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).web.meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: t.title,
    description: t.description,
    alternates: alternatesFor(locale, ""),
    openGraph: {
      type: "website",
      siteName: "Instanix",
      title: t.title,
      description: t.description,
      locale: locale === "ar" ? "ar_AE" : "en_AE",
      images: [{ url: "/hero-cover.webp", width: 1672, height: 941, alt: getDictionary(locale).web.hero.imageAlt }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#050b1a" },
  ],
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    // data-theme is set before paint by the inline script, so the server/client attribute differs by design.
    <html lang={locale} dir={directionOf(locale)} className={`${latin.variable} ${arabic.variable} ${arabicDisplay.variable}`} suppressHydrationWarning>
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
        {/* Structured data for search and answer engines. Static content, "<" escaped. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(t.web.meta.description, locale)).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
