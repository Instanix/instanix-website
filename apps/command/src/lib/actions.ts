"use server";

import { isLocale, LOCALE_COOKIE } from "@ix/i18n";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Persists the UI language. Input comes from a form, so it is validated, never trusted. */
export async function setLocale(formData: FormData): Promise<void> {
  const locale = formData.get("locale");
  if (!isLocale(locale)) {
    throw new Error("Unsupported locale");
  }
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/", "layout");
}
