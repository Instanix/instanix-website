import { buttonClass } from "@ix/ui";
import { ArrowUpRight, CalendarDays, Check, CircleCheck, Cpu, ScanLine } from "lucide-react";
import { FlowCanvas } from "@/components/flow-canvas";
import { PageHero, Section, SiteChrome } from "@/components/site-chrome";
import { loadPage, pageMetadata, type LocaleParams } from "@/lib/page";

/**
 * One case study: a system that is live and that Instanix actually built.
 * The page describes how the work changes. It states no counts and no percentages:
 * nothing here has been measured well enough to publish.
 */
const SCANNO_URL = "https://scanno.qa";

/** Image and icon for each of the four steps, in order. */
const STEP_ART = [
  { shot: "team", icon: CalendarDays },
  { shot: "inspection", icon: ScanLine },
  { shot: "analysis", icon: Cpu },
  { shot: "report", icon: CircleCheck },
] as const;

const heading = "text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl";

export function generateMetadata({ params }: LocaleParams) {
  return pageMetadata(params, "/work", (t) => ({ title: t.web.workPage.eyebrow, description: t.web.workPage.scanno.summary }));
}

function Shot({ name, alt, className = "" }: { readonly name: string; readonly alt: string; readonly className?: string }) {
  return (
    <img
      src={`/work/scanno/${name}.webp`}
      srcSet={`/work/scanno/${name}-sm.webp 800w, /work/scanno/${name}.webp 1600w`}
      sizes="(min-width: 1024px) 600px, 100vw"
      alt={alt}
      width={1600}
      height={900}
      loading="lazy"
      decoding="async"
      className={`aspect-video w-full rounded-[2rem] border border-line object-cover shadow-ix ${className}`}
    />
  );
}

