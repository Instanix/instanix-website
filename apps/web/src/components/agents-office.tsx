"use client";

import { AGENTS, getAgent, isAgentKey, type AgentKey } from "@ix/agents";
import type { Dictionary, Locale } from "@ix/i18n";
import { AgentAvatar, buttonClass, cn } from "@ix/ui";
import { ArrowRightLeft, ArrowUp, CalendarCheck, Check, Maximize2, ShieldCheck, TriangleAlert } from "lucide-react";
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
  /** "system" lines are shown in the thread but never sent to the model. */
  readonly role: "customer" | "agent" | "system";
  readonly text: string;
}

/** Mirrors the limits enforced by the server (@ix/ai and the AI guard). */
const TRIAL_MESSAGES = 6;
const MAX_LENGTH = 400;
/** Remembers on this device how much of the trial is used, so the offer shows without a round trip. */
const TRIAL_KEY = "ix-chat-trial-used";

const TICK_MS = 1500;
const WORKING_AT_ONCE = 5;

/** Systems the office is shown as connected to. Names only: they are the tools Instanix builds on. */
const CONNECTED = ["WhatsApp", "n8n", "Notion", "Supabase"] as const;

// Platform geometry, in floor units: a diamond with a little thickness.
const HALF_W = 132;
const HALF_H = 66;
const DEPTH = 20;
const WALL = 46;
const FIGURE_HEIGHT = 118;

const pct = (value: number, of: number) => `${(value / of) * 100}%`;
const points = (list: readonly (readonly [number, number])[]) => list.map(([x, y]) => `${x},${y}`).join(" ");

function diamond(x: number, y: number, w: number, h: number, depth = DEPTH) {
  return {
    top: `${x},${y - h} ${x + w},${y} ${x},${y + h} ${x - w},${y}`,
    left: `${x - w},${y} ${x},${y + h} ${x},${y + h + depth} ${x - w},${y + depth}`,
    right: `${x + w},${y} ${x},${y + h} ${x},${y + h + depth} ${x + w},${y + depth}`,
  };
}

/**
 * An isometric box standing on the floor. (cx, cy) is the center of its footprint;
 * `a` runs toward the lower right, `b` toward the lower left, `h` is its height.
 */
function IsoBox({
  cx,
  cy,
  a,
  b,
  h,
  top,
  left,
  right,
  glow,
}: {
  readonly cx: number;
  readonly cy: number;
  readonly a: number;
  readonly b: number;
  readonly h: number;
  readonly top: string;
  readonly left: string;
  readonly right: string;
  /** Lights the top edge, for screens and server lights. */
  readonly glow?: string;
}) {
  const ax = a / 2;
  const by = b / 2;
  const front: [number, number] = [cx + ax - by, cy + (ax + by) / 2];
  const rightCorner: [number, number] = [cx + ax + by, cy + (ax - by) / 2];
  const back: [number, number] = [cx - ax + by, cy - (ax + by) / 2];
  const leftCorner: [number, number] = [cx - ax - by, cy - (ax - by) / 2];
  const up = ([x, y]: readonly [number, number]): [number, number] => [x, y - h];
  return (
    <g>
      <polygon points={points([leftCorner, front, up(front), up(leftCorner)])} fill={left} />
      <polygon points={points([front, rightCorner, up(rightCorner), up(front)])} fill={right} />
      <polygon points={points([up(leftCorner), up(back), up(rightCorner), up(front)])} fill={top} stroke={glow} strokeWidth={glow ? 1 : 0} />
    </g>
  );
}

/** Where each agent stands on its platform, behind a desk. */
function spots(department: Department): readonly { key: AgentKey; x: number; y: number }[] {
  const offsets = department.agents.length === 1 ? [0] : [-50, 50];
  return department.agents.map((key, index) => ({ key, x: department.x + (offsets[index] ?? 0), y: department.y + 4 }));
}

const INITIAL: readonly TaskState[] = OFFICE_TASKS.map((_, index) =>
  index < WORKING_AT_ONCE ? { status: "doing", progress: [35, 62, 18, 80, 46][index] ?? 20, doneAt: 0 } : { status: "next", progress: 0, doneAt: 0 },
);

