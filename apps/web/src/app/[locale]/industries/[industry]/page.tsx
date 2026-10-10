import { getAgent } from "@ix/agents";
import { getDictionary, isLocale } from "@ix/i18n";
import { AgentAvatar, buttonClass, Card, Eyebrow } from "@ix/ui";
import { ArrowRight, Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/faq-list";
import { breadcrumbSchema, faqSchema, JsonLd } from "@/components/json-ld";
import { DemoSection } from "@/components/sections";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { SITE_URL } from "@/lib/env";
import { INDUSTRIES } from "@/lib/industries";
import { alternatesFor } from "@/lib/page";

interface Props {
  readonly params: Promise<{ locale: string; industry: string }>;
}

export function generateStaticParams() {
  return INDUSTRIES.map((industry) => ({ industry: industry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, industry: slug } = await params;
  const industry = INDUSTRIES.find((i) => i.slug === slug);
  if (!isLocale(locale) || !industry) return {};
  const copy = getDictionary(locale).web.industries.items[industry.key];
  return {
    title: `${copy.name}: ${copy.headline} — Instanix`,
    description: `${copy.sub} ${copy.story}`.slice(0, 300),
    alternates: alternatesFor(locale, `/industries/${slug}`),
  };
}

export default async function IndustryPage({ params }: Props) {
  const { locale, industry: slug } = await params;
  // Both segments are untrusted URL input.
  const industry = INDUSTRIES.find((i) => i.slug === slug);
  if (!isLocale(locale) || !industry) notFound();

  const t = getDictionary(locale);
  const labels = t.web.industries;
  const copy = labels.items[industry.key];
  const Icon = industry.icon;
  const path = `/industries/${slug}`;

  return (
    <SiteChrome locale={locale} t={t} path={path}>
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "Service",
              name: `${copy.name} — ${copy.sub}`,
              description: copy.story,
              url: `${SITE_URL}/${locale}${path}`,
              provider: { "@id": `${SITE_URL}/#organization` },
              areaServed: ["AE", "QA", "SA", "KW", "BH", "OM", "EG"],
            },
            faqSchema(copy.faq),
            breadcrumbSchema([
              [labels.eyebrow, `/${locale}/industries`],
              [copy.name, `/${locale}${path}`],
            ]),
          ],
        }}
      />

      <PageHero
        eyebrow={copy.name}
        title={copy.headline}
        body={copy.sub}
        art={
          <span className="mb-10 grid size-40 place-items-center rounded-[28%] bg-brand-soft text-brand-text sm:size-52">
            <Icon className="size-20 sm:size-24" aria-hidden="true" />
          </span>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
            {t.web.hero.primaryCta}
            <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
          {industry.demo ? (
            <a href="#demo" className={buttonClass("secondary", "lg")}>
              {labels.demoTitle}
            </a>
          ) : null}
        </div>
      </PageHero>

      {/* The problem, told as a scene the reader recognizes */}
      <Section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-ix-lg bg-[linear-gradient(120deg,var(--ix-ink),var(--ix-ink-2)_60%,#0a3a8c)] p-8 text-on-ink shadow-ix-lg sm:p-10">
          <div aria-hidden="true" className="absolute -end-16 -top-20 size-72 rounded-full bg-brand/25 blur-3xl" />
          <div className="relative space-y-4">
            <p className="text-xs font-bold tracking-widest text-[#8ad6ff] uppercase">{labels.storyTitle}</p>
            <p className="text-xl leading-relaxed text-pretty sm:text-2xl">{copy.story}</p>
          </div>
        </div>
        <Card className="space-y-4 p-6 sm:p-8">
          <h2 className="text-xl font-extrabold tracking-tight">{labels.painsTitle}</h2>
          <ul className="space-y-3">
            {copy.pains.map((pain) => (
              <li key={pain} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-danger/12 text-danger">
                  <X className="size-3.5" aria-hidden="true" />
                </span>
                <span className="font-semibold">{pain}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      {/* The flow, one agent per step */}
      <Section className="space-y-8">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.flowTitle}</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {copy.flow.map((step, i) => {
            const agent = getAgent(industry.flowAgents[i] ?? "zeus");
            return (
              <li key={step.title}>
                <Card className="relative h-full space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <AgentAvatar agent={agent} size="md" />
                    <div className="min-w-0">
                      <p dir="ltr" className="text-start text-xs font-bold tracking-wide text-brand-text rtl:text-end">
                        {agent.name}
                      </p>
                      <p className="text-xs text-muted">{t.agents[agent.key].role}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    <span dir="ltr" className="text-muted">
                      {i + 1}.
                    </span>{" "}
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted">{step.body}</p>
                </Card>
              </li>
            );
          })}
        </ol>
      </Section>

      {industry.demo ? <DemoSection locale={locale} t={t} only={industry.demo} /> : null}

      {/* Before / after */}
      <Section className="space-y-8">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.changesTitle}</h2>
        <ul className="space-y-3">
          {copy.changes.map((change) => (
            <li key={change.before} className="grid gap-px overflow-hidden rounded-ix border border-line bg-line shadow-ix md:grid-cols-2">
              <div className="flex items-start gap-3 bg-surface-2 p-5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-danger/12 text-danger">
                  <X className="size-3.5" aria-hidden="true" />
                </span>
                <p>
                  <span className="block text-xs font-bold tracking-widest text-muted uppercase">{labels.before}</span>
                  <span className="text-fg-soft">{change.before}</span>
                </p>
              </div>
              <div className="flex items-start gap-3 bg-surface p-5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <p>
                  <span className="block text-xs font-bold tracking-widest text-brand-text uppercase">{labels.after}</span>
                  <span className="font-bold">{change.after}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {industry.hasScannoProof ? (
        <Section>
          <div className="relative overflow-hidden rounded-ix-lg border border-brand/30 bg-brand-soft p-8 shadow-ix sm:p-10">
            <div className="max-w-3xl space-y-4">
              <Eyebrow className="bg-surface">{labels.proof.eyebrow}</Eyebrow>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.proof.title}</h2>
              <p className="text-lg text-pretty text-fg-soft">{labels.proof.body}</p>
              <Link href={`/${locale}/work`} className={buttonClass("primary", "md")}>
                {labels.proof.cta}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Section>
      ) : null}

      <Section className="max-w-4xl space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.faqTitle}</h2>
        <FaqList items={copy.faq} />
      </Section>
    </SiteChrome>
  );
}
