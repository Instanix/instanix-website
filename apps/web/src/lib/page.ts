import { getDictionary, isLocale, type Dictionary, type Locale } from "@ix/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export interface LocaleParams {
  readonly params: Promise<{ locale: string }>;
}

/** Resolves the locale segment (untrusted URL input) or renders the 404 page. */
export async function loadPage(params: Promise<{ locale: string }>): Promise<{ locale: Locale; t: Dictionary }> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale, t: getDictionary(locale) };
}

/** Canonical URL plus hreflang alternates for a page path (without the locale prefix). */
export function alternatesFor(locale: Locale, path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: `/${locale}${path}`,
    languages: { en: `/en${path}`, ar: `/ar${path}`, "x-default": `/en${path}` },
  };
}

export async function pageMetadata(
  params: Promise<{ locale: string }>,
  path: string,
  pick: (t: Dictionary) => { title: string; description: string },
): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { title, description } = pick(getDictionary(locale));
  return { title: `${title} — IX`, description, alternates: alternatesFor(locale, path) };
}