/**
 * The IX office: six departments around ZEUS and the IX mark, drawn as a working tech
 * office (desks, screens, glass walls, server racks, walkways), with a live task board and
 * a chat with any agent. The workload is a simulation with sample tasks; the chat is a
 * real model, limited to one short trial per visitor, after which the page offers a
 * consultation. An agent passes the visitor to the right colleague when a question is theirs.
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
    const asked = selected;
    const thread: ChatMessage[] = [...chat, { role: "customer", text }];
    setChat(thread);
    setDraft("");
    setProblem(null);
    setSending(true);
    try {
      const response = await fetch("/api/v1/office-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the real conversation goes to the model, never the hand-off notes.
        body: JSON.stringify({ locale, agent: asked, messages: thread.filter((message) => message.role !== "system") }),
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
      const answered = typeof data === "object" && data !== null && "agent" in data && isAgentKey(data.agent) ? data.agent : asked;
      // The agent passed the visitor to a colleague: the chat follows, and so does the floor.
      const handoff: ChatMessage[] =
        answered === asked ? [] : [{ role: "system", text: fill(copy.chat.transferred, { from: getAgent(asked).name, to: getAgent(answered).name }) }];
      if (answered !== asked) setSelected(answered);
      setChat([...thread, ...handoff, { role: "agent", text: reply }]);
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
  const doneIn = (department: Department) => OFFICE_TASKS.filter((task, i) => department.agents.includes(task.agent) && tasks[i]?.status === "done").length;

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
  const hub = diamond(HUB.x, HUB.y, 122, 61);

  return (
    <div className="ix-on-ink overflow-hidden rounded-[2rem] bg-ink p-3 text-on-ink shadow-ix-lg sm:p-4">
      {/* Top bar: status, connected systems, counters */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-2 pb-3">
        <p className="flex items-center gap-2.5 text-sm font-bold">
          <span className="ix-anim-pulse size-2 rounded-full bg-[#3ecf9a]" />
          {copy.live}
        </p>
        <p dir="ltr" className="hidden items-center gap-2 text-xs text-on-ink-muted md:flex">
          <span dir="auto">{copy.connected}</span>
          {CONNECTED.map((name) => (
            <span key={name} className="rounded-full border border-ink-line bg-white/5 px-2.5 py-1 font-semibold text-on-ink">
              {name}
            </span>
          ))}
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
        <div dir="ltr" className="relative flex items-center overflow-hidden rounded-3xl border border-ink-line bg-[radial-gradient(ellipse_at_50%_55%,#0f2a5e,#060f24_72%)] xl:order-2">
          <div
            className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ aspectRatio: `${FLOOR.width} / ${FLOOR.height}`, ...floorStyle }}
          >
            {/* Layer 1: the building. Everything the agents stand on or in front of. */}
            <svg viewBox={`0 0 ${FLOOR.width} ${FLOOR.height}`} aria-hidden="true" className="absolute inset-0 size-full">
              <defs>
                <pattern id="ix-office-grid" width="56" height="28" patternUnits="userSpaceOnUse">
                  <path d="M0 14 L28 0 L56 14 L28 28 Z" fill="none" stroke="rgb(140 175 255 / 0.09)" strokeWidth="1" />
                </pattern>
                <linearGradient id="ix-office-beam" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0" stopColor="rgb(0 200 255 / 0.55)" />
                  <stop offset="1" stopColor="rgb(0 200 255 / 0)" />
                </linearGradient>
              </defs>
              <rect width={FLOOR.width} height={FLOOR.height} fill="url(#ix-office-grid)" />

              {/* Walkways from the hub to every department, with a lit centre line */}
              {DEPARTMENTS.map((department, index) => {
                const d = `M ${HUB.x} ${HUB.y} L ${department.x} ${department.y}`;
                return (
                  <g key={department.key} fill="none" strokeLinecap="round">
                    <path d={d} stroke="#0a1730" strokeWidth="40" />
                    <path d={d} stroke="#16264a" strokeWidth="32" />
                    <path d={d} stroke="rgb(140 175 255 / 0.3)" strokeWidth="1.5" strokeDasharray="4 9" />
                    {doingIn(department) > 0 ? (
                      <path d={d} pathLength={1} stroke={department.color} strokeWidth="3" className="ix-beam" style={{ animationDelay: `${index * 0.4}s` }} />
                    ) : null}
                  </g>
                );
              })}

              {/* Hub: the core of the office */}
              <polygon points={hub.left} fill="#081632" />
              <polygon points={hub.right} fill="#06112a" />
              <polygon points={hub.top} fill="#11306a" stroke="rgb(0 200 255 / 0.6)" strokeWidth="1.5" />
              <ellipse cx={HUB.x} cy={HUB.y} rx="86" ry="43" fill="none" stroke="rgb(0 200 255 / 0.35)" strokeWidth="1.5" />
              <ellipse cx={HUB.x} cy={HUB.y} rx="56" ry="28" fill="rgb(0 200 255 / 0.1)" stroke="rgb(0 200 255 / 0.55)" strokeWidth="1.5" />
              <IsoBox cx={HUB.x + 22} cy={HUB.y + 4} a={34} b={34} h={12} top="#1b4d9c" left="#0d2a5c" right="#0a2150" glow="rgb(0 200 255 / 0.9)" />
              {/* The light the mark floats in */}
              <polygon points={points([[HUB.x + 6, HUB.y - 6], [HUB.x + 38, HUB.y - 6], [HUB.x + 56, HUB.y - 96], [HUB.x - 12, HUB.y - 96]])} fill="url(#ix-office-beam)" />

              {DEPARTMENTS.map((department) => {
                const { x, y, color } = department;
                const shape = diamond(x, y, HALF_W, HALF_H);
                const lit = zoom === department.key;
                const busy = doingIn(department) > 0;
                return (
                  <g key={department.key} style={{ "--c": color } as CSSProperties}>
                    {/* Slab */}
                    <polygon points={shape.left} fill="color-mix(in srgb, var(--c) 30%, #050b1a)" />
                    <polygon points={shape.right} fill="color-mix(in srgb, var(--c) 20%, #050b1a)" />
                    <polygon points={shape.top} fill="color-mix(in srgb, var(--c) 30%, #0c1a33)" stroke={lit ? "#fff" : "color-mix(in srgb, var(--c) 75%, white)"} strokeWidth={lit ? 2.5 : 1.25} />
                    {/* Floor tiles */}
                    <g stroke="rgb(255 255 255 / 0.1)" strokeWidth="1">
                      {[-0.5, 0, 0.5].map((t) => (
                        <g key={t}>
                          <line x1={x - HALF_W + (t + 0.5) * HALF_W} y1={y - (t + 0.5) * HALF_H} x2={x + (t + 0.5) * HALF_W} y2={y + HALF_H - (t + 0.5) * HALF_H} />
                          <line x1={x + HALF_W - (t + 0.5) * HALF_W} y1={y - (t + 0.5) * HALF_H} x2={x - (t + 0.5) * HALF_W} y2={y + HALF_H - (t + 0.5) * HALF_H} />
                        </g>
                      ))}
                    </g>
                    {/* Glass walls along the two back edges, with a lit top rail */}
                    <polygon points={points([[x - HALF_W, y], [x, y - HALF_H], [x, y - HALF_H - WALL], [x - HALF_W, y - WALL]])} fill="color-mix(in srgb, var(--c) 16%, transparent)" stroke="color-mix(in srgb, var(--c) 55%, transparent)" strokeWidth="1" />
                    <polygon points={points([[x, y - HALF_H], [x + HALF_W, y], [x + HALF_W, y - WALL], [x, y - HALF_H - WALL]])} fill="color-mix(in srgb, var(--c) 10%, transparent)" stroke="color-mix(in srgb, var(--c) 55%, transparent)" strokeWidth="1" />
                    <polyline points={points([[x - HALF_W, y - WALL], [x, y - HALF_H - WALL], [x + HALF_W, y - WALL]])} fill="none" stroke="color-mix(in srgb, var(--c) 85%, white)" strokeWidth="2" />
                    {/* A wall screen on the left wall, alive while the department works */}
                    <polygon
                      points={points([[x - HALF_W * 0.72, y - HALF_H * 0.28 - 12], [x - HALF_W * 0.3, y - HALF_H * 0.7 - 12], [x - HALF_W * 0.3, y - HALF_H * 0.7 - 34], [x - HALF_W * 0.72, y - HALF_H * 0.28 - 34]])}
                      fill={busy ? "color-mix(in srgb, var(--c) 70%, white)" : "color-mix(in srgb, var(--c) 30%, #0b1528)"}
                      className={busy ? "ix-office-screen" : undefined}
                    />
                    {/* Server rack in the back corner */}
                    <IsoBox cx={x + HALF_W * 0.3} cy={y - HALF_H * 0.5} a={20} b={20} h={40} top="#1c2a47" left="#0e1830" right="#0a1226" />
                    {[10, 20, 30].map((led, i) => (
                      <rect key={led} x={x + HALF_W * 0.3 - 9} y={y - HALF_H * 0.5 - led + 6} width="7" height="2" rx="1" fill={busy ? color : "#33415f"} className={busy ? "ix-office-led" : undefined} style={{ animationDelay: `${i * 0.35}s` }} />
                    ))}
                    {/* A plant by the left corner */}
                    <IsoBox cx={x - HALF_W * 0.78} cy={y + 2} a={10} b={10} h={8} top="#2a3a5c" left="#1a2742" right="#141f38" />
                    <circle cx={x - HALF_W * 0.78} cy={y - 14} r="8" fill="#2f9e6b" />
                    <circle cx={x - HALF_W * 0.78 + 5} cy={y - 19} r="5" fill="#3ecf9a" />
                  </g>
                );
              })}
            </svg>

            {/* The IX mark at the heart of the office, pulsing, with ZEUS beside it */}
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pct(HUB.x + 22, FLOOR.width), top: pct(HUB.y - 54, FLOOR.height), width: "7.5%" }}>
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
              style={{ left: pct(HUB.x - 52, FLOOR.width), top: pct(HUB.y + 30, FLOOR.height), height: pct(FIGURE_HEIGHT + 16, FLOOR.height) }}
            >
              {selected === "zeus" ? <span className="absolute inset-x-[-25%] bottom-[-4%] h-[14%] rounded-[50%] border-2 border-white/80" /> : null}
              <img src="/agents/zeus.webp" alt="" width={400} height={900} className="relative h-full w-auto object-contain transition-transform duration-300 group-hover:-translate-y-1" />
            </button>
            <p
              className="pointer-events-none absolute -translate-x-1/2 rounded-full border border-ink-line bg-ink/80 px-2.5 py-1 text-[0.6rem] font-bold whitespace-nowrap backdrop-blur sm:text-xs"
              style={{ left: pct(HUB.x, FLOOR.width), top: pct(HUB.y + 70, FLOOR.height) }}
            >
              {copy.hub}
            </p>

            {DEPARTMENTS.map((department) => (
              <div key={department.key}>
                {/* Department sign: tap to zoom in */}
                <button
                  type="button"
                  onClick={() => setZoom(zoom === department.key ? null : department.key)}
                  aria-pressed={zoom === department.key}
                  className="absolute z-20 flex -translate-x-1/2 -translate-y-full flex-col items-start rounded-xl border border-ink-line bg-ink/85 px-2 py-1 text-start whitespace-nowrap backdrop-blur transition-colors hover:border-white/50 sm:px-2.5 sm:py-1.5"
                  style={{ left: pct(department.x, FLOOR.width), top: pct(department.y - HALF_H - WALL - 6, FLOOR.height) }}
                >
                  <span className="flex items-center gap-1.5 text-[0.55rem] font-bold sm:text-xs">
                    <span className="size-1.5 rounded-full sm:size-2" style={{ background: department.color }} />
                    {copy.departments[department.key]}
                  </span>
                  <span className="hidden text-[0.6rem] text-on-ink-muted tabular-nums sm:block">
                    {doingIn(department)} {copy.status.doing} · {doneIn(department)} {copy.doneLabel}
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
                      className="group absolute z-0 -translate-x-1/2 -translate-y-full"
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
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Layer 2: desks and screens, in front of the agents who sit behind them */}
            <svg viewBox={`0 0 ${FLOOR.width} ${FLOOR.height}`} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 size-full">
              {DEPARTMENTS.flatMap((department) =>
                spots(department).map((spot) => {
                  const work = taskOf(spot.key);
                  const on = work?.state.status === "doing";
                  const waiting = work?.state.status === "waiting";
                  const screen = waiting ? "#f2b84b" : on ? getAgent(spot.key).accent : "#2a3a5c";
                  return (
                    <g key={spot.key}>
                      <IsoBox cx={spot.x} cy={spot.y + 20} a={48} b={20} h={9} top="#d9e4f5" left="#93a5c4" right="#7a8cab" />
                      <IsoBox cx={spot.x - 2} cy={spot.y + 16} a={24} b={3} h={17} top={screen} left="#0e1830" right="#16233f" {...(on || waiting ? { glow: screen } : {})} />
                      {on ? <ellipse cx={spot.x - 2} cy={spot.y + 2} rx="16" ry="5" fill={screen} opacity="0.35" className="ix-office-screen" /> : null}
                    </g>
                  );
                }),
              )}
            </svg>
          </div>
          {zoom ? (
            <button type="button" onClick={() => setZoom(null)} className={buttonClass("on-ink", "sm", "absolute end-3 top-3 z-30 h-8 text-xs")}>
              <Maximize2 className="size-3.5" aria-hidden="true" />
              {copy.overview}
            </button>
          ) : null}
        </div>

        {/* The selected agent, and a chat with it */}
        <div className="flex min-h-80 flex-col rounded-3xl border border-ink-line bg-white/5 p-4 xl:order-1 xl:max-h-[32rem]">
          {agent ? (
            <>
              <div key={agent.key} className="ix-anim-in flex items-center gap-3">
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
                {chat.length === 0 ? (
                  <p dir="auto" className="max-w-[90%] rounded-2xl rounded-es-md bg-white/10 px-3 py-2 text-sm leading-relaxed">
                    {fill(copy.chat.greeting, { name: agent.name })}
                  </p>
                ) : null}
                {chat.map((message, index) =>
                  message.role === "system" ? (
                    <p key={index} className="ix-anim-in flex items-center justify-center gap-1.5 py-1 text-center text-[0.7rem] font-bold text-[#5fe0ff]">
                      <ArrowRightLeft className="size-3.5 shrink-0" aria-hidden="true" />
                      <span dir="auto">{message.text}</span>
                    </p>
                  ) : (
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
                  ),
                )}
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
