"use client";

import { getAgent, isAgentKey, type AgentKey } from "@ix/agents";
import type { Dictionary, Locale } from "@ix/i18n";
import { AgentAvatar, Badge, buttonClass, Card } from "@ix/ui";
import { CalendarCheck, CircleCheck, Link2, LockKeyhole, MessageCircle, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ASSESSMENT_DRAFT_KEY } from "./hero-stage";

type Copy = Dictionary["web"]["assessment"];

/** Mirrors the API contract in @ix/ai (kept structural here so the client bundle stays free of server code). */
interface AssessmentView {
  readonly inScope: boolean;
  readonly summary: string;
  readonly challenges: readonly string[];
  readonly team: readonly { readonly agent: AgentKey; readonly reason: string }[];
  readonly plan: readonly { readonly title: string; readonly description: string }[];
  readonly integrations: readonly string[];
  readonly requirements: readonly string[];
}

/** What the visitor entered, kept so it can be saved with their contact details if they ask for the full report. */
interface AssessmentInputView {
  readonly locale: Locale;
  readonly industry: string;
  readonly companySize: string;
  readonly country: string;
  readonly problem: string;
  readonly tools: string;
}

type State =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string; readonly reference?: string }
  | {
      readonly status: "done";
      readonly id: string | null;
      readonly input: AssessmentInputView;
      readonly assessment: AssessmentView;
      readonly unlocked: boolean;
    };

const PROBLEM_MIN = 30;
const PROBLEM_MAX = 1500;
const TOOLS_MAX = 300;

const FIELD =
  "h-12 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-base text-fg transition-colors focus:border-brand focus:outline-none";

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

/** The server validates its own output; this only guards the UI against a malformed response. */
function toView(value: unknown): AssessmentView | null {
  const v = record(value);
  if (typeof v.summary !== "string" || typeof v.inScope !== "boolean") return null;
  const team = Array.isArray(v.team)
    ? v.team.flatMap((member: unknown) => {
        const m = record(member);
        return isAgentKey(m.agent) && typeof m.reason === "string" ? [{ agent: m.agent, reason: m.reason }] : [];
      })
    : [];
  const plan = Array.isArray(v.plan)
    ? v.plan.flatMap((step: unknown) => {
        const s = record(step);
        return typeof s.title === "string" && typeof s.description === "string" ? [{ title: s.title, description: s.description }] : [];
      })
    : [];
  return {
    inScope: v.inScope,
    summary: v.summary,
    challenges: strings(v.challenges),
    team,
    plan,
    integrations: strings(v.integrations),
    requirements: strings(v.requirements),
  };
}

