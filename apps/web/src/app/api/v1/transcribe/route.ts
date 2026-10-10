import "server-only";
import { AiError, audioExtension, TRANSCRIBE_MAX_BYTES, transcribeSpeech } from "@ix/ai";
import { NextResponse, type NextRequest } from "next/server";
import { guardAi } from "@/lib/server/ai-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 25_000;

// Abuse and cost controls live in one place: see lib/server/ai-guard.

type ErrorCode = "invalid_input" | "forbidden" | "rate_limited" | "not_configured" | "upstream_error";

function fail(code: ErrorCode, status: number, correlationId: string, headers?: Record<string, string>) {
  return NextResponse.json({ error: { code }, correlationId }, { status, headers: { "Cache-Control": "no-store", ...headers } });
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

  const guard = await guardAi(request, "transcribe");
  if (!guard.ok) {
    if (guard.code === "forbidden") return fail("forbidden", 403, correlationId);
    if (guard.code === "disabled") return fail("not_configured", 503, correlationId);
    return fail("rate_limited", 429, correlationId, { "Retry-After": String(guard.retryAfterSeconds ?? 60) });
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
