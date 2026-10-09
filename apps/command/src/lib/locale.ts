import "server-only";
import { getDictionary, LOCALE_COOKIE, resolveLocale, type Dictionary, type Locale } from "@ix/i18n";
import { cookies } from "next/headers";

/** The cookie is client-controlled input: anything unsupported resolves to the default locale. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
