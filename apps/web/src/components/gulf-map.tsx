"use client";

import type { Dictionary, Locale } from "@ix/i18n";
import { buttonClass, cn } from "@ix/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { INDUSTRIES } from "@/lib/industries";

type Copy = Dictionary["web"]["map"];
type CountryKey = keyof Copy["countries"];

/**
 * Where each country sits on the stage, in percent. Positions follow the region's rough
 * geography; no borders are drawn.
 */
const PLACES: readonly { key: CountryKey; x: number; y: number; above?: boolean }[] = [
  { key: "EG", x: 11, y: 46 },
  { key: "KW", x: 53, y: 20, above: true },
  { key: "SA", x: 42, y: 62 },
  { key: "BH", x: 62, y: 36, above: true },
  { key: "QA", x: 69, y: 52 },
  { key: "AE", x: 83, y: 60, above: true },
  { key: "OM", x: 91, y: 80 },
];

/** Instanix is based here; the routes on the map fan out from it. */
const HOME: CountryKey = "AE";

export function GulfMap({
  locale,
  copy,
  industries,
}: {
  readonly locale: Locale;
  readonly copy: Copy;
  readonly industries: Readonly<Record<string, string>>;
}) {
  const [selected, setSelected] = useState<CountryKey>(HOME);
  const home = PLACES.find((place) => place.key === HOME);
  const country = copy.countries[selected];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      {/* Geography never mirrors, so the stage is always left to right. */}
      <div dir="ltr" className="ix-dots relative aspect-[16/10] overflow-hidden rounded-ix-lg border border-line bg-surface shadow-ix">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(30rem_18rem_at_78%_55%,color-mix(in_srgb,var(--ix-brand)_20%,transparent),transparent_70%)]"
        />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full">
          {home
            ? PLACES.filter((place) => place.key !== HOME).map((place) => {
                const lift = Math.min(home.y, place.y) - 14;
                const active = place.key === selected;
                return (
                  <path
                    key={place.key}
                    d={`M ${home.x} ${home.y} Q ${(home.x + place.x) / 2} ${lift}, ${place.x} ${place.y}`}
                    fill="none"
                    stroke={active ? "var(--ix-brand)" : "var(--ix-line-strong)"}
                    strokeWidth={active ? 2 : 1.25}
                    strokeDasharray={active ? undefined : "3 5"}
                    vectorEffect="non-scaling-stroke"
                    className="transition-[stroke] duration-500"
                  />
                );
              })
            : null}
        </svg>
        <ul aria-label={copy.listLabel}>
          {PLACES.map((place) => {
            const active = place.key === selected;
            return (
              <li
                key={place.key}
                // Shifted so the dot, not the label, sits on the point the routes lead to.
                className={cn("absolute -translate-x-1/2", place.above ? "-translate-y-[calc(100%-0.625rem)]" : "-translate-y-2.5")}
                style={{ left: `${place.x}%`, top: `${place.y}%` }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(place.key)}
                  aria-pressed={active}
                  className={cn("group flex items-center gap-1.5", place.above ? "flex-col-reverse" : "flex-col")}
                >
                  <span className="relative grid size-5 place-items-center">
                    {active ? <span className="ix-node-active absolute inset-0 rounded-full" /> : null}
                    <span
                      className={cn(
                        "block rounded-full border-2 border-surface transition-all duration-300",
                        active ? "size-5 bg-primary" : "size-3.5 bg-line-strong group-hover:size-4.5 group-hover:bg-brand",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap transition-colors duration-300",
                      active ? "bg-primary text-on-primary" : "ix-glass text-fg-soft group-hover:text-fg",
                    )}
                  >
                    {copy.countries[place.key].name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div key={selected} aria-live="polite" className="ix-anim-in ix-glass-strong flex flex-col rounded-ix-lg p-6 sm:p-7">
        <h3 className="text-3xl font-extrabold tracking-tight">{country.name}</h3>
        <p className="mt-2 text-fg-soft">{country.note}</p>
        <p className="mt-1 text-sm text-muted">{copy.language}</p>
        <p className="mt-6 text-xs font-extrabold tracking-widest text-muted uppercase">{copy.buildTitle}</p>
        <ul className="mt-3 space-y-1.5">
          {INDUSTRIES.map(({ key, slug, icon: Icon }) => (
            <li key={key}>
              <Link
                href={`/${locale}/industries/${slug}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--ix-brand)_10%,transparent)]"
              >
                <Icon className="size-4.5 shrink-0 text-brand-text" aria-hidden="true" />
                <span className="flex-1">{industries[key]}</span>
                <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Link href={`/${locale}/assessment`} className={buttonClass("primary", "md")}>
            {copy.cta}
          </Link>
          {selected === "QA" ? (
            <Link href={`/${locale}/work`} className={buttonClass("secondary", "md")}>
              {copy.scanno}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
