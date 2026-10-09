import "server-only";
import { assessmentInputSchema, assessmentSchema, createRateLimiter } from "@ix/ai";
import { getAgent } from "@ix/agents";
import { leadContactSchema } from "@ix/db";
import { formatLeadNotification } from "@ix/integrations";
import { after, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getLeadStore } from "@/lib/server/leads";
import { getLeadMail } from "@/lib/server/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 24 * 1024;

// In-memory: see the note in @ix/ai rate-limit before a public launch.
const perVisitor = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });

/** Everything here is untrusted, including the assessment the browser sends back. */
const leadRequestSchema = z.object({
  assessmentId: z.uuid(),
  contact: leadContactSchema,
  input: assessmentInputSchema,
  assessment: assessmentSchema,
});

type ErrorCode = "invalid_input" | "rate_limited" | "not_configured" | "storage_error";

function fail(code: ErrorCode, status: number, correlationId: string) {
  return NextResponse.json({ error: { code }, correlationId }, { status, headers: { "Cache-Control": "no-store" } });
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

  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) return fail("invalid_input", 400, correlationId);

  const store = getLeadStore();
  if (!store) {
    console.error(`[leads ${correlationId}] not configured: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required`);
    return fail("not_configured", 503, correlationId);
  }

  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!perVisitor.check(key).allowed) return fail("rate_limited", 429, correlationId);

  const { assessmentId, contact, input, assessment } = parsed.data;
  let created: boolean;
  try {
    created = await store.insert({
      assessmentId,
      locale: input.locale,
      contact,
      industry: input.industry,
      companySize: input.companySize,
      country: input.country,
      problem: input.problem,
      tools: input.tools,
      assessment,
    });
  } catch (error) {
    // Never log the personal details themselves.
    console.error(`[leads ${correlationId}] failed: ${error instanceof Error ? error.message : "unexpected"}`);
    return fail("storage_error", 502, correlationId);
  }

  console.warn(`[leads ${correlationId}] ${created ? "stored" : "already stored"} assessment=${assessmentId}`);

  // Tell the owner, once per lead. It runs after the response is sent, so the visitor is not
  // kept waiting on the mail server, and a mail failure cannot fail a lead that is already saved.
  if (created) {
    after(async () => {
      try {
        const mail = getLeadMail();
        if (!mail) return;
        const { subject, text } = formatLeadNotification({
          name: contact.name,
          company: contact.company,
          phone: contact.phone,
          email: contact.email,
          locale: input.locale,
          industry: input.industry,
          companySize: input.companySize,
          country: input.country,
          problem: input.problem,
          tools: input.tools,
          summary: assessment.summary,
          team: assessment.team.map(({ agent }) => getAgent(agent).name),
          assessmentId,
        });
        await mail.mailer.send({ to: mail.to, subject, text, ...(contact.email ? { replyTo: contact.email } : {}) });
        console.warn(`[leads ${correlationId}] owner notified`);
      } catch (error) {
        console.error(`[leads ${correlationId}] notification failed: ${error instanceof Error ? error.message : "unexpected"}`);
      }
    });
  }
  return NextResponse.json({ ok: true, correlationId }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
