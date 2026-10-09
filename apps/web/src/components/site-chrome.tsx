import { AGENT_KEYS, getAgent, type AgentKey } from "@ix/agents";
import type { Dictionary, Locale } from "@ix/i18n";
import { AgentFigure, buttonClass, Eyebrow, Logo } from "@ix/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BOOKING_URL, CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/env";
import { leadsEnabled } from "@/lib/server/leads";
import { MotionRoot } from "./motion";
import { SiteHeader, siteLinks } from "./site-header";
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
    <Tag className="text-3xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">{children}</Tag>
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
  return (
    <div className="relative isolate -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_75%_20%,color-mix(in_srgb,var(--ix-brand)_24%,transparent),transparent_70%)]"
      />
      <div aria-hidden="true" className="ix-grid-lines absolute inset-0 -z-10" />
      <Section reveal={false} className="grid items-center gap-8 pt-12 pb-4 sm:pt-16 lg:grid-cols-[1fr_auto] lg:gap-12">
        <div className="max-w-2xl space-y-5">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading as="h1">{title}</Heading>
          <p className="text-lg text-pretty text-fg-soft sm:text-xl">{body}</p>
          {children}
        </div>
        {art ? <div className="flex h-64 items-end justify-center sm:h-80 lg:h-[26rem]">{art}</div> : null}
      </Section>
    </div>
  );
}

function ClosingCta({ locale, t }: { readonly locale: Locale; readonly t: Dictionary }) {
  const c = t.web.cta;
  return (
    <Section>
      <div className="relative overflow-hidden rounded-ix-lg border border-line bg-[linear-gradient(120deg,var(--ix-surface),var(--ix-brand-soft))] shadow-ix-lg">
        <div aria-hidden="true" className="ix-grid-lines absolute inset-0" />
        <div className="relative grid items-end gap-6 px-8 pt-10 sm:px-12 lg:grid-cols-[1fr_auto] lg:pt-14">
          <div className="space-y-5 pb-10 lg:pb-14">
            <Heading>
              <span className="block">{c.line1}</span>
              <span className="block">
                {c.line2} <span className="ix-gradient-text">{c.accent}</span>
              </span>
            </Heading>
            <p className="max-w-xl text-lg text-muted">{c.body}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/assessment`} className={buttonClass("primary", "lg")}>
                {c.primary}
                <ArrowRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
              </Link>
              <Link href={`/${locale}/agents`} className={buttonClass("secondary", "lg")}>
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
