import { AGENT_KEYS, getAgent, type AgentKey } from "@ix/agents";
import { AgentFigure } from "@ix/ui";
import { AssessmentForm } from "@/components/assessment-form";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { BOOKING_URL, WHATSAPP_NUMBER } from "@/lib/env";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";
import { leadsEnabled } from "@/lib/server/leads";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/assessment", (t) => ({ title: t.web.assessment.eyebrow, description: t.web.assessment.body }));
}

export default async function AssessmentPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const a = t.web.assessment;
  const roles = Object.fromEntries(AGENT_KEYS.map((key) => [key, t.agents[key].role])) as Record<AgentKey, string>;

  return (
    <SiteChrome locale={locale} t={t} path="/assessment">
      <div className="space-y-10">
        <PageHero
          eyebrow={a.eyebrow}
          title={
            <>
              <span className="block">{a.line1}</span>
              <span className="ix-gradient-text block">{a.accent}</span>
            </>
          }
          body={a.body}
          art={<AgentFigure agent={getAgent("zeus")} priority />}
        >
          <ol className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            {a.steps.map((step, i) => (
              <li key={step} className="flex items-center gap-2 text-sm font-bold">
                <span dir="ltr" className="grid size-7 place-items-center rounded-full bg-primary text-xs text-on-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </PageHero>
        <Section className="max-w-4xl">
          <AssessmentForm locale={locale} copy={a} roles={roles} bookingUrl={BOOKING_URL} whatsappNumber={WHATSAPP_NUMBER} leadsEnabled={leadsEnabled()} />
        </Section>
      </div>
    </SiteChrome>
  );
}
