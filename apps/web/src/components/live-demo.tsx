"use client";

import { getAgent } from "@ix/agents";
import type { Dictionary, Locale } from "@ix/i18n";
import { AgentAvatar, buttonClass, cn } from "@ix/ui";
import {
  ArrowUp,
  BatteryFull,
  Check,
  CheckCheck,
  ChevronLeft,
  Mic,
  Phone,
  Play,
  Plus,
  RotateCcw,
  Signal,
  Video,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { fill } from "@/lib/assessment-draft";
import { DEMO_SCENARIOS, DEMO_SCRIPTS, type CrmField, type DemoStep } from "@/lib/demo-script";
import type { DemoScenarioKey } from "@/lib/industries";

type Copy = Dictionary["web"]["demo"];

const CRM_FIELDS: readonly CrmField[] = ["source", "need", "details", "booking", "status"];

/** Mirrors the limits enforced by the server (@ix/ai demo-chat). */
const MAX_TURNS = 6;
const MAX_LENGTH = 400;

interface ChatMessage {
  readonly role: "customer" | "agent";
  readonly text: string;
}

/** How long each beat stays on screen before the next one. Agent replies include "typing" time. */
function delayFor(step: DemoStep): number {
  if (step.kind === "agent") return 1500;
  if (step.kind === "customer") return 1100;
  return 750;
}

function Bubble({ mine, children }: { readonly mine: boolean; readonly children: string }) {
  return (
    <div className={cn("ix-anim-in flex", mine ? "justify-end" : "justify-start")}>
      <p
        dir="auto"
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-ix-sm",
          mine ? "rounded-ee-md bg-[#d8fdd2] text-[#0b1220]" : "rounded-es-md bg-surface text-fg",
        )}
      >
        {children}
        {mine ? <CheckCheck className="ms-1.5 inline size-3.5 text-[#3497f9]" aria-hidden="true" /> : null}
      </p>
    </div>
  );
}

/**
 * The phone demo, in two modes. "Watch" plays a scripted conversation next to the CRM
 * record and agent activity. "Try" lets the visitor chat with a real model that plays the
 * agent for a fictional business, for a few turns. Both are labelled as demos.
 */
