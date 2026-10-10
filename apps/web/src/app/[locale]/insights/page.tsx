import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { ARTICLES } from "@/lib/articles";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/insights", (t) => ({ title: t.web.insightsPage.eyebrow, description: t.web.insightsPage.body }));
}

export default async function InsightsPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const p = t.web.insightsPage;
  const dateFormat = new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <SiteChrome locale={locale} t={t} path="/insights">
      <div className="space-y-10">
        <PageHero eyebrow={p.eyebrow} title={p.title} body={p.body} />

        <Section reveal={false}>
          <ol>
            {ARTICLES.map((article, index) => {
              const copy = article.copy[locale];
              return (
                <li key={article.slug} className="ix-reveal border-b border-line last:border-0">
                  <Link href={`/${locale}/insights/${article.slug}`} className="group grid gap-x-8 gap-y-3 py-9 first:pt-0 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-baseline">
                    <span dir="ltr" className="font-mono text-sm font-bold text-brand-text">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-3">
                      <h2 className="max-w-3xl text-3xl leading-[1.1] font-extrabold tracking-tight text-balance transition-colors duration-300 group-hover:text-brand-text sm:text-4xl">
                        {copy.title}
                      </h2>
                      <p className="max-w-3xl text-lg text-pretty text-muted">{copy.description}</p>
                      <p className="text-sm text-muted">
                        <time dateTime={article.date}>{dateFormat.format(new Date(article.date))}</time>
                        <span aria-hidden="true"> · </span>
                        {p.minutes.replace("{n}", String(article.minutes))}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-text">
                      {p.read}
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Section>
      </div>
    </SiteChrome>
  );
}
