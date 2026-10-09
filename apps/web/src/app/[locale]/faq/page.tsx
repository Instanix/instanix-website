import { FaqList } from "@/components/faq-list";
import { faqSchema, JsonLd } from "@/components/json-ld";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/faq", (t) => ({ title: t.web.faqPage.eyebrow, description: t.web.faqPage.body }));
}

export default async function FaqPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const p = t.web.faqPage;

  return (
    <SiteChrome locale={locale} t={t} path="/faq">
      <JsonLd data={faqSchema(p.items)} />
      <div className="space-y-10">
        <PageHero eyebrow={p.eyebrow} title={p.title} body={p.body} />
        <Section className="max-w-4xl">
          <FaqList items={p.items} />
        </Section>
      </div>
    </SiteChrome>
  );
}
