import { DemoSection } from "@/components/sections";
import { PageHero, SiteChrome } from "@/components/site-chrome";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/demo", (t) => ({ title: t.web.demo.eyebrow, description: t.web.demo.body }));
}

export default async function DemoPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const d = t.web.demo;

  return (
    <SiteChrome locale={locale} t={t} path="/demo">
      <div className="space-y-10">
        <PageHero eyebrow={d.eyebrow} title={d.title} body={d.body} />
        <DemoSection locale={locale} t={t} heading={false} />
      </div>
    </SiteChrome>
  );
}
