import { isLocale, LOCALES, getDictionary } from "@ix/i18n";
import { buttonClass, Eyebrow } from "@ix/ui";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, SiteChrome } from "@/components/site-chrome";
import { ARTICLES, getArticle } from "@/lib/articles";
import { SITE_URL } from "@/lib/env";
import { alternatesFor, loadPage } from "@/lib/page";

interface Props {
  readonly params: Promise<{ locale: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => ARTICLES.map((article) => ({ locale, slug: article.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticle(slug);
  if (!isLocale(locale) || !article) return {};
  const copy = article.copy[locale];
  const path = `/insights/${article.slug}`;
  return {
    title: `${copy.title} — ${getDictionary(locale).web.insightsPage.eyebrow}`,
    description: copy.description,
    alternates: alternatesFor(locale, path),
    openGraph: { type: "article", title: copy.title, description: copy.description, publishedTime: article.date, url: `/${locale}${path}` },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const { locale, t } = await loadPage(params);
  const article = getArticle(slug);
  if (!article) notFound();

  const p = t.web.insightsPage;
  const copy = article.copy[locale];
  const path = `/insights/${article.slug}`;
  const dateFormat = new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const nextKey = article.next.slice(1) as keyof typeof p.next;
  const others = ARTICLES.filter((other) => other.slug !== article.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: copy.title,
    description: copy.description,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: locale,
    mainEntityOfPage: `${SITE_URL}/${locale}${path}`,
    author: { "@type": "Person", "@id": `${SITE_URL}/#founder`, name: "Amir Diab" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <SiteChrome locale={locale} t={t} path={path}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <article className="space-y-12">
        <div className="relative isolate -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
          <div aria-hidden="true" className="ix-stage-light absolute inset-0 -z-10" />
          <Section reveal={false} className="pt-14 pb-8 sm:pt-20">
            <div className="max-w-4xl space-y-6">
              <Link href={`/${locale}/insights`} className="ix-rise inline-flex items-center gap-2 text-sm font-bold text-brand-text">
                <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                {p.back}
              </Link>
              <h1 className="ix-rise text-4xl leading-[1.06] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">{copy.title}</h1>
              <p className="ix-rise max-w-3xl text-xl text-pretty text-fg-soft sm:text-2xl">{copy.description}</p>
              <p className="ix-rise text-sm text-muted">
                {p.by}
                <span aria-hidden="true"> · </span>
                <time dateTime={article.date}>{dateFormat.format(new Date(article.date))}</time>
                <span aria-hidden="true"> · </span>
                {p.minutes.replace("{n}", String(article.minutes))}
              </p>
            </div>
          </Section>
        </div>

        <Section reveal={false} className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="max-w-3xl space-y-12">
            {copy.sections.map((section) => (
              <section key={section.heading} className="space-y-4">
                <h2 className="text-3xl leading-[1.12] font-extrabold tracking-tight text-balance sm:text-4xl">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-lg leading-relaxed text-pretty text-fg-soft sm:text-xl">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-line bg-surface p-7 shadow-ix">
              <Eyebrow>{p.takeawaysTitle}</Eyebrow>
              <ul className="mt-4 space-y-4">
                {copy.takeaways.map((item) => (
                  <li key={item} className="border-t border-line pt-4 text-lg leading-snug font-semibold text-pretty first:border-0 first:pt-0">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link href={`/${locale}${article.next}`} className={`${buttonClass("primary", "lg")} w-full`}>
              {p.next[nextKey]}
              <ArrowRight className="size-4.5 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </aside>
        </Section>

        <Section className="space-y-6">
          <h2 className="text-2xl font-extrabold tracking-tight">{p.moreTitle}</h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/${locale}/insights/${other.slug}`}
                  className="ix-spot block h-full rounded-[2rem] border border-line bg-surface p-7 shadow-ix transition-transform duration-300 hover:-translate-y-0.5 sm:p-9"
                >
                  <h3 className="text-2xl leading-[1.15] font-extrabold tracking-tight text-balance">{other.copy[locale].title}</h3>
                  <p className="mt-3 text-pretty text-muted">{other.copy[locale].description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </article>
    </SiteChrome>
  );
}
