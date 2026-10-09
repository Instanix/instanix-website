import { ar } from "./messages/ar";
import { en, type Dictionary } from "./messages/en";

export type { Dictionary };

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export type Direction = "ltr" | "rtl";

/** English is the canonical default (CLAUDE.md, non-negotiable). */
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "ix-locale";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
/** Light is the canonical default theme. */
export const DEFAULT_THEME: Theme = "light";
export const THEME_STORAGE_KEY = "ix-theme";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Boundary validation: anything that is not a supported locale falls back to the default. */
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function directionOf(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "ar" : "en";
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Picks the best supported locale from an Accept-Language header value. */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase().split("-")[0];
    if (isLocale(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

const INTL_LOCALE: Record<Locale, string> = { en: "en-AE", ar: "ar-AE" };

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], options).format(value);
}

export function formatCurrency(locale: Locale, value: number, currency: string): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency }).format(value);
}

export function formatDate(
  locale: Locale,
  value: Date,
  options: Intl.DateTimeFormatOptions & { timeZone: string },
): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], options).format(value);
}
