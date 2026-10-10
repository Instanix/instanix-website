import { AGENT_KEYS, getAgent, type AgentKey } from "@ix/agents";
import type { Dictionary, Locale } from "@ix/i18n";
import { AgentFigure, buttonClass, Eyebrow, Logo } from "@ix/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BOOKING_URL, CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/env";
import { leadsEnabled } from "@/lib/server/leads";
import { MotionRoot } from "./motion";
import { SiteHeader, siteLinks } from "./site-header";
import { SiteStats } from "./site-stats";
import { ZeusLauncher } from "./zeus-launcher";

export function Section({
  id,
  className = "",
  reveal = true,
  children,
}: {
  readonly id?: string;
  readonly className?: string;
  /** Fade the section in the first time it scrolls into view. */
  readonly reveal?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${reveal ? "ix-reveal" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function Heading({ children, as: Tag = "h2" }: { readonly children: ReactNode; readonly as?: "h1" | "h2" }) {
  return (
    <Tag className="text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">{children}</Tag>
  );
}

/** Section intro block: eyebrow, heading, lead paragraph. */
export function Intro({
  eyebrow,
  title,
  body,
  children,
}: {
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly body?: string;
  readonly children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl space-y-4">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading>{title}</Heading>
      {body ? <p className="text-lg text-pretty text-muted">{body}</p> : null}
      {children}
    </div>
  );
}

/** Top-of-page hero for inner pages: copy on one side, optional art on the other. */
export function PageHero({
  eyebrow,
  title,
  body,
  art,
  children,
}: {
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly body: string;
  readonly art?: ReactNode;
  readonly children?: ReactNode;
}) {
  const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;
  return (
    <div className="relative isolate -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
      <div aria-hidden="true" className="ix-stage-light absolute inset-0 -z-10" />
      <Section reveal={false} className="grid items-center gap-8 pt-14 pb-6 sm:pt-20 lg:grid-cols-[1.15fr_auto] lg:gap-12">
        <div className="max-w-3xl space-y-6">
          <div className="ix-rise">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h1 className="ix-rise text-5xl leading-[1.04] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl" style={delay(0.08)}>
            {title}
          </h1>
          <p className="ix-rise max-w-2xl text-lg text-pretty text-fg-soft sm:text-xl" style={delay(0.16)}>
            {body}
          </p>
          {children ? (
            <div className="ix-rise flex flex-wrap gap-3" style={delay(0.24)}>
              {children}
            </div>
          ) : null}
        </div>
        {art ? (
          <div className="ix-rise relative flex h-64 items-end justify-center sm:h-80 lg:h-[28rem]" style={delay(0.2)}>
            <span
              aria-hidden="true"
              className="absolute inset-x-[-10%] bottom-[-4%] h-[16%] rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--ix-brand)_55%,transparent),transparent)] blur-xl"
            />
            {art}
          </div>
        ) : null}
      </Section>
    </div>
  );
}

function ClosingCta({ locale, t }: { readonly locale: Locale; readonly t: Dictionary }) {
  const c = t.web.cta;
  return (
    <Section>
      <div className="ix-on-ink relative overflow-hidden rounded-[2rem] bg-ink text-on-ink shadow-ix-lg">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(46rem_24rem_at_85%_110%,color-mix(in_srgb,var(--ix-brand)_55%,transparent),transparent_70%),radial-gradient(30rem_18rem_at_0%_0%,color-mix(in_srgb,var(--ix-cyan)_22%,transparent),transparent_70%)]"
        />
        <div className="relative grid items-end gap-6 px-8 pt-10 sm:px-12 lg:grid-cols-[1fr_auto] lg:pt-14">
          <div className="space-y-5 pb-10 lg:pb-14">
            <Heading>
              <span className="block">{c.line1}</span>
              <span className="block">
                {c.line2} <span className="ix-gradient-text">{c.accent}</span>
              </span>
            </Heading>
            <p className="max-w-xl text-lg text-on-ink-muted">{c.body}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
                {c.primary}
                <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
              </Link>
              <Link href={`/${locale}/agents`} className={buttonClass("on-ink", "lg")}>
                {c.secondary}
              </Link>
            </div>
          </div>
          <div className="flex h-56 items-end justify-center sm:h-72 lg:h-80">
            <AgentFigure agent={getAgent("athena")} className="-me-10 h-[82%]" />
            <AgentFigure agent={getAgent("zeus")} className="relative z-10" />
            <AgentFigure agent={getAgent("hermes")} className="-ms-10 h-[82%]" />
          </div>
        </div>
      </div>
    </Section>
  );
}

function SiteFooter({ locale, t }: { readonly locale: Locale; readonly t: Dictionary }) {
  const f = t.web.footer;
  return (
    <footer className="bg-ink text-on-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Logo tone="on-ink" className="text-lg" />
          <p className="text-sm text-on-ink-muted">{t.common.tagline}</p>
        </div>
        <nav aria-label={f.navLabel}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-on-ink-muted">
            {[
              ...siteLinks(locale, t),
              { href: `/${locale}/solutions`, label: t.web.nav.solutions },
              { href: `/${locale}/integrations`, label: t.web.nav.integrations },
              { href: `/${locale}/insights`, label: t.web.nav.insights },
              { href: `/${locale}/about`, label: t.web.nav.about },
              { href: `/${locale}/faq`, label: t.web.nav.faq },
              { href: `/${locale}/privacy`, label: t.web.nav.privacy },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-on-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-1 text-sm text-on-ink-muted lg:text-end">
          <p>{f.statement}</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="transition-colors hover:text-on-ink">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            <span dir="ltr">© {new Date().getFullYear()} Instanix.</span> {f.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Header, main landmark, closing call-to-action and footer shared by every public page. */
export function SiteChrome({
  locale,
  t,
  path = "",
  children,
}: {
  readonly locale: Locale;
  readonly t: Dictionary;
  readonly path?: string;
  readonly children: ReactNode;
}) {
  return (
    <>
      <MotionRoot />
      <SiteStats locale={locale} />
      <SiteHeader locale={locale} t={t} path={path} />
      <main id="main" className="flex flex-col gap-20 pb-24 sm:gap-28">
        {children}
        <ClosingCta locale={locale} t={t} />
      </main>
      <SiteFooter locale={locale} t={t} />
      {/* The assessment page already shows the form, so the floating launcher is hidden there. */}
      {path === "/assessment" ? null : (
        <ZeusLauncher
          locale={locale}
          copy={t.web.assessment}
          roles={Object.fromEntries(AGENT_KEYS.map((key) => [key, t.agents[key].role])) as Record<AgentKey, string>}
          bookingUrl={BOOKING_URL}
          whatsappNumber={WHATSAPP_NUMBER}
          leadsEnabled={leadsEnabled()}
        />
      )}
    </>
  );
}
