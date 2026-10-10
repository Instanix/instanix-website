import { describe, expect, it } from "vitest";
import { createUsageStore, DbError } from "./index";

function fakeFetch(body: unknown, status = 200) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  return { impl, calls };
}

describe("usage store", () => {
  it("calls the counter function with the service key and returns its decision", async () => {
    const { impl, calls } = fakeFetch([{ allowed: true, retry_after_seconds: 0 }]);
    const store = createUsageStore({ url: "https://db.example/", serviceKey: "service-key", fetchImpl: impl });
    await expect(store.consume("chat:day", 600, 86400)).resolves.toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(calls[0]?.url).toBe("https://db.example/rest/v1/rpc/ix_consume_usage");
    expect(JSON.parse(String(calls[0]?.init.body))).toEqual({ p_bucket: "chat:day", p_limit: 600, p_window_seconds: 86400 });
    expect(new Headers(calls[0]?.init.headers).get("apikey")).toBe("service-key");
  });

  it("reports a refusal with the time until the window resets", async () => {
    const { impl } = fakeFetch([{ allowed: false, retry_after_seconds: 1200 }]);
    const store = createUsageStore({ url: "https://db.example", serviceKey: "k", fetchImpl: impl });
    await expect(store.consume("chat:visitor:abc", 18, 3600)).resolves.toEqual({ allowed: false, retryAfterSeconds: 1200 });
  });

  it("throws on database errors and on a malformed result, so the caller can fall back", async () => {
    const failing = createUsageStore({ url: "https://db.example", serviceKey: "k", fetchImpl: fakeFetch({}, 500).impl });
    await expect(failing.consume("b", 1, 60)).rejects.toBeInstanceOf(DbError);
    const odd = createUsageStore({ url: "https://db.example", serviceKey: "k", fetchImpl: fakeFetch([{ ok: 1 }]).impl });
    await expect(odd.consume("b", 1, 60)).rejects.toBeInstanceOf(DbError);
  });
});
