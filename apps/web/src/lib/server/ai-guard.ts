import "server-only";
import { createHmac } from "node:crypto";
import { createRateLimiter } from "@ix/ai";
import { createUsageStore, type UsageStore } from "@ix/db";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/env";

/**
 * One gate in front of every public endpoint that spends money on an AI provider.
 * A request must pass, in order:
 *   1. the same-origin check (only this website's own pages may call the endpoint),
 *   2. the kill switch for the optional demos,
 *   3. a per-visitor limit (hourly for the assessment; one short trial a month for live chat),
 *   4. a daily limit for the feature,
 *   5. a daily limit for all AI features together.
 * Counts live in the database when it is configured, so they survive restarts and are
 * shared by every server instance. If the database cannot be reached, the same limits
 * are enforced in memory rather than not at all.
 */

export type AiFeature = "assessment" | "chat";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/** The longest window the usage counter accepts. */
const TRIAL_WINDOW_DAYS = 30;

/**
 * Defaults sized for a marketing site. Each can be lowered or raised with an environment variable.
 * Live chat is a trial: a visitor gets a handful of messages once per window, shared by every
 * chat on the site, and is then offered a consultation instead.
 */
const LIMITS: Record<AiFeature, { readonly perVisitor: number; readonly visitorWindowSeconds: number; readonly perDay: number }> = {
  assessment: { perVisitor: 5, visitorWindowSeconds: HOUR, perDay: 100 },
  chat: { perVisitor: 6, visitorWindowSeconds: TRIAL_WINDOW_DAYS * DAY, perDay: 600 },
};
const TOTAL_PER_DAY = 800;

/** A positive whole number from the environment, or the default. Bad values never widen a limit. */
function limitFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 100_000 ? value : fallback;
}

function limitsFor(feature: AiFeature) {
  const key = feature.toUpperCase();
  const base = LIMITS[feature];
  const trialDays = Math.min(TRIAL_WINDOW_DAYS, Math.max(1, limitFromEnv("AI_LIMIT_CHAT_TRIAL_DAYS", TRIAL_WINDOW_DAYS)));
  return {
    perVisitor:
      feature === "chat"
        ? limitFromEnv("AI_LIMIT_CHAT_TRIAL_MESSAGES", base.perVisitor)
        : limitFromEnv(`AI_LIMIT_${key}_PER_VISITOR_HOUR`, base.perVisitor),
    visitorWindowSeconds: feature === "chat" ? trialDays * DAY : base.visitorWindowSeconds,
    perDay: limitFromEnv(`AI_LIMIT_${key}_PER_DAY`, base.perDay),
    totalPerDay: limitFromEnv("AI_LIMIT_TOTAL_PER_DAY", TOTAL_PER_DAY),
  };
}

export type GuardResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly code: "forbidden" | "disabled" | "trial_used" | "rate_limited"; readonly status: number; readonly retryAfterSeconds?: number };

// ---------- 1. Same origin ----------

function hostOf(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Browsers always send `Origin` on a cross-site POST, and on same-site POSTs made with
 * fetch. Requiring it to match this site stops other websites, and simple scripts, from
 * spending the budget. It is one layer, not the only one: the limits below still apply.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = hostOf(request.headers.get("origin"));
  if (!origin) return false;
  const allowed = new Set<string>();
  const site = hostOf(SITE_URL);
  if (site) allowed.add(site);
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))?.split(",")[0]?.trim().toLowerCase();
  if (host) allowed.add(host);
  return allowed.has(origin);
}

// ---------- 3 to 5. Limits ----------

