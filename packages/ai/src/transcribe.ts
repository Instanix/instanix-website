import { AiError } from "./provider";

/** Longest clip the website records, and the size that allows for it at speech bitrates. */
export const TRANSCRIBE_MAX_SECONDS = 20;
export const TRANSCRIBE_MAX_BYTES = 1_500_000;
export const TRANSCRIBE_MAX_TEXT = 600;

/** Containers browsers produce with MediaRecorder. Anything else is refused. */
const EXTENSIONS: Readonly<Record<string, string>> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};

/** The file extension for a recording's media type, or null when the type is not accepted. */
export function audioExtension(contentType: string): string | null {
  const type = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return EXTENSIONS[type] ?? null;
}

interface TranscribeOptions {
  /** Read from server-side configuration only. */
  readonly apiKey: string;
  /** Provider model ID. Always configuration, never hard-coded in product logic. */
  readonly model: string;
  readonly audio: Uint8Array;
  readonly contentType: string;
  readonly language: "en" | "ar";
  readonly signal?: AbortSignal;
  readonly baseUrl?: string;
  readonly fetchImpl?: typeof fetch;
}

/**
 * Turns a short voice clip into text. The clip is sent to the provider for this one call
 * and is not kept by us; the result is plain, untrusted text for a form field.
 */
export async function transcribeSpeech({
  apiKey,
  model,
  audio,
  contentType,
  language,
  signal,
  baseUrl = "https://api.openai.com/v1",
  fetchImpl = fetch,
}: TranscribeOptions): Promise<string> {
  const extension = audioExtension(contentType);
  if (!extension || audio.byteLength === 0 || audio.byteLength > TRANSCRIBE_MAX_BYTES) {
    throw new AiError("invalid_output", "The recording is not an accepted audio clip");
  }

  const form = new FormData();
  form.set("file", new Blob([audio as BlobPart], { type: contentType.split(";")[0] ?? "audio/webm" }), `speech.${extension}`);
  form.set("model", model);
  form.set("language", language);
  form.set("response_format", "json");

  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
      throw new AiError("timeout", "The provider did not answer in time");
    }
    throw new AiError("upstream", "Could not reach the provider");
  }
  // Status only: provider error bodies can echo request content.
  if (!response.ok) throw new AiError("upstream", `Provider returned HTTP ${response.status}`, response.status);

  const payload: unknown = await response.json();
  const text = typeof payload === "object" && payload !== null && "text" in payload && typeof payload.text === "string" ? payload.text : null;
  if (text === null) throw new AiError("invalid_output", "Provider response has no transcript");
  return text.replace(/\s+/g, " ").trim().slice(0, TRANSCRIBE_MAX_TEXT);
}