export default async function WorkPage({ params }: LocaleParams) {
  const { locale, t } = await loadPage(params);
  const p = t.web.workPage;
  const s = p.scanno;

  return (
    <SiteChrome locale={locale} t={t} path="/work">
      <div className="space-y-10">
        <PageHero eyebrow={p.eyebrow} title={p.title} body={p.body} />

        {/* The project */}
        <Section>
          <div className="ix-on-ink relative overflow-hidden rounded-[2rem] bg-ink text-on-ink shadow-ix-lg">
            <img
              src="/work/scanno/arrival.webp"
              srcSet="/work/scanno/arrival-sm.webp 800w, /work/scanno/arrival.webp 1600w"
              sizes="(min-width: 1280px) 1216px, 100vw"
              alt={s.gallery.arrival}
              width={1600}
              height={900}
              fetchPriority="high"
              decoding="async"
              className="aspect-video w-full object-cover"
            />
            <div className="grid gap-8 px-7 py-10 sm:px-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14">
              <div className="space-y-5">
                <p className="text-sm font-semibold text-on-ink-muted">{s.tag}</p>
                <h2 dir="auto" className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  {s.title}
                </h2>
                <a href={SCANNO_URL} target="_blank" rel="noopener noreferrer" data-track="scanno_visit" className={buttonClass("on-ink", "lg")}>
                  {s.visit}
                  <ArrowUpRight className="size-4.5 rtl:-scale-x-100" aria-hidden="true" />
                </a>
              </div>
              <p className="text-lg leading-relaxed text-pretty text-on-ink-muted sm:text-xl">{s.summary}</p>
            </div>
          </div>
        </Section>

        {/* The four steps, each with its picture */}
        <Section className="space-y-8" reveal={false}>
          <h2 className={`ix-reveal max-w-3xl ${heading}`}>{s.stepsTitle}</h2>
          <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {s.steps.map((step, index) => {
              const art = STEP_ART[index] ?? STEP_ART[0];
              const Icon = art.icon;
              return (
                <li key={step.title} className="ix-reveal ix-spot flex flex-col overflow-hidden rounded-[2rem] border border-line bg-surface shadow-ix">
                  <img
                    src={`/work/scanno/${art.shot}-sm.webp`}
                    srcSet={`/work/scanno/${art.shot}-sm.webp 800w, /work/scanno/${art.shot}.webp 1600w`}
                    alt={s.gallery[art.shot]}
                    width={1600}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <span dir="ltr" className="font-mono text-sm font-bold text-brand-text">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="grid size-10 place-items-center rounded-xl border border-line bg-bg text-brand-text">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold tracking-tight">{step.title}</h3>
                    <p className="text-pretty text-muted">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="px-1 text-xs text-muted">{s.galleryNote}</p>
        </Section>

        {/* What it was built to do */}
        <Section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <h2 className={`${heading} lg:sticky lg:top-28 lg:self-start`}>{s.goalsTitle}</h2>
          <ol>
            {s.goals.map((goal, index) => (
              <li key={goal} className="flex items-baseline gap-5 border-b border-line py-6 first:pt-0 last:border-0">
                <span dir="ltr" className="font-mono text-sm font-bold text-brand-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xl leading-snug font-semibold text-pretty sm:text-2xl">{goal}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Time and accuracy: what changes */}
        <Section className="space-y-8">
          <h2 className={`max-w-3xl ${heading}`}>{s.gainsTitle}</h2>
          <ul className="grid gap-5 sm:grid-cols-2">
            {s.gains.map((gain) => (
              <li key={gain.title} className="ix-spot rounded-[2rem] border border-line bg-surface p-7 shadow-ix sm:p-9">
                <h3 className="text-2xl font-extrabold tracking-tight">{gain.title}</h3>
                <p className="mt-2 text-base text-pretty text-muted sm:text-lg">{gain.body}</p>
              </li>
            ))}
          </ul>
          <p className="px-1 text-xs text-muted">{s.gainsNote}</p>
        </Section>

        {/* AI across the inspection */}
        <Section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <h2 className={`${heading} lg:sticky lg:top-28 lg:self-start`}>{s.stagesTitle}</h2>
          <ol>
            {s.stages.map((stage, index) => (
              <li key={stage.when} className="grid grid-cols-[auto_1fr] gap-x-5 border-b border-line py-6 first:pt-0 last:border-0">
                <span dir="ltr" className="font-mono text-sm leading-8 font-bold text-brand-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-extrabold tracking-tight">{stage.when}</h3>
                  <p className="text-base text-pretty text-muted sm:text-lg">{stage.does}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* The inspection, as a workflow the visitor can run */}
        <Section className="space-y-6">
          <h2 className={`max-w-3xl ${heading}`}>{t.web.flow.scenarios.inspection.name}</h2>
          <FlowCanvas copy={t.web.flow} flows={["inspection"]} />
          <p className="px-1 text-xs text-muted">{t.web.flow.note}</p>
        </Section>

        {/* The person in the loop */}
        <Section>
          <div className="ix-on-ink relative overflow-hidden rounded-[2rem] bg-ink px-7 py-12 text-on-ink shadow-ix-lg sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(44rem_24rem_at_100%_0%,color-mix(in_srgb,var(--ix-brand)_55%,transparent),transparent_70%)]"
            />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
              <div className="space-y-4">
                <h2 className={heading}>{s.humanTitle}</h2>
                <p className="text-lg text-pretty text-on-ink-muted sm:text-xl">{s.humanBody}</p>
              </div>
              <ul className="space-y-5">
                {s.human.map((item) => (
                  <li key={item} className="flex gap-4 text-lg leading-snug font-semibold text-pretty sm:text-xl">
                    <Check className="mt-1 size-5 shrink-0 text-cyan" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Guardrails */}
        <Section className="space-y-8">
          <h2 className={`max-w-3xl ${heading}`}>{s.guardsTitle}</h2>
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {s.guards.map((guard) => (
              <li key={guard.title} className="space-y-2 border-t-2 border-line pt-5">
                <h3 className="text-lg font-extrabold tracking-tight">{guard.title}</h3>
                <p className="text-pretty text-muted">{guard.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* Lessons from running it */}
        <Section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <h2 className={`${heading} lg:sticky lg:top-28 lg:self-start`}>{s.lessonsTitle}</h2>
          <div className="space-y-8">
            <ol>
              {s.lessons.map((lesson, index) => (
                <li key={lesson} className="flex items-baseline gap-5 border-b border-line py-6 first:pt-0 last:border-0">
                  <span dir="ltr" className="font-mono text-sm font-bold text-brand-text">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg leading-snug text-pretty sm:text-xl">{lesson}</span>
                </li>
              ))}
            </ol>
            <p className="text-2xl leading-snug font-bold tracking-tight text-balance sm:text-3xl">{s.lessonsNote}</p>
          </div>
        </Section>

        {/* Technology */}
        <Section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          <div className="space-y-6">
            <h2 className={heading}>{s.techTitle}</h2>
            <dl>
              {s.tech.map((row) => (
                <div key={row.label} className="grid gap-1 border-b border-line py-4 first:pt-0 last:border-0 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="text-sm font-semibold text-muted">{row.label}</dt>
                  <dd className="font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Shot name="team" alt={s.gallery.team} />
        </Section>
      </div>
    </SiteChrome>
  );
}
