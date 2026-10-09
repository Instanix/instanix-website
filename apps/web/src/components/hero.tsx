import type { Dictionary, Locale } from "@ix/i18n";
import { buttonClass, Eyebrow } from "@ix/ui";
import { ArrowRight, BarChart3, Link2, Play, Workflow, Zap, type LucideIcon } from "lucide-react";
import Link from "next/link";

const FEATURE_ICONS: readonly LucideIcon[] = [Workflow, Link2, BarChart3, Zap];

/**
 * Cover art: the official IX team key visual (built by `pnpm agent-art`).
 * It is never mirrored in RTL — the characters carry their serial IDs.
 */
function Cover({ alt, className }: { readonly alt: string; readonly className: string }) {
  return (
    <img
      src="/hero-cover.webp"
      alt={alt}
      width={1672}
      height={941}
      fetchPriority="high"
      decoding="async"
      className={className}
    />
  );
}

export function Hero({ locale, t }: { readonly locale: Locale; readonly t: Dictionary }) {
  const h = t.web.hero;
  return (
    // Pulled up under the sticky glass header so the cover runs to the top of the page.
    <section className="relative isolate -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
      {/* Desktop: the cover fills the far side of the hero and fades into the page behind the copy. */}
      <div className="absolute inset-y-0 end-0 -z-10 hidden w-[74%] lg:block">
        <Cover alt={h.imageAlt} className="size-full object-cover object-[50%_60%] dark:brightness-75" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden bg-linear-to-r from-bg from-27% via-bg/75 via-40% to-transparent to-58% lg:block rtl:bg-linear-to-l"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 hidden h-28 bg-linear-to-b from-transparent to-bg lg:block" />

      <div className="mx-auto grid max-w-7xl gap-8 px-5 pt-10 pb-6 sm:px-8 sm:pt-14 lg:min-h-[43rem] lg:grid-cols-12 lg:items-center lg:pt-6 lg:pb-24">
        <div className="space-y-7 lg:col-span-5">
          <Eyebrow>{h.eyebrow}</Eyebrow>
          <h1 className="text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl xl:text-[4.25rem]">
            <span className="block sm:whitespace-nowrap">{h.line1}</span>
            <span className="block">
              {h.line2} <span className="ix-gradient-text">{h.accent}</span>
            </span>
            <span className="block">
              {h.line3}{" "}
              <span dir="ltr" className="ix-gradient-text inline-block">
                {h.brand}
              </span>
            </span>
          </h1>
          <p className="max-w-md text-lg text-pretty text-fg-soft">{h.body}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
              {h.primaryCta}
              <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
            <a href="#team" className={buttonClass("secondary", "lg")}>
              <Play className="size-4 rtl:rotate-180" aria-hidden="true" />
              {h.secondaryCta}
            </a>
          </div>
          <ul className="grid max-w-md grid-cols-2 gap-x-4 gap-y-3 pt-2">
            {h.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i] ?? Zap;
              return (
                <li key={feature.title} className="flex items-center gap-2.5">
                  <span className="ix-glass grid size-10 shrink-0 place-items-center rounded-xl text-brand-text shadow-ix-sm">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block font-bold">{feature.title}</span>
                    <span className="block text-muted">{feature.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Phones and tablets: the cover sits under the copy as a framed image. */}
        <Cover alt={h.imageAlt} className="w-full rounded-ix-lg shadow-ix-lg lg:hidden" />
      </div>
    </section>
  );
}
