import { describe, expect, it } from "vitest";
import { createLeadStore, DbError, INSTANIX_ORGANIZATION_ID, leadContactSchema, type LeadRecord } from "./index";

const contact = { name: "Sara Ali", company: "", phone: "+971 50 123 4567", email: "", consent: true };

describe("lead contact validation", () => {
  it("normalizes the phone number and empty optional fields", () => {
    expect(leadContactSchema.parse(contact)).toEqual({
      name: "Sara Ali",
      company: null,
      phone: "+971501234567",
      email: null,
      consent: true,
    });
  });

  it("accepts email alone and lowercases it", () => {
    expect(leadContactSchema.parse({ ...contact, phone: "", email: "Sara@Example.com" }).email).toBe("sara@example.com");
  });

  it("rejects a lead with no way to reach the person", () => {
    expect(leadContactSchema.safeParse({ ...contact, phone: "", email: "" }).success).toBe(false);
  });

  it("rejects missing consent, bad phone, bad email and a one-letter name", () => {
    expect(leadContactSchema.safeParse({ ...contact, consent: false }).success).toBe(false);
    expect(leadContactSchema.safeParse({ ...contact, phone: "call me" }).success).toBe(false);
    expect(leadContactSchema.safeParse({ ...contact, email: "not-an-email" }).success).toBe(false);
    expect(leadContactSchema.safeParse({ ...contact, name: "S" }).success).toBe(false);
  });
});

describe("lead store", () => {
  const lead: LeadRecord = {
    assessmentId: "7f0c2f6e-5a53-4b0e-9d0a-0f0b6a2f6c11",
    locale: "en",
    contact: leadContactSchema.parse(contact),
    industry: "retail",
    companySize: "small",
    country: "AE",
    problem: "Leads are not followed up.",
    tools: "",
    assessment: { summary: "x" },
  };

  it("writes to the organization's leads with the service key in headers only", async () => {
    let sent: { url: string; init: RequestInit } | undefined;
    const store = createLeadStore({
      url: "https://example.supabase.co/",
      serviceKey: "service-key",
      now: () => new Date("2026-10-09T08:00:00Z"),
      fetchImpl: async (url, init) => {
        sent = { url: String(url), init: init ?? {} };
        return new Response(JSON.stringify([{ id: "row-1" }]), { status: 201 });
      },
    });
    expect(await store.insert(lead)).toBe(true);

    expect(sent?.url).toBe("https://example.supabase.co/rest/v1/leads?on_conflict=organization_id,assessment_id&select=id");
    const headers = sent?.init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer service-key");
    expect(headers.Prefer).toContain("resolution=ignore-duplicates");
    const body = JSON.parse(String(sent?.init.body));
    expect(body).toMatchObject({
      organization_id: INSTANIX_ORGANIZATION_ID,
      assessment_id: lead.assessmentId,
      phone: "+971501234567",
      email: null,
      consent_at: "2026-10-09T08:00:00.000Z",
    });
    expect(String(sent?.init.body)).not.toContain("service-key");
  });

  it("scopes the row to the organization it was created for", async () => {
    let body = "";
    const store = createLeadStore({
      url: "https://example.supabase.co",
      serviceKey: "k",
      organizationId: "11111111-1111-4111-8111-111111111111",
      fetchImpl: async (_url, init) => {
        body = String(init?.body);
        return new Response("[]", { status: 200 });
      },
    });
    // An empty list means the assessment was already stored.
    expect(await store.insert(lead)).toBe(false);
    expect(JSON.parse(body).organization_id).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("raises DbError on a rejected write and on a network failure", async () => {
    const rejected = createLeadStore({ url: "https://x.supabase.co", serviceKey: "k", fetchImpl: async () => new Response("denied", { status: 401 }) });
    await expect(rejected.insert(lead)).rejects.toMatchObject({ name: "DbError", status: 401 });

    const offline = createLeadStore({
      url: "https://x.supabase.co",
      serviceKey: "k",
      fetchImpl: async () => {
        throw new TypeError("network");
      },
    });
    await expect(offline.insert(lead)).rejects.toBeInstanceOf(DbError);
  });
});
