import { buttonClass, Card, Eyebrow } from "@ix/ui";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/env";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/about", (t) => ({ title: t.web.aboutPage.eyebrow, description: t.web.aboutPage.body }));
}

export default async function AboutPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const a = t.web.aboutPage;
  const facts = [
    [a.facts.founded, a.facts.foundedValue],
    [a.facts.headquarters, a.facts.headquartersValue],
    [a.facts.focus, a.facts.focusValue],
    [a.facts.markets, a.facts.marketsValue],
  ] as const;
  // Photos are built by `pnpm agent-art` from IX-LOGO/founder.
  const gallery = [
    { src: "/founder/portrait.webp", alt: a.photos.portrait, width: 900, height: 1125 },
    { src: "/founder/profile.webp", alt: a.photos.profile, width: 900, height: 1125 },
    { src: "/founder/art.webp", alt: a.photos.art, width: 900, height: 1029 },
  ];

  return (
    <SiteChrome locale={locale} t={t} path="/about">
      <JsonLd
        data={{
          "@type": "Person",
          "@id": `${SITE_URL}/#founder`,
          name: "Amir Diab",
          jobTitle: "Founder",
          worksFor: { "@id": `${SITE_URL}/#organization` },
          image: `${SITE_URL}/founder/portrait.webp`,
          url: `${SITE_URL}/${locale}/about`,
        }}
      />

      <PageHero
        eyebrow={a.eyebrow}
        title={
          <>
            <span className="block">{a.line1}</span>
            <span className="ix-gradient-text block">{a.accent}</span>
          </>
        }
        body={a.body}
      >
        <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
          {t.web.hero.primaryCta}
          <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </PageHero>

      {/* Founder */}
      <Section id="founder" className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-[3rem] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--ix-brand)_40%,transparent),transparent)] blur-3xl"
          />
          <img
            src="/founder/with-zeus.webp"
            alt={a.photos.zeus}
            width={900}
            height={1125}
            fetchPriority="high"
            decoding="async"
            className="relative w-full rounded-[2rem] shadow-ix-lg ring-1 ring-line"
          />
          {/* Name plate over the photo */}
          <div className="ix-glass-strong absolute inset-x-4 bottom-4 rounded-2xl px-5 py-4">
            <p className="text-lg font-extrabold tracking-tight">{a.name}</p>
            <p className="text-sm text-fg-soft">
              {a.facts.headquartersValue} · {a.facts.foundedValue}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <Eyebrow>{a.founderEyebrow}</Eyebrow>
          <h2 className="text-5xl leading-none font-extrabold tracking-tight sm:text-6xl lg:text-7xl">{a.name}</h2>
          <p className="text-lg font-bold text-brand-text">{a.role}</p>
          <div className="space-y-4 border-s-2 border-brand ps-5 sm:ps-6">
            {a.bio.map((paragraph, index) => (
              <p key={paragraph} className={`leading-relaxed text-pretty ${index === 0 ? "text-xl font-semibold text-fg" : "text-lg text-fg-soft"}`}>
                {paragraph}
              </p>
            ))}
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className={buttonClass("secondary", "md")}>
            <Mail className="size-4" aria-hidden="true" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </Section>

      {/* Why the company exists */}
      <Section>
        <div className="ix-on-ink relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-on-ink sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(40rem_22rem_at_100%_0%,color-mix(in_srgb,var(--ix-brand)_50%,transparent),transparent_70%)]"
          />
          <p className="relative text-sm font-semibold text-on-ink-muted">{a.missionTitle}</p>
          <p className="relative mt-4 max-w-4xl text-3xl leading-snug font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">{a.mission}</p>
        </div>
      </Section>

      {/* Company facts */}
      <Section className="space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{a.factsTitle}</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(([label, value]) => (
            <Card key={label} className="flex flex-col gap-3 p-6">
              <dt className="text-sm font-semibold text-muted">{label}</dt>
              <dd className="text-xl leading-snug font-extrabold tracking-tight">{value}</dd>
            </Card>
          ))}
        </dl>
      </Section>

      {/* Gallery: a staggered collage */}
      <Section>
        <ul className="grid gap-4 sm:grid-cols-3 sm:items-start">
          {gallery.map((photo, index) => (
            <li key={photo.src} className={`group overflow-hidden rounded-[2rem] shadow-ix ring-1 ring-line ${index === 1 ? "sm:mt-12" : ""}`}>
              {/* The portraits have white backgrounds, so they sit on a white tile in both themes. */}
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full bg-white object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </li>
          ))}
        </ul>
      </Section>
    </SiteChrome>
  );
}
