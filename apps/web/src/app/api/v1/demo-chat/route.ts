import "server-only";
import { AiError, createOpenAiProvider, createRateLimiter, demoChatInputSchema, runDemoChat } from "@ix/ai";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 12 * 1024;
const TIMEOUT_MS = 25_000;

// Abuse and cost controls. In-memory: see the note in @ix/ai rate-limit before a public launch.
// A visitor gets a few conversations an hour; the whole site has a daily ceiling.
const perVisitor = createRateLimiter({ limit: 30, windowMs: 60 * 60 * 1000 });
const global = createRateLimiter({ limit: 1500, windowMs: 24 * 60 * 60 * 1000 });

type ErrorCode = "invalid_input" | "rate_limited" | "not_configured" | "upstream_error";

function fail(code: ErrorCode, status: number, correlationId: string, headers?: Record<string, string>) {
  return NextResponse.json({ error: { code }, correlationId }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function clientKey(request: NextRequest): string {
  // Set by the hosting proxy. Unknown clients share one bucket rather than bypassing the limit.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** One reply from the "try the agent" demo. The conversation is never stored. */
export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID();

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return fail("invalid_input", 413, correlationId);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("invalid_input", 400, correlationId);
  }

  const input = demoChatInputSchema.safeParse(body);
  if (!input.success) return fail("invalid_input", 400, correlationId);

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!apiKey || !model) {
    console.error(`[demo-chat ${correlationId}] not configured: OPENAI_API_KEY and OPENAI_MODEL are required`);
    return fail("not_configured", 503, correlationId);
  }

  const visitor = perVisitor.check(clientKey(request));
  if (!visitor.allowed) {
    return fail("rate_limited", 429, correlationId, { "Retry-After": String(visitor.retryAfterSeconds) });
  }
  const overall = global.check("all");
  if (!overall.allowed) {
    console.error(`[demo-chat ${correlationId}] daily global cap reached`);
    return fail("rate_limited", 429, correlationId, { "Retry-After": String(overall.retryAfterSeconds) });
  }

  try {
    const { reply, usage } = await runDemoChat(createOpenAiProvider({ apiKey }), input.data, {
      model,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // Usage only: never the visitor's text or the generated reply.
    console.warn(`[demo-chat ${correlationId}] ok model=${model} in=${usage.inputTokens} out=${usage.outputTokens}`);
    return NextResponse.json({ reply, correlationId }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof AiError ? `${error.code}${error.status ? ` http=${error.status}` : ""}` : "unexpected";
    console.error(`[demo-chat ${correlationId}] failed: ${detail}`);
    return fail("upstream_error", 502, correlationId);
  }
}
