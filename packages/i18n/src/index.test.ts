import { describe, expect, it } from "vitest";
import { directionOf, getDictionary, localeFromAcceptLanguage, LOCALES, resolveLocale } from "./index";

function shape(value: unknown, path = ""): string[] {
  if (typeof value === "string") return [path];
  if (Array.isArray(value)) return value.flatMap((v, i) => shape(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k));
  }
  throw new Error(`Unexpected message value at ${path}`);
}

describe("i18n", () => {
  it("keeps EN and AR dictionaries in full key parity", () => {
    expect(shape(getDictionary("ar")).sort()).toEqual(shape(getDictionary("en")).sort());
  });

  it("has no empty messages in any locale", () => {
    for (const locale of LOCALES) {
      const walk = (v: unknown): void => {
        if (typeof v === "string") expect(v.trim().length).toBeGreaterThan(0);
        else if (v && typeof v === "object") Object.values(v).forEach(walk);
      };
      walk(getDictionary(locale));
    }
  });

  it("resolves direction and falls back to English for unsupported input", () => {
    expect(directionOf("ar")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
    expect(resolveLocale("fr")).toBe("en");
    expect(resolveLocale(undefined)).toBe("en");
    expect(resolveLocale("ar")).toBe("ar");
  });

  it("negotiates Accept-Language", () => {
    expect(localeFromAcceptLanguage("ar-AE,ar;q=0.9,en;q=0.8")).toBe("ar");
    expect(localeFromAcceptLanguage("fr-FR,en;q=0.5")).toBe("en");
    expect(localeFromAcceptLanguage(null)).toBe("en");
  });
});