export function LiveDemo({
  locale,
  copy,
  initial,
  scenarios = DEMO_SCENARIOS,
}: {
  readonly locale: Locale;
  readonly copy: Copy;
  readonly initial?: DemoScenarioKey;
  /** Limit the picker (an industry page shows only its own scenario). */
  readonly scenarios?: readonly DemoScenarioKey[];
}) {
  const [scenario, setScenario] = useState<DemoScenarioKey>(initial ?? scenarios[0] ?? "automotive");
  const [mode, setMode] = useState<"watch" | "try">("watch");
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [chat, setChat] = useState<readonly ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const script = DEMO_SCRIPTS[scenario];
  const lines = copy.scenarios[scenario].lines;
  const business = copy.scenarios[scenario].business;
  const finished = shown >= script.length;
  const next = script[shown];
  const trying = mode === "try";
  const turns = chat.filter((message) => message.role === "customer").length;
  const spent = turns >= MAX_TURNS;

  useEffect(() => {
    if (!playing || !next) return;
    const timer = window.setTimeout(() => setShown((count) => count + 1), delayFor(next));
    return () => window.clearTimeout(timer);
  }, [playing, next]);

  useEffect(() => {
    const view = chatRef.current;
    if (view) view.scrollTop = view.scrollHeight;
  }, [shown, playing, chat, sending]);

  function play() {
    // People who prefer reduced motion get the finished state instead of the animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(script.length);
      setPlaying(false);
      return;
    }
    setShown(0);
    setPlaying(true);
  }

  function reset() {
    setShown(0);
    setPlaying(false);
    setChat([]);
    setDraft("");
    setProblem(null);
  }

  function choose(key: DemoScenarioKey) {
    setScenario(key);
    reset();
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim().slice(0, MAX_LENGTH);
    if (!text || sending || spent) return;
    const messages: ChatMessage[] = [...chat, { role: "customer", text }];
    setChat(messages);
    setDraft("");
    setProblem(null);
    setSending(true);
    try {
      const response = await fetch("/api/v1/demo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, scenario, messages }),
      });
      if (!response.ok) {
        setProblem(response.status === 429 ? copy.live.rateLimited : response.status === 503 ? copy.live.unavailable : copy.live.error);
        return;
      }
      const data: unknown = await response.json();
      const reply = typeof data === "object" && data !== null && "reply" in data && typeof data.reply === "string" ? data.reply : null;
      if (!reply) {
        setProblem(copy.live.error);
        return;
      }
      setChat([...messages, { role: "agent", text: reply }]);
    } catch {
      setProblem(copy.live.error);
    } finally {
      setSending(false);
    }
  }

  const visible = script.slice(0, shown).map((step, index) => ({ step, text: lines[index] ?? "", index }));
  const scripted = visible.filter(({ step }) => step.kind === "customer" || step.kind === "agent");
  const events = visible.filter(({ step }) => step.kind === "event");
  const record = new Map<CrmField, { text: string; index: number }>();
  for (const { step, text, index } of visible) {
    if (step.kind === "crm") record.set(step.field, { text, index });
  }
  const typing = trying ? sending : playing && next?.kind === "agent";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {scenarios.length > 1 ? (
          <div role="group" aria-label={copy.scenarioLabel} className="flex flex-wrap gap-2">
            {scenarios.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={key === scenario}
                onClick={() => choose(key)}
                className={buttonClass(key === scenario ? "primary" : "secondary", "sm", "h-10")}
              >
                {copy.scenarios[key].name}
              </button>
            ))}
          </div>
        ) : null}
        {/* Watch or try */}
        <div role="group" className="ix-btn-glass ms-auto flex rounded-full p-1">
          {(["watch", "try"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={mode === key}
              onClick={() => {
                setMode(key);
                reset();
              }}
              className={cn(
                "h-8 rounded-full px-3.5 text-xs font-bold transition-colors duration-300",
                mode === key ? "bg-primary text-on-primary" : "text-fg-soft hover:text-fg",
              )}
            >
              {key === "watch" ? copy.live.tabWatch : copy.live.tabTry}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[23rem_1fr] lg:items-center">
        {/* Phone: a titanium-frame handset. The chat avatar is the Instanix mark. */}
        <div className="ix-phone mx-auto w-full max-w-[21.5rem]">
          <div className="relative flex h-[41rem] flex-col overflow-hidden rounded-[2.85rem] bg-surface">
            <div dir="ltr" aria-hidden="true" className="relative flex h-12 shrink-0 items-end justify-between px-7 pb-1.5 text-[0.8rem] font-semibold text-fg">
              <span>9:41</span>
              <span className="absolute inset-x-0 top-2.5 mx-auto h-7 w-28 rounded-full bg-black" />
              <span className="flex items-center gap-1.5">
                <Signal className="size-3.5" />
                <Wifi className="size-3.5" />
                <BatteryFull className="size-5" />
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2.5 border-b border-line bg-surface px-3 pb-2.5">
              <ChevronLeft className="size-6 shrink-0 text-brand-text rtl:rotate-180" aria-hidden="true" />
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-ix-sm ring-1 ring-line">
                <img src="/brand/mark.webp" alt="" width={223} height={256} className="h-6 w-auto" />
              </span>
              <div className="min-w-0 flex-1">
                <p dir="ltr" className="truncate text-start text-sm font-bold rtl:text-end">
                  {business}
                </p>
                <p className="truncate text-xs text-muted">{typing ? copy.typing : copy.online}</p>
              </div>
              <Video className="size-5 shrink-0 text-brand-text" aria-hidden="true" />
              <Phone className="size-5 shrink-0 text-brand-text" aria-hidden="true" />
            </div>

            <div ref={chatRef} data-lenis-prevent aria-live="polite" className="ix-chat-wall flex-1 space-y-2.5 overflow-y-auto p-3">
              {trying ? (
                <>
                  <Bubble mine={false}>{fill(copy.live.greeting, { business })}</Bubble>
                  {chat.map((message, index) => (
                    <Bubble key={index} mine={message.role === "customer"}>
                      {message.text}
                    </Bubble>
                  ))}
                </>
              ) : (
                scripted.map(({ step, text, index }) => (
                  <Bubble key={index} mine={step.kind === "customer"}>
                    {text}
                  </Bubble>
                ))
              )}
              {typing ? (
                <div className="ix-anim-in flex justify-start">
                  <p className="flex gap-1 rounded-2xl rounded-es-md bg-surface px-4 py-3 shadow-ix-sm" aria-label={copy.typing}>
                    <span className="ix-typing-dot" />
                    <span className="ix-typing-dot [animation-delay:150ms]" />
                    <span className="ix-typing-dot [animation-delay:300ms]" />
                  </p>
                </div>
              ) : null}
              {trying && problem ? (
                <p role="alert" className="ix-anim-in rounded-xl bg-[color-mix(in_srgb,var(--ix-danger)_12%,var(--ix-surface))] px-3 py-2 text-center text-xs font-semibold text-danger">
                  {problem}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 bg-surface px-3 pt-2 pb-1.5">
              {trying ? (
                <form onSubmit={send} className="flex items-center gap-2">
                  <label htmlFor="demo-chat-input" className="sr-only">
                    {copy.live.placeholder}
                  </label>
                  <input
                    id="demo-chat-input"
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.currentTarget.value)}
                    maxLength={MAX_LENGTH}
                    disabled={spent}
                    autoComplete="off"
                    placeholder={copy.live.placeholder}
                    className="h-10 min-w-0 flex-1 rounded-full border border-line bg-surface-2 px-4 text-sm outline-none placeholder:text-muted focus:border-brand disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending || spent}
                    aria-label={copy.live.send}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition-[opacity,transform] active:scale-95 disabled:opacity-40"
                  >
                    <ArrowUp className="size-5" aria-hidden="true" />
                  </button>
                </form>
              ) : (
                <div aria-hidden="true" className="flex items-center gap-2">
                  <Plus className="size-6 shrink-0 text-brand-text" />
                  <span className="h-9 flex-1 rounded-full border border-line bg-surface-2" />
                  <Mic className="size-5 shrink-0 text-brand-text" />
                </div>
              )}
              <span aria-hidden="true" className="mx-auto mt-2.5 block h-1 w-32 rounded-full bg-fg/80" />
            </div>
          </div>
        </div>

        {trying ? (
          <div className="ix-glass-strong space-y-4 rounded-ix-lg p-6 sm:p-8">
            <h3 className="text-2xl font-extrabold tracking-tight">{copy.live.tabTry}</h3>
            <p className="text-fg-soft">{copy.live.notice}</p>
            <p aria-live="polite" className="text-sm font-bold text-brand-text tabular-nums">
              {spent ? copy.live.limit : fill(copy.live.remaining, { count: MAX_TURNS - turns })}
            </p>
            <Link href={`/${locale}/assessment`} className={buttonClass(spent ? "primary" : "secondary", "md")}>
              {copy.cta}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <button type="button" onClick={play} disabled={playing && !finished} className={buttonClass("primary", "md")}>
              {finished ? <RotateCcw className="size-4" aria-hidden="true" /> : <Play className="size-4 rtl:rotate-180" aria-hidden="true" />}
              {finished ? copy.replay : copy.play}
            </button>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="ix-glass-strong rounded-ix-lg p-5">
                <h3 className="text-sm font-extrabold tracking-widest text-fg-soft uppercase">{copy.crmTitle}</h3>
                <dl className="mt-4 space-y-3">
                  {CRM_FIELDS.map((field) => {
                    const value = record.get(field);
                    return (
                      <div key={field} className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                        <dt className="shrink-0 text-sm text-muted">{copy.fields[field]}</dt>
                        <dd key={value?.index ?? "empty"} className={cn("text-end text-sm font-bold", value ? "ix-anim-flash text-fg" : "text-muted")}>
                          {value?.text ?? copy.empty}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              <div className="ix-glass-strong rounded-ix-lg p-5">
                <h3 className="text-sm font-extrabold tracking-widest text-fg-soft uppercase">{copy.activityTitle}</h3>
                {events.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">{copy.activityEmpty}</p>
                ) : (
                  <ol className="mt-4 space-y-3">
                    {events.map(({ step, text, index }) =>
                      step.kind === "event" ? (
                        <li key={index} className="ix-anim-in flex items-center gap-3">
                          <AgentAvatar agent={getAgent(step.agent)} size="sm" />
                          <p className="min-w-0 flex-1 text-sm font-semibold">{text}</p>
                          <Check className="size-4 shrink-0 text-success" aria-hidden="true" />
                        </li>
                      ) : null,
                    )}
                  </ol>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted">{trying ? copy.live.notice : copy.note}</p>
    </div>
  );
}