function clientIp(request: NextRequest): string {
  return request.headers.get("x-real-ip")?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function keyedHash(value: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.OPENAI_API_KEY || "ix";
  return createHmac("sha256", secret).update(value).digest("hex").slice(0, 24);
}

/** A stable, non-reversible label for the visitor. Raw IP addresses are never stored. */
export function visitorLabel(request: NextRequest): string {
  return keyedHash(clientIp(request));
}

/**
 * A label for counting unique visitors in the site statistics. It changes every day, so a
 * visitor cannot be followed from one day to the next, and it is unrelated to `visitorLabel`.
 */
export function dailyVisitorLabel(request: NextRequest, now: Date = new Date()): string {
  return keyedHash(`stats:${now.toISOString().slice(0, 10)}:${clientIp(request)}:${request.headers.get("user-agent") ?? ""}`);
}

let store: UsageStore | null | undefined;
function usageStore(): UsageStore | null {
  if (store === undefined) {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    store = url && serviceKey ? createUsageStore({ url, serviceKey }) : null;
  }
  return store;
}

/** In-memory counters, used when the database is not configured or not reachable. */
const memory = new Map<string, ReturnType<typeof createRateLimiter>>();
function consumeInMemory(bucket: string, limit: number, windowSeconds: number) {
  const key = `${limit}:${windowSeconds}`;
  let limiter = memory.get(key);
  if (!limiter) {
    limiter = createRateLimiter({ limit, windowMs: windowSeconds * 1000 });
    memory.set(key, limiter);
  }
  return limiter.check(bucket);
}

let warned = false;
async function consume(bucket: string, limit: number, windowSeconds: number) {
  const durable = usageStore();
  if (durable) {
    try {
      return await durable.consume(bucket, limit, windowSeconds);
    } catch (error) {
      if (!warned) {
        warned = true;
        console.error(`[ai-guard] usage counters unavailable, using in-memory limits: ${error instanceof Error ? error.message : "unexpected"}`);
      }
    }
  }
  return consumeInMemory(bucket, limit, windowSeconds);
}

/**
 * Budget check for an AI call the server starts itself (the follow-up prepared for a new lead).
 * It counts against its own daily limit and against the daily limit for all AI features.
 */
export async function allowBackgroundAi(feature: "lead_followup"): Promise<boolean> {
  const perDay = limitFromEnv("AI_LIMIT_LEAD_FOLLOWUP_PER_DAY", 40);
  const totalPerDay = limitFromEnv("AI_LIMIT_TOTAL_PER_DAY", TOTAL_PER_DAY);
  for (const [bucket, limit] of [[`${feature}:day`, perDay], ["all:day", totalPerDay]] as const) {
    const decision = await consume(bucket, limit, DAY);
    if (!decision.allowed) {
      console.error(`[ai-guard] daily cap reached for "${bucket}"`);
      return false;
    }
  }
  return true;
}

/** Checks a request against every control. Call it after validating the input and before calling the provider. */
export async function guardAi(request: NextRequest, feature: AiFeature): Promise<GuardResult> {
  if (!isSameOrigin(request)) return { ok: false, code: "forbidden", status: 403 };

  // The assessment is the site's core feature; the chat demo can be switched off at once.
  if (feature !== "assessment" && process.env.AI_DEMOS_DISABLED === "1") return { ok: false, code: "disabled", status: 503 };

  const limits = limitsFor(feature);
  const checks: readonly (readonly [string, number, number])[] = [
    // The visitor is checked first, so one abusive client cannot use up the shared daily budget.
    [`${feature}:visitor:${visitorLabel(request)}`, limits.perVisitor, limits.visitorWindowSeconds],
    [`${feature}:day`, limits.perDay, DAY],
    ["all:day", limits.totalPerDay, DAY],
  ];
  for (const [bucket, limit, windowSeconds] of checks) {
    const decision = await consume(bucket, limit, windowSeconds);
    if (!decision.allowed) {
      // The visitor has had their live-chat trial: the page offers a consultation instead.
      if (feature === "chat" && bucket.includes(":visitor:")) return { ok: false, code: "trial_used", status: 429 };
      if (!bucket.includes(":visitor:")) console.error(`[ai-guard] daily cap reached for "${bucket}"`);
      return { ok: false, code: "rate_limited", status: 429, retryAfterSeconds: decision.retryAfterSeconds };
    }
  }
  return { ok: true };
}
