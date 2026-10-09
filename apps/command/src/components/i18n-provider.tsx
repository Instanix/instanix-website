"use client";

import type { Dictionary, Locale } from "@ix/i18n";
import { createContext, useContext, type ReactNode } from "react";

interface I18nValue {
  readonly locale: Locale;
  readonly t: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ value, children }: { readonly value: I18nValue; readonly children: ReactNode }) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** For client components (loading/error boundaries, nav) that cannot read cookies. */
export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
