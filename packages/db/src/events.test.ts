import { describe, expect, it } from "vitest";
import { createSiteEventStore, DbError, referrerHost, siteEventSchema, type SiteEventRecord } from "./index";

const event: SiteEventRecord = { kind: "view", name: null, path: "/en/platform", locale: "en", referrer: "google.com", device: "mobile", visitor: "a".repeat(24) };

describe("site event validation", () => {
  it("accepts a page view and a named action", () => {
    expect(siteEventSchema.safeParse({ kind: "view", path: "/ar", locale: "ar" }).success).toBe(true);
    expect(siteEventSchema.safeParse({ kind: "action", name: "whatsapp", path: "/en", locale: "en" }).success).toBe(true);
  });

  it("rejects a view with a name, an action without one, and unsafe names", () => {
    expect(siteEventSchema.safeParse({ kind: "view", name: "x", path: "/en", locale: "en" }).success).toBe(false);
    expect(siteEventSchema.safeParse({ kind: "action", path: "/en", locale: "en" }).success).toBe(false);
    expect(siteEventSchema.safeParse({ kind: "action", name: "Drop Table", path: "/en", locale: "en" }).success).toBe(false);
  });

  it("rejects paths that carry a query string, a fragment or another site", () => {
    for (const path of ["/en?email=a@b.c", "/en#x", "https://evil.example/en", "en"]) {
      expect(siteEventSchema.safeParse({ kind: "view", path, locale: "en" }).success).toBe(false);
    }
  });
});

describe("referrerHost", () => {
  it("keeps only the host of an external referrer", () => {
    expect(referrerHost("https://www.google.com/search?q=private+words", ["instanix.ae"])).toBe("google.com");
  });

  it("drops this site, invalid values and non-web schemes", () => {
    expect(referrerHost("https://instanix.ae/en/about", ["instanix.ae"])).toBeNull();
    expect(referrerHost("http://localhost:3000/en", ["localhost:3000"])).toBeNull();
    expect(referrerHost("not a url", ["instanix.ae"])).toBeNull();
    expect(referrerHost("android-app://com.example", ["instanix.ae"])).toBeNull();
    expect(referrerHost(null, ["instanix.ae"])).toBeNull();
  });
});

describe("createSiteEventStore", () => {
  it("writes the event with the service key and never puts the key in the body", async () => {
    let sent: { url: string; init: RequestInit } | undefined;
    const store = createSiteEventStore({
      url: "https://example.supabase.co/",
      serviceKey: "service-key",
      fetchImpl: async (url, init) => {
        sent = { url: String(url), init: init ?? {} };
        return new Response(null, { status: 201 });
      },
    });
    await store.insert(event);
    expect(sent?.url).toBe("https://example.supabase.co/rest/v1/site_events");
    expect((sent?.init.headers as Record<string, string>).Authorization).toBe("Bearer service-key");
    expect(JSON.parse(String(sent?.init.body))).toEqual(event);
    expect(String(sent?.init.body)).not.toContain("service-key");
  });

  it("raises DbError on a rejected write and on a network failure", async () => {
    const rejected = createSiteEventStore({ url: "https://x.supabase.co", serviceKey: "k", fetchImpl: async () => new Response("denied", { status: 401 }) });
    await expect(rejected.insert(event)).rejects.toMatchObject({ name: "DbError", status: 401 });
    const offline = createSiteEventStore({
      url: "https://x.supabase.co",
      serviceKey: "k",
      fetchImpl: async () => {
        throw new TypeError("network");
      },
    });
    await expect(offline.insert(event)).rejects.toBeInstanceOf(DbError);
  });
});
