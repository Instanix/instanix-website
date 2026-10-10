import { z } from "zod";

/** Tenant #1 (Instanix). Matches the seed row in supabase/migrations. */
export const INSTANIX_ORGANIZATION_ID = "00000000-0000-4000-8000-000000000001";

export class DbError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "DbError";
    this.status = status;
  }
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .default(null);

/** Contact details a visitor leaves to unlock the full assessment. Untrusted input. */
export const leadContactSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    company: optionalText(120),
    // Spaces, dashes and brackets are accepted and stripped; the stored form is digits with an optional "+".
    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[\s().-]/g, ""))
      .refine((value) => value === "" || /^\+?\d{8,15}$/.test(value))
      .transform((value) => (value === "" ? null : value))
      .nullable()
      .default(null),
    email: z
      .string()
      .trim()
      .max(254)
      .refine((value) => value === "" || z.email().safeParse(value).success)
      .transform((value) => (value === "" ? null : value.toLowerCase()))
      .nullable()
      .default(null),
    // Storing personal details requires an explicit yes.
    consent: z.literal(true),
  })
  .refine((lead) => lead.phone !== null || lead.email !== null, { path: ["phone"] });

export type LeadContact = z.infer<typeof leadContactSchema>;

export interface LeadRecord {
  readonly assessmentId: string;
  readonly locale: "en" | "ar";
  readonly contact: LeadContact;
  readonly industry: string;
  readonly companySize: string;
  readonly country: string;
  readonly problem: string;
  readonly tools: string;
  readonly assessment: unknown;
}

export interface LeadStore {
  /**
   * Saves a lead. Submitting the same assessment twice stores it once.
   * Resolves to true when a new row was created, false when it already existed.
   */
  insert(lead: LeadRecord): Promise<boolean>;
}

/**
 * Lead storage on Supabase through its REST interface. It runs on the server only,
 * with the service role key, because RLS denies the public roles all access.
 */
export function createLeadStore({
  url,
  serviceKey,
  organizationId = INSTANIX_ORGANIZATION_ID,
  fetchImpl = fetch,
  now = () => new Date(),
}: {
  readonly url: string;
  readonly serviceKey: string;
  readonly organizationId?: string;
  readonly fetchImpl?: typeof fetch;
  readonly now?: () => Date;
}): LeadStore {
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/leads?on_conflict=organization_id,assessment_id&select=id`;

  return {
    async insert(lead) {
      let response: Response;
      try {
        response = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            // A repeated submission of the same assessment is ignored, not duplicated.
            Prefer: "resolution=ignore-duplicates,return=representation",
          },
          body: JSON.stringify({
            organization_id: organizationId,
            assessment_id: lead.assessmentId,
            locale: lead.locale,
            name: lead.contact.name,
            company: lead.contact.company,
            phone: lead.contact.phone,
            email: lead.contact.email,
            consent_at: now().toISOString(),
            industry: lead.industry,
            company_size: lead.companySize,
            country: lead.country,
            problem: lead.problem,
            tools: lead.tools,
            assessment: lead.assessment,
          }),
        });
      } catch {
        throw new DbError("Could not reach the database");
      }
      if (!response.ok) {
        // Status only: error bodies can echo the submitted personal details.
        throw new DbError(`Database returned HTTP ${response.status}`, response.status);
      }
      // An ignored duplicate comes back as an empty list.
      const rows: unknown = await response.json().catch(() => null);
      return Array.isArray(rows) && rows.length > 0;
    },
  };
}

export { createUsageStore, type UsageDecision, type UsageStore } from "./usage";
