import "server-only";
import { AiError, audioExtension, createRateLimiter, TRANSCRIBE_MAX_BYTES, transcribeSpeech } from "@ix/ai";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 25_000;

// Abuse and cost controls. In-memory: see the note in @ix/ai rate-limit before a public launch.
const perVisitor = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 });
const global = createRateLimiter({ limit: 500, windowMs: 24 * 60 * 60 * 1000 });

type ErrorCode = "invalid_input" | "rate_limited" | "not_configured" | "upstream_error";

function fail(code: ErrorCode, status: number, correlationId: string, headers?: Record<string, string>) {
  return NextResponse.json({ error: { code }, correlationId }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function clientKey(request: NextRequest): string {
  // Set by the hosting proxy. Unknown clients share one bucket rather than bypassing the limit.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Speech to text for the hero prompt. The body is the recorded clip itself; `locale` in
 * the query says which language to expect. The clip is transcribed and then discarded.
 */
export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID();

  const locale = request.nextUrl.searchParams.get("locale");
  const contentType = request.headers.get("content-type") ?? "";
  if ((locale !== "en" && locale !== "ar") || !audioExtension(contentType)) return fail("invalid_input", 400, correlationId);

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > TRANSCRIBE_MAX_BYTES) return fail("invalid_input", 413, correlationId);
  const audio = new Uint8Array(await request.arrayBuffer());
  if (audio.byteLength === 0) return fail("invalid_input", 400, correlationId);
  if (audio.byteLength > TRANSCRIBE_MAX_BYTES) return fail("invalid_input", 413, correlationId);

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_TRANSCRIBE_MODEL;
  if (!apiKey || !model) {
    console.error(`[transcribe ${correlationId}] not configured: OPENAI_API_KEY and OPENAI_TRANSCRIBE_MODEL are required`);
    return fail("not_configured", 503, correlationId);
  }

  const visitor = perVisitor.check(clientKey(request));
  if (!visitor.allowed) return fail("rate_limited", 429, correlationId, { "Retry-After": String(visitor.retryAfterSeconds) });
  const overall = global.check("all");
  if (!overall.allowed) {
    console.error(`[transcribe ${correlationId}] daily global cap reached`);
    return fail("rate_limited", 429, correlationId, { "Retry-After": String(overall.retryAfterSeconds) });
  }

  try {
    const text = await transcribeSpeech({ apiKey, model, audio, contentType, language: locale, signal: AbortSignal.timeout(TIMEOUT_MS) });
    // Size only: never the audio or the transcript.
    console.warn(`[transcribe ${correlationId}] ok model=${model} bytes=${audio.byteLength}`);
    return NextResponse.json({ text, correlationId }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof AiError ? `${error.code}${error.status ? ` http=${error.status}` : ""}` : "unexpected";
    console.error(`[transcribe ${correlationId}] failed: ${detail}`);
    return fail("upstream_error", 502, correlationId);
  }
}
