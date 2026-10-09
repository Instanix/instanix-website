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
      <Section className="grid gap-10 lg:grid-cols-[26rem_1fr] lg:items-center">
        <div className="relative mx-auto w-full max-w-md">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-[2.5rem] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--ix-brand)_45%,transparent),transparent)] blur-2xl"
          />
          <img
            src="/founder/with-zeus.webp"
            alt={a.photos.zeus}
            width={900}
            height={1125}
            fetchPriority="high"
            decoding="async"
            className="relative w-full rounded-ix-lg shadow-ix-lg ring-1 ring-line"
          />
        </div>
        <div className="space-y-5">
          <Eyebrow>{a.founderEyebrow}</Eyebrow>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{a.name}</h2>
          <p className="text-lg font-bold text-brand-text">{a.role}</p>
          {a.bio.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-pretty text-fg-soft">
              {paragraph}
            </p>
          ))}
        </div>
      </Section>

      <Section>
        <ul className="grid gap-4 sm:grid-cols-3">
          {gallery.map((photo) => (
            <li key={photo.src}>
              {/* The portraits have white backgrounds, so they sit on a white tile in both themes. */}
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full rounded-ix-lg bg-white object-cover object-top shadow-ix ring-1 ring-line"
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">{a.missionTitle}</h2>
          <p className="text-xl leading-relaxed text-pretty text-fg-soft">{a.mission}</p>
        </Card>
        <Card className="space-y-4 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">{a.factsTitle}</h2>
          <dl className="space-y-3">
            {facts.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-6 border-b border-line pb-3">
                <dt className="shrink-0 text-sm text-muted">{label}</dt>
                <dd className="text-end font-bold">{value}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-6">
              <dt className="shrink-0 text-sm text-muted">{a.facts.email}</dt>
              <dd>
                <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="inline-flex items-center gap-1.5 font-bold text-brand-text hover:underline">
                  <Mail className="size-4" aria-hidden="true" />
                  {CONTACT_EMAIL}
                </a>
              </dd>
            </div>
          </dl>
        </Card>
      </Section>
    </SiteChrome>
  );
}
