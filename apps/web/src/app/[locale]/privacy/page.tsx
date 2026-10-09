import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/privacy", (t) => ({ title: t.web.privacyPage.title, description: t.web.privacyPage.sections[0]?.body[0] ?? "" }));
}

/** Describes what this website actually does with data. Update it whenever that behavior changes. */
export default async function PrivacyPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const p = t.web.privacyPage;

  return (
    <SiteChrome locale={locale} t={t} path="/privacy">
      <div className="space-y-10">
        <PageHero eyebrow={p.eyebrow} title={p.title} body={p.updated} />
        <Section className="max-w-3xl space-y-10">
          {p.sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-relaxed text-pretty text-fg-soft">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </Section>
      </div>
    </SiteChrome>
  );
}
