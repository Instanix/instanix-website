"use client";

import { buttonClass, Logo } from "@ix/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The 404 page. not-found receives no route params, so the language is read from the
 * address. ARES, the security agent, delivers the message: he is the one who guards the doors.
 */
const COPY = {
  en: {
    badge: "ARES · IX-005 · Security",
    title: "Nothing behind this door.",
    body: "I checked the address twice. This page does not exist, or it has been moved. Nothing is broken on your side.",
    home: "Back to home",
    agents: "Meet the IX agents",
    assessment: "Free assessment",
    code: "Page not found",
  },
  ar: {
    badge: "ARES · IX-005 · الأمن",
    title: "لا شيء خلف هذا الباب.",
    body: "راجعت العنوان مرتين. هذه الصفحة غير موجودة أو تم نقلها. لا يوجد أي خلل من جهتك.",
    home: "العودة إلى الرئيسية",
    agents: "تعرّف على وكلاء IX",
    assessment: "تقييم مجاني",
    code: "الصفحة غير موجودة",
  },
} as const;

export function NotFoundView() {
  const locale = usePathname().startsWith("/ar") ? "ar" : "en";
  const t = COPY[locale];

  return (
    <main id="main" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="ix-stage-light absolute inset-0 -z-10" />

      <div className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8">
        <Link href={`/${locale}`} aria-label="Instanix" className="inline-flex text-lg">
          <Logo />
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-6 px-5 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="space-y-6 pt-8 lg:pt-0">
          <p className="ix-rise text-sm font-semibold text-brand-text">
            <bdi>{t.badge}</bdi>
          </p>
          <p dir="ltr" aria-label={t.code} className="ix-rise text-[7rem] leading-none font-extrabold tracking-tighter text-brand-text sm:text-[10rem]" style={{ animationDelay: "0.06s" }}>
            404
          </p>
          <h1 className="ix-rise text-4xl leading-[1.06] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl" style={{ animationDelay: "0.12s" }}>
            {t.title}
          </h1>
          <p className="ix-rise max-w-xl text-lg text-pretty text-fg-soft sm:text-xl" style={{ animationDelay: "0.18s" }}>
            {t.body}
          </p>
          <div className="ix-rise flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
            <Link href={`/${locale}`} className={buttonClass("primary", "lg")}>
              {t.home}
            </Link>
            <Link href={`/${locale}/agents`} className={buttonClass("secondary", "lg")}>
              {t.agents}
            </Link>
            <Link href={`/${locale}/assessment`} className={buttonClass("secondary", "lg")}>
              {t.assessment}
            </Link>
          </div>
        </div>

        {/* The character never mirrors in RTL: he carries his serial ID. */}
        <div dir="ltr" aria-hidden="true" className="ix-rise relative mx-auto flex h-[22rem] items-end justify-center sm:h-[30rem] lg:h-[38rem]" style={{ animationDelay: "0.2s" }}>
          <span className="absolute inset-x-[-10%] bottom-[-3%] h-[14%] rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--ix-brand)_55%,transparent),transparent)] blur-xl" />
          <img
            src="/agents/ares.webp"
            alt=""
            width={400}
            height={900}
            fetchPriority="high"
            decoding="async"
            className="relative h-full w-auto object-contain drop-shadow-[0_26px_32px_rgb(6_23_58/0.32)]"
          />
        </div>
      </div>
    </main>
  );
}
