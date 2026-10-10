import "server-only";
import { AiError, assessmentInputSchema, createOpenAiProvider, runProjectAssessment } from "@ix/ai";
import { NextResponse, type NextRequest } from "next/server";
import { guardAi } from "@/lib/server/ai-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;
const TIMEOUT_MS = 45_000;

// Abuse and cost controls live in one place: see lib/server/ai-guard.

type ErrorCode = "invalid_input" | "forbidden" | "rate_limited" | "not_configured" | "upstream_error";

function fail(code: ErrorCode, status: number, correlationId: string, headers?: Record<string, string>) {
  return NextResponse.json(
    { error: { code }, correlationId },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

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

  // Honeypot: real visitors never fill the hidden "website" field.
  if (typeof body === "object" && body !== null && "website" in body && body.website) {
    return fail("invalid_input", 400, correlationId);
  }

  const input = assessmentInputSchema.safeParse(body);
  if (!input.success) return fail("invalid_input", 400, correlationId);

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!apiKey || !model) {
    console.error(`[assessment ${correlationId}] not configured: OPENAI_API_KEY and OPENAI_MODEL are required`);
    return fail("not_configured", 503, correlationId);
  }

  const guard = await guardAi(request, "assessment");
  if (!guard.ok) {
    if (guard.code === "forbidden") return fail("forbidden", 403, correlationId);
    if (guard.code === "disabled") return fail("not_configured", 503, correlationId);
    return fail("rate_limited", 429, correlationId, { "Retry-After": String(guard.retryAfterSeconds ?? 60) });
  }

  try {
    const { assessment, usage } = await runProjectAssessment(createOpenAiProvider({ apiKey }), input.data, {
      model,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // Usage only — never the visitor's text or the generated content.
    console.warn(`[assessment ${correlationId}] ok model=${model} in=${usage.inputTokens} out=${usage.outputTokens}`);
    return NextResponse.json({ assessment, correlationId }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof AiError ? `${error.code}${error.status ? ` http=${error.status}` : ""}` : "unexpected";
    console.error(`[assessment ${correlationId}] failed: ${detail}`);
    return fail("upstream_error", 502, correlationId);
  }
}
