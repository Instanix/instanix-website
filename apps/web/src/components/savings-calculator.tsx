"use client";

import type { Dictionary, Locale } from "@ix/i18n";
import { buttonClass } from "@ix/ui";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type CSSProperties } from "react";
import { fill, saveAssessmentDraft } from "@/lib/assessment-draft";

type Copy = Dictionary["web"]["calc"];

const WORKING_DAYS = 26;
const HOURS_PER_DAY = 8;

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly display: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-semibold text-fg-soft">
          {label}
        </label>
        <output htmlFor={id} className="text-xl font-extrabold tracking-tight tabular-nums">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="ix-range w-full"
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
    </div>
  );
}

/**
 * Estimates the hours a team could get back. The arithmetic is shown to the visitor and
 * labelled as an estimate; nothing here is a promise or a price.
 */
export function SavingsCalculator({ locale, copy }: { readonly locale: Locale; readonly copy: Copy }) {
  const router = useRouter();
  const [messages, setMessages] = useState(120);
  const [minutes, setMinutes] = useState(4);
  const [team, setTeam] = useState(3);
  const [share, setShare] = useState(50);

  const teamHours = team * HOURS_PER_DAY * WORKING_DAYS;
  // Time spent on messages can never be more than the team actually works.
  const spent = Math.min((messages * minutes * WORKING_DAYS) / 60, teamHours);
  const saved = Math.round((spent * share) / 100);
  const days = Math.round(saved / HOURS_PER_DAY);
  const teamShare = teamHours > 0 ? Math.round((saved / teamHours) * 100) : 0;
  const number = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en");

  function send() {
    saveAssessmentDraft(fill(copy.draft, { messages, minutes, team }));
    router.push(`/${locale}/assessment`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
      <div className="ix-glass-strong space-y-7 rounded-ix-lg p-6 sm:p-8">
        <Slider label={copy.messages} value={messages} display={number.format(messages)} min={10} max={1000} step={10} onChange={setMessages} />
        <Slider label={copy.minutes} value={minutes} display={number.format(minutes)} min={1} max={15} step={1} onChange={setMinutes} />
        <Slider label={copy.team} value={team} display={number.format(team)} min={1} max={30} step={1} onChange={setTeam} />
        <Slider label={copy.share} value={share} display={`${number.format(share)}%`} min={20} max={80} step={5} onChange={setShare} />
      </div>

      <div className="relative flex flex-col overflow-hidden rounded-ix-lg bg-ink p-6 text-on-ink sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(24rem_16rem_at_80%_0%,color-mix(in_srgb,var(--ix-cyan)_35%,transparent),transparent_70%)]"
        />
        <p className="relative text-sm font-semibold text-on-ink-muted">{copy.resultTitle}</p>
        <p aria-live="polite" className="relative mt-3 flex items-baseline gap-3">
          <span className="text-7xl leading-none font-extrabold tracking-tighter tabular-nums sm:text-8xl">{number.format(saved)}</span>
          <span className="text-xl font-bold text-on-ink-muted">{copy.hours}</span>
        </p>
        <dl className="relative mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-ink-line bg-white/5 p-4">
            <dd className="text-3xl font-extrabold tabular-nums">{number.format(days)}</dd>
            <dt className="mt-1 text-xs text-on-ink-muted">{copy.days}</dt>
          </div>
          <div className="rounded-2xl border border-ink-line bg-white/5 p-4">
            <dd className="text-3xl font-extrabold tabular-nums">{number.format(teamShare)}%</dd>
            <dt className="mt-1 text-xs text-on-ink-muted">{copy.teamShare}</dt>
          </div>
        </dl>
        <p className="relative mt-5 text-xs leading-relaxed text-on-ink-muted">{copy.assumptions}</p>
        <button type="button" onClick={send} className={buttonClass("primary", "md", "relative mt-6 w-full")}>
          {copy.cta}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
