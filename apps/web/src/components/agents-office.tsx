"use client";

import { AGENTS, getAgent, type AgentKey } from "@ix/agents";
import type { Dictionary, Locale } from "@ix/i18n";
import { AgentAvatar, buttonClass, cn } from "@ix/ui";
import { ArrowUp, CalendarCheck, Check, Maximize2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { fill } from "@/lib/assessment-draft";
import { DEPARTMENTS, departmentOf, FLOOR, HUB, OFFICE_TASKS, type Department, type DepartmentKey } from "@/lib/office";
import { prefersReducedMotion } from "./motion";

type Copy = Dictionary["web"]["office"];
type Status = "next" | "doing" | "waiting" | "done";

interface TaskState {
  readonly status: Status;
  readonly progress: number;
  /** Simulation tick at which the task finished, so the oldest can be recycled first. */
  readonly doneAt: number;
}

interface ChatMessage {
  readonly role: "customer" | "agent";
  readonly text: string;
}

/** Mirrors the limits enforced by the server (@ix/ai and the AI guard). */
const TRIAL_MESSAGES = 6;
const MAX_LENGTH = 400;
/** Remembers on this device how much of the trial is used, so the offer shows without a round trip. */
const TRIAL_KEY = "ix-chat-trial-used";

const TICK_MS = 1500;
const WORKING_AT_ONCE = 5;

// Platform geometry, in floor units: a diamond with a little thickness.
const HALF_W = 128;
const HALF_H = 64;
const DEPTH = 18;
const FIGURE_HEIGHT = 122;

const pct = (value: number, of: number) => `${(value / of) * 100}%`;

function diamond(x: number, y: number, w: number, h: number) {
  return {
    top: `${x},${y - h} ${x + w},${y} ${x},${y + h} ${x - w},${y}`,
    left: `${x - w},${y} ${x},${y + h} ${x},${y + h + DEPTH} ${x - w},${y + DEPTH}`,
    right: `${x + w},${y} ${x},${y + h} ${x},${y + h + DEPTH} ${x + w},${y + DEPTH}`,
  };
}

/** Where each agent stands on its platform. */
function spots(department: Department): readonly { key: AgentKey; x: number; y: number }[] {
  const offsets = department.agents.length === 1 ? [0] : [-54, 54];
  return department.agents.map((key, index) => ({ key, x: department.x + (offsets[index] ?? 0), y: department.y + 14 }));
}

const INITIAL: readonly TaskState[] = OFFICE_TASKS.map((_, index) =>
  index < WORKING_AT_ONCE ? { status: "doing", progress: [35, 62, 18, 80, 46][index] ?? 20, doneAt: 0 } : { status: "next", progress: 0, doneAt: 0 },
);

/**
 * The IX office: six departments around ZEUS and the IX mark, a live task board, and a
 * chat with any agent. The workload is a simulation with sample tasks; the chat is a real
 * model, limited to one short trial per visitor, after which the page offers a consultation.
 */
export function AgentsOffice({
  locale,
  copy,
  roles,
  bookingHref,
}: {
  readonly locale: Locale;
  readonly copy: Copy;
  readonly roles: Readonly<Record<AgentKey, string>>;
  /** Where a visitor goes after the trial: the booking page, or the assessment. */
  readonly bookingHref: string;
}) {
  const [tasks, setTasks] = useState<readonly TaskState[]>(INITIAL);
  const [zoom, setZoom] = useState<DepartmentKey | null>(null);
  const [selected, setSelected] = useState<AgentKey | null>(null);
  const [chat, setChat] = useState<readonly ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const tick = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);

  // The workload runs by itself; approvals wait for the visitor.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setInterval(() => {
      tick.current += 1;
      const now = tick.current;
      setTasks((previous) => {
        const next = previous.map((task, index): TaskState => {
          if (task.status !== "doing") return task;
          const progress = task.progress + 6 + Math.floor(Math.random() * 16);
          if (progress < 100) return { ...task, progress };
          return { status: OFFICE_TASKS[index]?.approval ? "waiting" : "done", progress: 100, doneAt: now };
        });
        // Keep a steady number of agents busy.
        while (next.filter((task) => task.status === "doing").length < WORKING_AT_ONCE) {
          let candidate = next.findIndex((task) => task.status === "next");
          if (candidate < 0) {
            // Nothing queued: the oldest finished task comes round again.
            const finished = next.map((task, index) => ({ task, index })).filter(({ task }) => task.status === "done");
            if (finished.length === 0) break;
            candidate = finished.reduce((oldest, entry) => (entry.task.doneAt < oldest.task.doneAt ? entry : oldest)).index;
          }
          next[candidate] = { status: "doing", progress: 4, doneAt: 0 };
        }
        return next;
      });
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      setUsed(Math.min(TRIAL_MESSAGES, Number(window.localStorage.getItem(TRIAL_KEY)) || 0));
    } catch {
      // Storage can be blocked; the server still enforces the trial.
    }
  }, []);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [chat, sending]);

  function rememberUsed(count: number) {
    setUsed(count);
    try {
      window.localStorage.setItem(TRIAL_KEY, String(count));
    } catch {
      // Nothing to do.
    }
  }

  function open(agent: AgentKey) {
    if (agent !== selected) {
      setChat([]);
      setProblem(null);
    }
    setSelected(agent);
  }

  const approve = (index: number) =>
    setTasks((previous) => previous.map((task, i) => (i === index && task.status === "waiting" ? { ...task, status: "done", doneAt: tick.current } : task)));

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim().slice(0, MAX_LENGTH);
    if (!text || sending || !selected || used >= TRIAL_MESSAGES) return;
    const messages: ChatMessage[] = [...chat, { role: "customer", text }];
    setChat(messages);
    setDraft("");
    setProblem(null);
    setSending(true);
    try {
      const response = await fetch("/api/v1/office-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, agent: selected, messages }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const code = typeof data === "object" && data !== null && "error" in data && typeof data.error === "object" && data.error !== null && "code" in data.error ? data.error.code : null;
        if (code === "trial_used") rememberUsed(TRIAL_MESSAGES);
        else setProblem(response.status === 503 ? copy.chat.unavailable : copy.chat.error);
        return;
      }
      const reply = typeof data === "object" && data !== null && "reply" in data && typeof data.reply === "string" ? data.reply : null;
      if (!reply) {
        setProblem(copy.chat.error);
        return;
      }
      setChat([...messages, { role: "agent", text: reply }]);
      rememberUsed(used + 1);
    } catch {
      setProblem(copy.chat.error);
    } finally {
      setSending(false);
    }
  }

  const taskOf = (agent: AgentKey) => {
    const index = OFFICE_TASKS.findIndex((task, i) => task.agent === agent && (tasks[i]?.status === "doing" || tasks[i]?.status === "waiting"));
    return index < 0 ? null : { index, state: tasks[index] as TaskState };
  };
  const count = (status: Status) => tasks.filter((task) => task.status === status).length;
  const doingIn = (department: Department) => department.agents.filter((agent) => taskOf(agent)?.state.status === "doing").length;

  const ORDER: Record<Status, number> = { waiting: 0, doing: 1, next: 2, done: 3 };
  const board = tasks
    .map((state, index) => ({ state, index, task: OFFICE_TASKS[index] }))
    .sort((a, b) => ORDER[a.state.status] - ORDER[b.state.status] || b.state.doneAt - a.state.doneAt);

  const zoomed = zoom ? DEPARTMENTS.find((department) => department.key === zoom) : null;
  const floorStyle: CSSProperties = zoomed
    ? { transform: `scale(1.7) translate(${((FLOOR.width / 2 - zoomed.x) / FLOOR.width) * 100}%, ${((FLOOR.height / 2 - zoomed.y) / FLOOR.height) * 100}%)` }
    : {};

  const agent = selected ? getAgent(selected) : null;
  const current = selected ? taskOf(selected) : null;
  const spent = used >= TRIAL_MESSAGES;
  const external = /^https?:/.test(bookingHref);
  const hub = diamond(HUB.x, HUB.y, 104, 52);

  return (
    <div className="ix-on-ink overflow-hidden rounded-[2rem] bg-ink p-3 text-on-ink shadow-ix-lg sm:p-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3">
        <p className="flex items-center gap-2.5 text-sm font-bold">
          <span className="ix-anim-pulse size-2 rounded-full bg-[#3ecf9a]" />
          {copy.live}
        </p>
        <dl className="flex items-center gap-4 text-xs font-semibold text-on-ink-muted">
          {(["doing", "waiting", "done"] as const).map((status) => (
            <div key={status} className="flex items-baseline gap-1.5">
              <dd className={cn("text-base font-extrabold tabular-nums", status === "waiting" && count(status) > 0 ? "text-[#f2b84b]" : "text-on-ink")}>{count(status)}</dd>
              <dt>{copy.status[status]}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-3 xl:grid-cols-[17rem_minmax(0,1fr)_18rem]">
        {/* The floor. Geometry never mirrors, so it is always left to right. */}
        <div dir="ltr" className="relative flex items-center overflow-hidden rounded-3xl border border-ink-line bg-[radial-gradient(ellipse_at_center,#0d2550,transparent_70%)] xl:order-2">
          <div
            className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ aspectRatio: `${FLOOR.width} / ${FLOOR.height}`, ...floorStyle }}
          >
            <svg viewBox={`0 0 ${FLOOR.width} ${FLOOR.height}`} aria-hidden="true" className="absolute inset-0 size-full">
              {/* Routes from the hub to every department */}
              {DEPARTMENTS.map((department, index) => {
                const d = `M ${HUB.x} ${HUB.y} Q ${(HUB.x + department.x) / 2} ${Math.min(HUB.y, department.y) - 46}, ${department.x} ${department.y}`;
                return (
                  <g key={department.key} fill="none">
                    <path d={d} stroke="rgb(140 175 255 / 0.28)" strokeWidth="1.5" strokeDasharray="3 6" />
                    {doingIn(department) > 0 ? (
                      <path d={d} pathLength={1} stroke={department.color} strokeWidth="2.5" strokeLinecap="round" className="ix-beam" style={{ animationDelay: `${index * 0.4}s` }} />
                    ) : null}
                  </g>
                );
              })}
              {/* Hub platform */}
              <polygon points={hub.left} fill="#081632" />
              <polygon points={hub.right} fill="#06112a" />
              <polygon points={hub.top} fill="#102a5c" stroke="rgb(0 200 255 / 0.55)" strokeWidth="1.5" />
              {/* Department platforms */}
              {DEPARTMENTS.map((department) => {
                const shape = diamond(department.x, department.y, HALF_W, HALF_H);
                const lit = zoom === department.key;
                return (
                  <g key={department.key} style={{ "--c": department.color } as CSSProperties}>
                    <polygon points={shape.left} fill="color-mix(in srgb, var(--c) 34%, #050b1a)" />
                    <polygon points={shape.right} fill="color-mix(in srgb, var(--c) 22%, #050b1a)" />
                    <polygon
                      points={shape.top}
                      fill="color-mix(in srgb, var(--c) 46%, #0b1528)"
                      stroke={lit ? "#fff" : "color-mix(in srgb, var(--c) 80%, white)"}
                      strokeWidth={lit ? 2.5 : 1.25}
                    />
                  </g>
                );
              })}
            </svg>

            {/* The IX mark at the heart of the office, pulsing, with ZEUS beside it */}
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pct(HUB.x + 20, FLOOR.width), top: pct(HUB.y - 6, FLOOR.height), width: "7.5%" }}>
              <span className="ix-anim-pulse absolute -inset-[55%] rounded-full bg-[radial-gradient(closest-side,rgb(0_200_255/0.55),transparent)]" />
              <span className="ix-anim-pulse absolute -inset-[18%] rounded-full border border-[#00c8ff]/60 [animation-delay:0.9s]" />
              <img src="/brand/mark.webp" alt="" width={223} height={256} className="ix-office-mark relative w-full" />
            </div>
            <button
              type="button"
              onClick={() => open("zeus")}
              aria-label={`${getAgent("zeus").name}: ${roles.zeus}`}
              aria-pressed={selected === "zeus"}
              className="group absolute -translate-x-1/2 -translate-y-full"
              style={{ left: pct(HUB.x - 46, FLOOR.width), top: pct(HUB.y + 26, FLOOR.height), height: pct(FIGURE_HEIGHT + 14, FLOOR.height) }}
            >
              <img src="/agents/zeus.webp" alt="" width={400} height={900} className="h-full w-auto object-contain transition-transform duration-300 group-hover:-translate-y-1" />
            </button>
            <p
              className="pointer-events-none absolute -translate-x-1/2 rounded-full border border-ink-line bg-ink/80 px-2.5 py-1 text-[0.6rem] font-bold whitespace-nowrap backdrop-blur sm:text-xs"
              style={{ left: pct(HUB.x, FLOOR.width), top: pct(HUB.y + 62, FLOOR.height) }}
            >
              {copy.hub}
            </p>

            {DEPARTMENTS.map((department) => (
              <div key={department.key}>
                {/* Department label: tap to zoom in */}
                <button
                  type="button"
                  onClick={() => setZoom(zoom === department.key ? null : department.key)}
                  aria-pressed={zoom === department.key}
                  className="absolute z-10 flex -translate-x-1/2 -translate-y-full items-center gap-1.5 rounded-full border border-ink-line bg-ink/85 px-2 py-0.5 text-[0.55rem] font-bold whitespace-nowrap backdrop-blur transition-colors hover:border-white/50 sm:px-2.5 sm:py-1 sm:text-xs"
                  style={{ left: pct(department.x, FLOOR.width), top: pct(department.y - FIGURE_HEIGHT - 4, FLOOR.height) }}
                >
                  <span className="size-1.5 rounded-full sm:size-2" style={{ background: department.color }} />
                  {copy.departments[department.key]}
                  <span className="text-on-ink-muted tabular-nums">
                    {doingIn(department)}/{department.agents.length}
                  </span>
                </button>
                {spots(department).map((spot) => {
                  const member = getAgent(spot.key);
                  const work = taskOf(spot.key);
                  const active = selected === spot.key;
                  return (
                    <button
                      key={spot.key}
                      type="button"
                      onClick={() => open(spot.key)}
                      aria-label={`${member.name}: ${roles[spot.key]}`}
                      aria-pressed={active}
                      className="group absolute -translate-x-1/2 -translate-y-full"
                      style={{ left: pct(spot.x, FLOOR.width), top: pct(spot.y, FLOOR.height), height: pct(FIGURE_HEIGHT, FLOOR.height) }}
                    >
                      {active ? <span className="absolute inset-x-[-25%] bottom-[-4%] h-[14%] rounded-[50%] border-2 border-white/80" /> : null}
                      <img
                        src={`/agents/${spot.key}.webp`}
                        alt=""
                        width={400}
                        height={900}
                        loading="lazy"
                        className={cn("relative h-full w-auto object-contain transition-[transform,filter] duration-300 group-hover:-translate-y-1", work ? "" : "brightness-75 saturate-50")}
                      />
                      {work?.state.status === "waiting" ? (
                        <TriangleAlert className="ix-anim-pulse absolute -top-[16%] left-1/2 size-[26%] -translate-x-1/2 fill-[#f2b84b] text-ink" aria-hidden="true" />
                      ) : work ? (
                        <span className="ix-anim-pulse absolute -top-[8%] left-1/2 size-[9%] -translate-x-1/2 rounded-full" style={{ background: member.accent }} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {zoom ? (
            <button type="button" onClick={() => setZoom(null)} className={buttonClass("on-ink", "sm", "absolute end-3 top-3 z-20 h-8 text-xs")}>
              <Maximize2 className="size-3.5" aria-hidden="true" />
              {copy.overview}
            </button>
          ) : null}
        </div>

        {/* The selected agent, and a chat with it */}
        <div className="flex min-h-80 flex-col rounded-3xl border border-ink-line bg-white/5 p-4 xl:order-1 xl:max-h-[32rem]">
          {agent ? (
            <>
              <div className="flex items-center gap-3">
                <AgentAvatar agent={agent} size="md" />
                <div className="min-w-0">
                  <p dir="ltr" className="font-mono text-[0.65rem] font-bold text-on-ink-muted rtl:text-end">
                    {agent.id}
                    {departmentOf(agent.key) ? ` · ${copy.departments[(departmentOf(agent.key) as Department).key]}` : ""}
                  </p>
                  <p dir="ltr" className="text-lg leading-tight font-extrabold tracking-tight rtl:text-end">
                    {agent.name}
                  </p>
                  <p className="truncate text-xs text-on-ink-muted">{roles[agent.key]}</p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-ink-line bg-ink/60 p-3">
                <p className="text-[0.65rem] font-bold tracking-widest text-on-ink-muted uppercase">{current ? copy.workingOn : copy.standingBy}</p>
                {current ? (
                  <>
                    <p className="mt-1 text-sm font-semibold">{copy.tasks[OFFICE_TASKS[current.index]?.text ?? 0]}</p>
                    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${current.state.progress}%`, background: agent.accent }} />
                    </span>
                  </>
                ) : null}
              </div>

              <div ref={threadRef} data-lenis-prevent aria-live="polite" className="mt-3 min-h-28 flex-1 space-y-2 overflow-y-auto">
                <p dir="auto" className="max-w-[90%] rounded-2xl rounded-es-md bg-white/10 px-3 py-2 text-sm leading-relaxed">
                  {fill(copy.chat.greeting, { name: agent.name })}
                </p>
                {chat.map((message, index) => (
                  <div key={index} className={cn("ix-anim-in flex", message.role === "customer" ? "justify-end" : "justify-start")}>
                    <p
                      dir="auto"
                      className={cn(
                        "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        message.role === "customer" ? "rounded-ee-md bg-primary text-on-primary" : "rounded-es-md bg-white/10",
                      )}
                    >
                      {message.text}
                    </p>
                  </div>
                ))}
                {sending ? (
                  <p className="flex w-fit gap-1 rounded-2xl rounded-es-md bg-white/10 px-4 py-3">
                    <span className="ix-typing-dot" />
                    <span className="ix-typing-dot [animation-delay:150ms]" />
                    <span className="ix-typing-dot [animation-delay:300ms]" />
                  </p>
                ) : null}
                {problem ? (
                  <p role="alert" className="text-xs font-semibold text-[#ff7b72]">
                    {problem}
                  </p>
                ) : null}
              </div>

              {spent ? (
                <div className="ix-anim-in mt-3 space-y-2.5 rounded-2xl border border-[#00c8ff]/40 bg-[#00c8ff]/10 p-3">
                  <p className="text-sm font-semibold">{copy.chat.trialUsed}</p>
                  <a href={bookingHref} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={buttonClass("primary", "sm", "h-10 w-full")}>
                    <CalendarCheck className="size-4" aria-hidden="true" />
                    {copy.chat.book}
                  </a>
                </div>
              ) : (
                <>
                  <form onSubmit={send} className="mt-3 flex items-center gap-2">
                    <label htmlFor="office-chat-input" className="sr-only">
                      {fill(copy.chat.title, { name: agent.name })}
                    </label>
                    <input
                      id="office-chat-input"
                      type="text"
                      value={draft}
                      onChange={(event) => setDraft(event.currentTarget.value)}
                      maxLength={MAX_LENGTH}
                      autoComplete="off"
                      placeholder={copy.chat.placeholder}
                      className="h-10 min-w-0 flex-1 rounded-full border border-ink-line bg-ink/60 px-4 text-sm text-on-ink outline-none placeholder:text-on-ink-muted focus:border-[#00c8ff]"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim() || sending}
                      aria-label={copy.chat.send}
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition-[opacity,transform] active:scale-95 disabled:opacity-40"
                    >
                      <ArrowUp className="size-5" aria-hidden="true" />
                    </button>
                  </form>
                  <p className="mt-2 text-[0.7rem] text-on-ink-muted">
                    <span className="font-bold text-on-ink tabular-nums">{fill(copy.chat.remaining, { count: TRIAL_MESSAGES - used })}</span> · {copy.chat.notice}
                  </p>
                </>
              )}
            </>
          ) : (
            <div className="m-auto max-w-56 space-y-4 text-center">
              <div dir="ltr" className="flex justify-center -space-x-3">
                {AGENTS.slice(0, 5).map((member) => (
                  <AgentAvatar key={member.key} agent={member} size="sm" className="ring-2 ring-ink" />
                ))}
              </div>
              <p className="text-sm text-on-ink-muted">{copy.pick}</p>
            </div>
          )}
        </div>

        {/* Task board */}
        <div className="flex flex-col rounded-3xl border border-ink-line bg-white/5 p-4 xl:order-3 xl:max-h-[32rem]">
          <p className="text-xs font-extrabold tracking-widest text-on-ink-muted uppercase">{copy.tasksTitle}</p>
          <ol data-lenis-prevent className="mt-3 flex-1 space-y-2 overflow-y-auto">
            {board.map(({ state, index, task }) => {
              if (!task) return null;
              const member = getAgent(task.agent);
              return (
                <li
                  key={index}
                  className={cn(
                    "rounded-2xl border p-3 transition-colors duration-500",
                    state.status === "waiting" ? "border-[#f2b84b]/60 bg-[#f2b84b]/10" : "border-ink-line bg-ink/50",
                    state.status === "next" && "opacity-55",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <button type="button" onClick={() => open(task.agent)} aria-label={member.name} className="shrink-0">
                      <AgentAvatar agent={member} size="xs" className="size-7" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug font-semibold">{copy.tasks[task.text]}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[0.65rem] font-bold tracking-wide text-on-ink-muted uppercase">
                        <span dir="ltr">{member.name}</span>
                        <span>·</span>
                        <span className={state.status === "waiting" ? "text-[#f2b84b]" : state.status === "done" ? "text-[#3ecf9a]" : ""}>{copy.status[state.status]}</span>
                        {state.status === "doing" ? <span className="tabular-nums">{state.progress}%</span> : null}
                      </p>
                    </div>
                    {state.status === "done" ? <Check className="mt-0.5 size-4 shrink-0 text-[#3ecf9a]" aria-hidden="true" /> : null}
                  </div>
                  {state.status === "doing" ? (
                    <span className="mt-2.5 block h-1 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${state.progress}%`, background: member.accent }} />
                    </span>
                  ) : null}
                  {state.status === "waiting" ? (
                    <button type="button" onClick={() => approve(index)} className={buttonClass("primary", "sm", "mt-2.5 h-8 w-full text-xs")}>
                      <ShieldCheck className="size-3.5" aria-hidden="true" />
                      {copy.approve}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <p className="px-2 pt-3 text-xs text-on-ink-muted">{copy.note}</p>
    </div>
  );
}
