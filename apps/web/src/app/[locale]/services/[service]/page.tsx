import { getAgent } from "@ix/agents";
import { getDictionary, isLocale } from "@ix/i18n";
import { AgentAvatar, buttonClass, Card } from "@ix/ui";
import { ArrowLeft, ArrowRight, CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/faq-list";
import { breadcrumbSchema, faqSchema, JsonLd } from "@/components/json-ld";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { SERVICES } from "@/lib/catalog";
import { SITE_URL } from "@/lib/env";
import { alternatesFor } from "@/lib/page";

interface Props {
  readonly params: Promise<{ locale: string; service: string }>;
}

export function generateStaticParams() {
  return SERVICES.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service: slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!isLocale(locale) || !service) return {};
  const t = getDictionary(locale).web;
  return {
    title: `${t.servicesPage.items[service.key].title} — Instanix`,
    description: t.serviceDetail.items[service.key].definition,
    alternates: alternatesFor(locale, `/services/${slug}`),
  };
}

export default async function ServicePage({ params }: Props) {
  const { locale, service: slug } = await params;
  // Both segments are untrusted URL input.
  const service = SERVICES.find((s) => s.slug === slug);
  if (!isLocale(locale) || !service) notFound();

  const t = getDictionary(locale);
  const labels = t.web.serviceDetail;
  const summary = t.web.servicesPage.items[service.key];
  const detail = labels.items[service.key];
  const Icon = service.icon;
  const path = `/services/${slug}`;

  return (
    <SiteChrome locale={locale} t={t} path={path}>
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "Service",
              name: summary.title,
              description: detail.definition,
              url: `${SITE_URL}/${locale}${path}`,
              provider: { "@id": `${SITE_URL}/#organization` },
              areaServed: ["AE", "QA", "SA", "KW", "BH", "OM", "EG"],
            },
            faqSchema(detail.faq),
            breadcrumbSchema([
              [t.web.servicesPage.eyebrow, `/${locale}/services`],
              [summary.title, `/${locale}${path}`],
            ]),
          ],
        }}
      />

      <PageHero
        eyebrow={t.web.servicesPage.eyebrow}
        title={summary.title}
        body={summary.body}
        art={
          <span className="mb-10 grid size-40 place-items-center rounded-[28%] bg-brand-soft text-brand-text sm:size-52">
            <Icon className="size-20 sm:size-24" aria-hidden="true" />
          </span>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
            {t.web.hero.primaryCta}
            <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
          <Link
            href={`/${locale}/services`}
            className="inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-fg-soft transition-colors hover:text-brand-text"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            {labels.back}
          </Link>
        </div>
      </PageHero>

      {/* Answer-first definition: the block search and answer engines quote. */}
      <Section>
        <Card className="space-y-4 border-brand/30 p-6 sm:p-10">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{detail.question}</h2>
          <p className="max-w-4xl text-lg leading-relaxed text-pretty text-fg-soft">{detail.definition}</p>
        </Card>
      </Section>

      <Section className="space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.deliverablesTitle}</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {detail.deliverables.map((item, i) => (
            <li key={item.title}>
              <Card className="h-full space-y-3 p-6">
                <span
                  dir="ltr"
                  className="grid size-10 place-items-center rounded-full bg-[linear-gradient(135deg,var(--ix-cyan),var(--ix-primary))] text-sm font-extrabold text-white"
                >
                  {i + 1}
                </span>
                <h3 className="text-lg font-extrabold tracking-tight">{item.title}</h3>
                <p className="text-sm text-muted">{item.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">{labels.useCasesTitle}</h2>
          <ul className="space-y-3">
            {detail.useCases.map((useCase) => (
              <li key={useCase} className="flex items-start gap-2.5 font-semibold">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden="true" />
                {useCase}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-5 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">{t.web.servicesPage.teamLabel}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {service.agents.map((key) => {
              const agent = getAgent(key);
              return (
                <li key={key}>
                  <Link
                    href={`/${locale}/agents/${key}`}
                    className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 transition-colors hover:bg-brand-soft"
                  >
                    <AgentAvatar agent={agent} size="md" />
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold tracking-wide">
                        <bdi dir="ltr">{agent.name}</bdi>
                      </span>
                      <span className="block truncate text-xs text-muted">{t.agents[key].role}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </Section>

      <Section className="space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.processTitle}</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.web.appsPage.approach.map((step, i) => (
            <li key={step.title} className="space-y-2 rounded-ix border border-line bg-surface p-6">
              <p dir="ltr" className="ix-gradient-text text-start text-3xl font-extrabold rtl:text-end">
                0{i + 1}
              </p>
              <h3 className="text-lg font-extrabold tracking-tight">{step.title}</h3>
              <p className="text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="max-w-4xl space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.faqTitle}</h2>
        <FaqList items={detail.faq} />
      </Section>
    </SiteChrome>
  );
}
