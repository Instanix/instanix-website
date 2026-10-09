import "server-only";
import { createLeadStore, type LeadStore } from "@ix/db";

/**
 * Lead storage is optional configuration: without it the site still works and the
 * full assessment is simply shown without asking for contact details.
 */
export function getLeadStore(): LeadStore | null {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createLeadStore({ url, serviceKey });
}

export function leadsEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