function Select({
  name,
  label,
  placeholder,
  options,
}: {
  readonly name: string;
  readonly label: string;
  readonly placeholder: string;
  readonly options: Readonly<Record<string, string>>;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-bold">{label}</span>
      <select name={name} required defaultValue="" className={FIELD}>
        <option value="" disabled>
          {placeholder}
        </option>
        {Object.entries(options).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ErrorNote({ message, reference, referenceLabel }: { readonly message: string; readonly reference?: string; readonly referenceLabel: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/8 px-4 py-3 text-sm">
      <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-danger" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold">{message}</p>
        {reference ? (
          <p className="text-xs text-muted">
            {referenceLabel}:{" "}
            <code dir="ltr" className="font-mono">
              {reference}
            </code>
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Contact form that unlocks the full report. Saves the lead only with explicit consent. */
function ReportGate({
  copy,
  id,
  input,
  assessment,
  onUnlocked,
}: {
  readonly copy: Copy;
  readonly id: string;
  readonly input: AssessmentInputView;
  readonly assessment: AssessmentView;
  readonly onUnlocked: () => void;
}) {
  const g = copy.gate;
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const phone = text(data.get("phone")).trim();
    const email = text(data.get("email")).trim();
    if (!phone && !email) {
      setError(g.errorContact);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: id,
          contact: { name: text(data.get("name")), company: text(data.get("company")), phone, email, consent: data.get("consent") === "on" },
          input,
          assessment,
          website: text(data.get("website")),
        }),
      });
      if (response.ok) {
        onUnlocked();
        return;
      }
      const body: unknown = await response.json().catch(() => null);
      setError(record(record(body).error).code === "invalid_input" ? g.errorInvalid : g.error);
    } catch {
      setError(g.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="border-brand/40 p-6 sm:p-8">
      <form onSubmit={submit} className="space-y-5" aria-busy={sending}>
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--ix-cyan),var(--ix-primary))] text-white shadow-ix-glow">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold tracking-tight">{g.title}</h3>
            <p className="text-muted">{g.body}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-bold">{g.name}</span>
            <input name="name" type="text" required minLength={2} maxLength={80} autoComplete="name" className={FIELD} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold">{g.company}</span>
            <input name="company" type="text" maxLength={120} autoComplete="organization" className={FIELD} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold">{g.phone}</span>
            <input name="phone" type="tel" dir="ltr" inputMode="tel" maxLength={24} autoComplete="tel" placeholder="+971 50 123 4567" className={FIELD} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold">{g.email}</span>
            <input name="email" type="email" dir="ltr" maxLength={254} autoComplete="email" placeholder="name@company.com" className={FIELD} />
          </label>
        </div>
        <p className="text-xs text-muted">{g.contactHint}</p>
        <label className="flex items-start gap-3 text-sm">
          <input name="consent" type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-[var(--ix-primary)]" />
          <span>{g.consent}</span>
        </label>
        <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {error ? <ErrorNote message={error} referenceLabel={copy.errors.reference} /> : null}
        <button type="submit" disabled={sending} className={buttonClass("primary", "lg")}>
          <LockKeyhole className="size-4.5" aria-hidden="true" />
          {g.submit}
        </button>
      </form>
    </Card>
  );
}

function Report({ children }: { readonly children: ReactNode }) {
  return <div className="ix-anim-in space-y-6">{children}</div>;
}

export function AssessmentForm({
  locale,
  copy,
  roles,
  bookingUrl,
  whatsappNumber,
  leadsEnabled,
}: {
  readonly locale: Locale;
  readonly copy: Copy;
  readonly roles: Readonly<Record<AgentKey, string>>;
  readonly bookingUrl: string | null;
  readonly whatsappNumber: string | null;
  /** When lead storage is configured, the full report is unlocked by leaving contact details. */
  readonly leadsEnabled: boolean;
}) {
  const [state, setState] = useState<State>({ status: "idle" });
  const [problemLength, setProblemLength] = useState(0);
  const problemRef = useRef<HTMLTextAreaElement>(null);

  // A sentence typed in the home page hero is carried over once.
  useEffect(() => {
    try {
      const draft = window.sessionStorage.getItem(ASSESSMENT_DRAFT_KEY);
      if (!draft || !problemRef.current) return;
      window.sessionStorage.removeItem(ASSESSMENT_DRAFT_KEY);
      problemRef.current.value = draft;
      setProblemLength(draft.length);
    } catch {
      // Storage can be blocked; the form just starts empty.
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: AssessmentInputView = {
      locale,
      industry: text(data.get("industry")),
      companySize: text(data.get("companySize")),
      country: text(data.get("country")),
      problem: text(data.get("problem")),
      tools: text(data.get("tools")),
    };
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/v1/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, website: text(data.get("website")) }),
      });
      const body = record(await response.json().catch(() => null));
      const reference = typeof body.correlationId === "string" ? body.correlationId : undefined;

      if (!response.ok) {
        const code = record(body.error).code;
        const message =
          code === "invalid_input"
            ? copy.errors.invalid
            : code === "rate_limited"
              ? copy.errors.rate_limited
              : code === "not_configured"
                ? copy.errors.not_configured
                : copy.errors.generic;
        setState({ status: "error", message, ...(reference ? { reference } : {}) });
        return;
      }

      const assessment = toView(body.assessment);
      if (!assessment) {
        setState({ status: "error", message: copy.errors.generic, ...(reference ? { reference } : {}) });
        return;
      }
      // Nothing to unlock when the request is out of scope or lead storage is off.
      const gated = leadsEnabled && assessment.inScope && reference !== undefined;
      setState({ status: "done", id: reference ?? null, input, assessment, unlocked: !gated });
    } catch {
      // Network failure: nothing was sent or saved.
      setState({ status: "error", message: copy.errors.generic });
    }
  }

  if (state.status === "done") {
    const a = state.assessment;
    const r = copy.result;
    // The visitor reviews and sends this themselves in WhatsApp; the site does not send it.
    const whatsappText = [
      r.whatsappMessage,
      a.summary.slice(0, 600),
      a.team.length > 0 ? `${r.team}: ${a.team.map(({ agent }) => getAgent(agent).name).join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}` : null;

    return (
      <div className="space-y-6" aria-live="polite">
        <Card className="space-y-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <AgentAvatar agent={getAgent("zeus")} size="lg" />
            <div className="space-y-1">
              <Badge tone="brand">{r.badge}</Badge>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{a.inScope ? r.title : r.outOfScope}</h2>
            </div>
          </div>
          <p className="text-lg text-pretty text-fg-soft">{a.summary}</p>
          {a.challenges.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold tracking-widest text-fg-soft uppercase">{r.challenges}</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {a.challenges.map((challenge) => (
                  <li key={challenge} className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-4 py-3 text-sm">
                    <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-warning" aria-hidden="true" />
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        {!state.unlocked && state.id ? (
          <ReportGate
            copy={copy}
            id={state.id}
            input={state.input}
            assessment={a}
            onUnlocked={() => setState({ ...state, unlocked: true })}
          />
        ) : (
          <Report>
            {a.team.length > 0 ? (
              <Card className="space-y-4 p-6 sm:p-8">
                <h3 className="text-xl font-extrabold tracking-tight">{r.team}</h3>
                <ul className="grid gap-3 md:grid-cols-2">
                  {a.team.map(({ agent: key, reason }) => {
                    const agent = getAgent(key);
                    return (
                      <li key={key}>
                        <Link
                          href={`/${locale}/agents/${key}`}
                          className="flex h-full items-start gap-4 rounded-2xl bg-surface-2 p-4 transition-colors hover:bg-brand-soft"
                        >
                          <AgentAvatar agent={agent} size="lg" />
                          <span className="min-w-0 space-y-1">
                            <span className="block font-extrabold tracking-wide">
                              <bdi dir="ltr">{agent.name}</bdi>
                            </span>
                            <span className="block text-xs font-semibold text-brand-text">{roles[key]}</span>
                            <span className="block text-sm text-fg-soft">{reason}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ) : null}

            {a.plan.length > 0 ? (
              <Card className="space-y-4 p-6 sm:p-8">
                <h3 className="text-xl font-extrabold tracking-tight">{r.plan}</h3>
                <ol className="space-y-3">
                  {a.plan.map((step, i) => (
                    <li key={step.title} className="flex gap-4">
                      <span
                        dir="ltr"
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--ix-cyan),var(--ix-primary))] text-sm font-extrabold text-white"
                      >
                        {i + 1}
                      </span>
                      <span className="space-y-0.5 pt-1">
                        <span className="block font-bold">{step.title}</span>
                        <span className="block text-sm text-muted">{step.description}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            ) : null}

            {a.integrations.length > 0 || a.requirements.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {a.integrations.length > 0 ? (
                  <Card className="space-y-3 p-6">
                    <h3 className="text-lg font-extrabold tracking-tight">{r.integrations}</h3>
                    <ul className="flex flex-wrap gap-2">
                      {a.integrations.map((item) => (
                        <li key={item} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold">
                          <Link2 className="size-3.5 text-brand-text" aria-hidden="true" />
                          <bdi>{item}</bdi>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ) : null}
                {a.requirements.length > 0 ? (
                  <Card className="space-y-3 p-6">
                    <h3 className="text-lg font-extrabold tracking-tight">{r.requirements}</h3>
                    <ul className="space-y-2">
                      {a.requirements.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm">
                          <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-brand-text" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ) : null}
              </div>
            ) : null}
          </Report>
        )}

        <Card className="space-y-4 border-brand/40 bg-brand-soft p-6 sm:p-8">
          <p className="text-xl font-extrabold tracking-tight">{r.next}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {bookingUrl ? (
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg")}>
                <CalendarCheck className="size-4.5" aria-hidden="true" />
                {r.book}
              </a>
            ) : null}
            {whatsappUrl ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "lg")}>
                <MessageCircle className="size-4.5" aria-hidden="true" />
                {r.whatsapp}
              </a>
            ) : null}
            <button type="button" onClick={() => setState({ status: "idle" })} className={buttonClass("ghost", "lg")}>
              <RotateCcw className="size-4" aria-hidden="true" />
              {r.restart}
            </button>
          </div>
          <p className="text-xs text-muted">{r.disclaimer}</p>
        </Card>
      </div>
    );
  }

  const loading = state.status === "loading";
  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={submit} className="space-y-5" aria-busy={loading}>
        <h2 className="text-2xl font-extrabold tracking-tight">{copy.form.title}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select name="industry" label={copy.form.industry} placeholder={copy.form.select} options={copy.industries} />
          <Select name="companySize" label={copy.form.companySize} placeholder={copy.form.select} options={copy.sizes} />
          <Select name="country" label={copy.form.country} placeholder={copy.form.select} options={copy.countries} />
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-bold">{copy.form.problem}</span>
          <textarea
            ref={problemRef}
            name="problem"
            required
            rows={6}
            minLength={PROBLEM_MIN}
            maxLength={PROBLEM_MAX}
            placeholder={copy.form.problemPlaceholder}
            aria-describedby="problem-hint"
            onChange={(event) => setProblemLength(event.currentTarget.value.length)}
            className={`${FIELD} h-auto py-3 leading-relaxed`}
          />
          <span className="flex justify-between gap-4 text-xs text-muted">
            <span id="problem-hint">{copy.form.problemHint}</span>
            <span dir="ltr" className="shrink-0 tabular-nums">
              {problemLength}/{PROBLEM_MAX}
            </span>
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-bold">{copy.form.tools}</span>
          <input name="tools" type="text" maxLength={TOOLS_MAX} placeholder={copy.form.toolsPlaceholder} className={FIELD} />
        </label>

        {/* Honeypot for bots: hidden from people and from assistive technology. */}
        <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        {state.status === "error" ? (
          <ErrorNote message={state.message} referenceLabel={copy.errors.reference} {...(state.reference ? { reference: state.reference } : {})} />
        ) : null}

        {loading ? (
          <div role="status" className="flex items-center gap-4 rounded-2xl bg-brand-soft p-4">
            <AgentAvatar agent={getAgent("zeus")} size="md" className="ix-anim-pulse" />
            <div>
              <p className="font-bold">{copy.loading.title}</p>
              <p className="text-sm text-muted">{copy.loading.body}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button type="submit" disabled={loading} className={buttonClass("primary", "lg", "shrink-0")}>
            <Sparkles className="size-4.5" aria-hidden="true" />
            {copy.form.submit}
          </button>
          <p className="text-xs text-muted">{copy.form.consent}</p>
        </div>
      </form>
    </Card>
  );
}
