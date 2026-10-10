import "server-only";
import { createRateLimiter } from "@ix/ai";
import { createSiteEventStore, referrerHost, siteEventSchema, type SiteEventStore } from "@ix/db";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/env";
import { dailyVisitorLabel, isSameOrigin } from "@/lib/server/ai-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4 * 1024;

/**
 * First-party statistics: one row per page view or key action, with no cookie and no
 * identifier that outlives the day. The endpoint always answers 204 so it tells a caller
 * nothing, and a failure here can never affect the page.
 */

// A real visitor sends a handful of events a minute. In-memory is enough for a flood guard.
const perVisitor = createRateLimiter({ limit: 60, windowMs: 60 * 1000 });
// A ceiling on what one server instance writes in a day, whatever the source.
const perDay = createRateLimiter({ limit: 50_000, windowMs: 24 * 60 * 60 * 1000 });

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|monitor|curl|wget|python|scrapy|httpclient/i;
const MOBILE = /mobi|android|iphone|ipod/i;

let store: SiteEventStore | null | undefined;
function eventStore(): SiteEventStore | null {
  if (store === undefined) {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    store = url && serviceKey ? createSiteEventStore({ url, serviceKey }) : null;
  }
  return store;
}

const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  if (process.env.SITE_STATS_DISABLED === "1" || !isSameOrigin(request)) return done();

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT.test(userAgent)) return done();

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return done();
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return done();
  }
  const parsed = siteEventSchema.safeParse(body);
  if (!parsed.success) return done();

  const events = eventStore();
  if (!events) return done();

  const visitor = dailyVisitorLabel(request);
  if (!perVisitor.check(visitor).allowed || !perDay.check("all").allowed) return done();

  const ownHosts = [new URL(SITE_URL).host, request.headers.get("host") ?? ""].filter(Boolean);
  try {
    await events.insert({
      kind: parsed.data.kind,
      name: parsed.data.name,
      path: parsed.data.path,
      locale: parsed.data.locale,
      referrer: referrerHost(parsed.data.referrer, ownHosts),
      device: MOBILE.test(userAgent) ? "mobile" : "desktop",
      visitor,
    });
  } catch (error) {
    console.error(`[event] not stored: ${error instanceof Error ? error.message : "unexpected"}`);
  }
  return done();
}
