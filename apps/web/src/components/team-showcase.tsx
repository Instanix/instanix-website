"use client";

import type { AgentDefinition } from "@ix/agents";
import { buttonClass, Eyebrow } from "@ix/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { scrollToY } from "./motion";

export interface ShowcaseAgent {
  readonly agent: AgentDefinition;
  readonly role: string;
  readonly summary: string;
  readonly skills: readonly string[];
  readonly href: string;
}

/** Scroll distance given to each agent, in small-viewport heights. */
const STEP_SVH = 42;

/**
 * The team, one agent per scroll step. The section is tall and its content is pinned,
 * so scrolling walks through the roster while the whole stage takes each agent's color.
 */
export function TeamShowcase({
  agents,
  labels,
  nextHref,
}: {
  readonly agents: readonly ShowcaseAgent[];
  readonly labels: {
    readonly eyebrow: string;
    readonly title: string;
    readonly statement: string;
    readonly list: string;
    readonly skills: string;
    readonly profile: string;
    readonly skip: string;
  };
  /** Where "skip" jumps to: the section after the tour. */
  readonly nextHref: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const count = agents.length;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const box = section.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0;
      setActive(Math.min(count - 1, Math.floor(progress * count)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [count]);

  function goTo(index: number) {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    scrollToY(top + ((index + 0.5) / count) * travel);
  }

  const current = agents[active]?.agent;

  return (
    <section
      ref={sectionRef}
      id="team"
      aria-label={labels.title}
      className="relative"
      style={{ height: `calc(100svh + ${count * STEP_SVH}svh)` }}
    >
      <div
        className="sticky top-0 flex h-svh flex-col overflow-hidden pt-24 transition-[--agent] duration-700"
        style={{ "--agent": current?.accent } as CSSProperties}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(58rem_34rem_at_50%_58%,color-mix(in_srgb,var(--agent)_26%,transparent),transparent_72%)]"
        />
        {/* The agent's name, oversized, behind everything. */}
        <div aria-hidden="true" dir="ltr" className="pointer-events-none absolute inset-x-0 top-[22%] -z-10 text-center select-none">
          <span className="text-[19vw] leading-none font-extrabold tracking-tighter whitespace-nowrap text-[color-mix(in_srgb,var(--agent)_16%,transparent)]">
            {current?.name}
          </span>
        </div>

        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4 px-5 sm:px-8">
          <div className="space-y-2">
            <Eyebrow>{labels.eyebrow}</Eyebrow>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{labels.title}</h2>
          </div>
          <a href={nextHref} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:text-fg">
            {labels.skip}
          </a>
        </div>

        <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-rows-[minmax(0,1fr)_auto] gap-4 px-5 pb-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem_minmax(0,1fr)] lg:grid-rows-1 lg:items-center lg:gap-8 lg:pb-10">
          {/* Figures, stacked: only the active one is visible. */}
          <div dir="ltr" aria-hidden="true" className="relative min-h-0 lg:order-2 lg:h-[78%]">
            <span className="absolute inset-x-[12%] bottom-[2%] h-[9%] rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--agent)_75%,transparent),transparent)] blur-lg" />
            {agents.map(({ agent }, index) => (
              <img
                key={agent.key}
                src={`/agents/${agent.key}.webp`}
                alt=""
                width={400}
                height={900}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 m-auto h-full w-auto object-contain drop-shadow-[0_30px_36px_rgb(6_23_58/0.35)] transition-[opacity,transform,filter] duration-700 ease-out ${
                  index === active
                    ? "opacity-100"
                    : index < active
                      ? "-translate-x-16 scale-90 opacity-0 blur-sm"
                      : "translate-x-16 scale-90 opacity-0 blur-sm"
                }`}
              />
            ))}
          </div>

          {/* Copy: every agent is in the page; the inactive ones are hidden and inert. */}
          <div className="relative min-h-52 lg:order-1 lg:min-h-80">
            {agents.map(({ agent, role, summary, skills, href }, index) => (
              <article
                key={agent.key}
                inert={index !== active}
                aria-hidden={index !== active}
                className={`absolute inset-0 flex flex-col justify-center gap-3 transition-[opacity,transform] duration-500 ${
                  index === active ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
                }`}
              >
                <p dir="ltr" className="w-fit rounded-full border border-[color-mix(in_srgb,var(--agent)_45%,transparent)] px-3 py-1 font-mono text-xs font-bold tracking-widest text-fg-soft">
                  {agent.id}
                </p>
                <h3 dir="ltr" className="text-5xl leading-none font-extrabold tracking-tight sm:text-6xl lg:text-7xl rtl:text-end">
                  {agent.name}
                </h3>
                <p className="text-lg font-bold text-fg-soft sm:text-xl">{role}</p>
                <p className="hidden max-w-md text-base text-pretty text-muted sm:block">{summary}</p>
                <Link href={href} className={buttonClass("secondary", "sm", "mt-1 w-fit")}>
                  {labels.profile}
                  <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
                {/* Skills sit with the copy on small screens and move to the far column on large ones. */}
                <ul className="hidden flex-wrap gap-2 pt-1 sm:flex lg:hidden">
                  {skills.map((skill) => (
                    <li key={skill} className="ix-glass rounded-full px-3 py-1 text-xs font-semibold text-fg-soft">
                      {skill}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* Far column: the active agent's skills and the roster rail. */}
          <div className="hidden space-y-6 lg:order-3 lg:block">
            <div className="ix-glass-strong rounded-ix-lg p-5">
              <p className="text-xs font-extrabold tracking-widest text-muted uppercase">{labels.skills}</p>
              <ul className="mt-3 space-y-2">
                {(agents[active]?.skills ?? []).map((skill) => (
                  <li key={skill} className="flex items-center gap-2.5 text-sm font-semibold text-fg-soft">
                    <span className="size-1.5 shrink-0 rounded-full bg-[var(--agent)]" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <p className="border-s-2 border-[var(--agent)] ps-4 text-sm font-bold text-fg-soft">{labels.statement}</p>
          </div>
        </div>

        {/* Roster rail */}
        <nav aria-label={labels.list} className="mx-auto w-full max-w-7xl px-5 pb-5 sm:px-8">
          <ol dir="ltr" className="flex items-center justify-center gap-1.5 sm:gap-2">
            {agents.map(({ agent }, index) => (
              <li key={agent.key}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  aria-current={index === active ? "step" : undefined}
                  aria-label={`${agent.id} ${agent.name}`}
                  className={`group flex h-8 items-center gap-2 rounded-full px-1.5 text-[0.7rem] font-bold tracking-wider transition-all duration-500 ${
                    index === active ? "ix-glass px-3 text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  <span
                    className={`block rounded-full transition-all duration-500 ${index === active ? "size-2" : "size-1.5 opacity-50 group-hover:opacity-100"}`}
                    style={{ background: agent.accent }}
                  />
                  {index === active ? <span>{agent.name}</span> : null}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
