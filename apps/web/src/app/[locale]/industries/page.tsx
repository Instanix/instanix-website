import { IndustryCards } from "@/components/sections";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/industries", (t) => ({ title: t.web.industries.eyebrow, description: t.web.industries.body }));
}

export default async function IndustriesPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const copy = t.web.industries;

  return (
    <SiteChrome locale={locale} t={t} path="/industries">
      <div className="space-y-10">
        <PageHero eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
        <Section>
          <IndustryCards locale={locale} t={t} />
        </Section>
      </div>
    </SiteChrome>
  );
}
