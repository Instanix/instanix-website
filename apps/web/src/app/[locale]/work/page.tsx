import { Badge, buttonClass, Card } from "@ix/ui";
import { ArrowUpRight, CircleCheck, ScanSearch } from "lucide-react";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

/** Only projects that are live and that Instanix actually built are listed here. */
const SCANNO_URL = "https://scanno.qa";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/work", (t) => ({ title: t.web.workPage.eyebrow, description: t.web.workPage.scanno.summary }));
}

export default async function WorkPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const p = t.web.workPage;
  const s = p.scanno;

  return (
    <SiteChrome locale={locale} t={t} path="/work">
      <div className="space-y-10">
        <PageHero eyebrow={p.eyebrow} title={p.title} body={p.body} />

        <Section>
          <Card className="overflow-hidden">
            <div className="relative overflow-hidden bg-[linear-gradient(120deg,var(--ix-ink),var(--ix-ink-2)_55%,#0a3a8c)] p-8 text-on-ink sm:p-12">
              <div aria-hidden="true" className="absolute -end-16 -top-20 size-80 rounded-full bg-brand/30 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-4">
                  <Badge className="bg-white/12 text-on-ink">{s.tag}</Badge>
                  <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">{s.title}</h2>
                  <p className="text-lg text-on-ink-muted">{s.summary}</p>
                  <a href={SCANNO_URL} target="_blank" rel="noopener noreferrer" className={buttonClass("on-ink", "md")}>
                    {s.visit}
                    <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                  </a>
                </div>
                <span
                  aria-hidden="true"
                  className="grid size-28 shrink-0 place-items-center rounded-[28%] border border-ink-line bg-white/5 text-[#8ad6ff] shadow-[0_0_48px_rgb(0_145_255/0.45)] sm:size-36"
                >
                  <ScanSearch className="size-14 sm:size-16" />
                </span>
              </div>
            </div>

            <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold tracking-tight">{s.builtTitle}</h3>
                <ul className="space-y-3">
                  {s.built.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold tracking-tight">{s.approachTitle}</h3>
                <p className="text-lg text-pretty text-fg-soft">{s.approach}</p>
              </div>
            </div>
          </Card>
        </Section>
      </div>
    </SiteChrome>
  );
}
