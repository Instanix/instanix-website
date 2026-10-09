import { isLocale, LOCALE_COOKIE, localeFromAcceptLanguage, type Locale } from "@ix/i18n";
import { NextResponse, type NextRequest } from "next/server";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function rememberLocale(response: NextResponse, locale: Locale): NextResponse {
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR_SECONDS, sameSite: "lax" });
  return response;
}

/**
 * Every public URL is locale-prefixed (/en, /ar). Visiting one persists the
 * choice; un-prefixed URLs redirect to the persisted or negotiated locale.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    return rememberLocale(NextResponse.next(), first);
  }

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie) ? cookie : localeFromAcceptLanguage(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return rememberLocale(NextResponse.redirect(url), locale);
}

export const config = {
  // Skip API routes, Next internals and any file with an extension (icons, images, etc.).
  matcher: ["/((?!api/|_next/|.*\\.[\\w]+$).*)"],
};
