import { describe, expect, it } from "vitest";
import { AiError, audioExtension, TRANSCRIBE_MAX_BYTES, transcribeSpeech } from "./index";

const clip = new Uint8Array([1, 2, 3, 4]);

function fakeFetch(body: unknown, status = 200) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  return { impl, calls };
}

describe("audioExtension", () => {
  it("accepts recorder containers and ignores codec parameters", () => {
    expect(audioExtension("audio/webm;codecs=opus")).toBe("webm");
    expect(audioExtension("audio/mp4")).toBe("mp4");
  });

  it("refuses anything that is not a known audio container", () => {
    expect(audioExtension("video/mp4")).toBeNull();
    expect(audioExtension("application/octet-stream")).toBeNull();
  });
});

describe("transcribeSpeech", () => {
  it("sends the clip as a file with the configured model and language, and returns tidy text", async () => {
    const { impl, calls } = fakeFetch({ text: "  We lose leads \n after hours.  " });
    const text = await transcribeSpeech({ apiKey: "k", model: "test-model", audio: clip, contentType: "audio/webm", language: "en", fetchImpl: impl });
    expect(text).toBe("We lose leads after hours.");
    const form = calls[0]?.init.body as FormData;
    expect(calls[0]?.url).toContain("/audio/transcriptions");
    expect(form.get("model")).toBe("test-model");
    expect(form.get("language")).toBe("en");
    expect(form.get("file")).toBeInstanceOf(Blob);
  });

  it("refuses unknown types and oversized clips without calling the provider", async () => {
    const { impl, calls } = fakeFetch({ text: "x" });
    const base = { apiKey: "k", model: "m", language: "en" as const, fetchImpl: impl };
    await expect(transcribeSpeech({ ...base, audio: clip, contentType: "video/mp4" })).rejects.toBeInstanceOf(AiError);
    await expect(transcribeSpeech({ ...base, audio: new Uint8Array(TRANSCRIBE_MAX_BYTES + 1), contentType: "audio/webm" })).rejects.toBeInstanceOf(AiError);
    expect(calls).toHaveLength(0);
  });

  it("reports provider failures and malformed responses as AiError", async () => {
    const base = { apiKey: "k", model: "m", audio: clip, contentType: "audio/webm", language: "ar" as const };
    await expect(transcribeSpeech({ ...base, fetchImpl: fakeFetch({}, 500).impl })).rejects.toBeInstanceOf(AiError);
    await expect(transcribeSpeech({ ...base, fetchImpl: fakeFetch({ words: [] }).impl })).rejects.toBeInstanceOf(AiError);
  });
});
