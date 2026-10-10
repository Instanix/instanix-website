import "server-only";
import { AiError, createOpenAiProvider, officeChatInputSchema, runOfficeChat } from "@ix/ai";
import { NextResponse, type NextRequest } from "next/server";
import { guardAi } from "@/lib/server/ai-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 12 * 1024;
const TIMEOUT_MS = 25_000;

// Abuse and cost controls live in one place: see lib/server/ai-guard.
// A visitor gets one short trial of the live chat; after that the site offers a consultation.

type ErrorCode = "invalid_input" | "forbidden" | "trial_used" | "rate_limited" | "not_configured" | "upstream_error";

function fail(code: ErrorCode, status: number, correlationId: string, headers?: Record<string, string>) {
  return NextResponse.json({ error: { code }, correlationId }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** One reply from an IX agent in the office demo. The conversation is never stored. */
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

  const input = officeChatInputSchema.safeParse(body);
  if (!input.success) return fail("invalid_input", 400, correlationId);

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!apiKey || !model) {
    console.error(`[office-chat ${correlationId}] not configured: OPENAI_API_KEY and OPENAI_MODEL are required`);
    return fail("not_configured", 503, correlationId);
  }

  const guard = await guardAi(request, "chat");
  if (!guard.ok) {
    if (guard.code === "forbidden") return fail("forbidden", 403, correlationId);
    if (guard.code === "disabled") return fail("not_configured", 503, correlationId);
    if (guard.code === "trial_used") return fail("trial_used", 429, correlationId);
    return fail("rate_limited", 429, correlationId, { "Retry-After": String(guard.retryAfterSeconds ?? 60) });
  }

  try {
    const { reply, usage } = await runOfficeChat(createOpenAiProvider({ apiKey }), input.data, {
      model,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // Usage only: never the visitor's text or the generated reply.
    console.warn(`[office-chat ${correlationId}] ok agent=${input.data.agent} model=${model} in=${usage.inputTokens} out=${usage.outputTokens}`);
    return NextResponse.json({ reply, correlationId }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof AiError ? `${error.code}${error.status ? ` http=${error.status}` : ""}` : "unexpected";
    console.error(`[office-chat ${correlationId}] failed: ${detail}`);
    return fail("upstream_error", 502, correlationId);
  }
}
