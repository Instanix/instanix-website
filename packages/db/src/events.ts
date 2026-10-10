import { z } from "zod";
import { DbError } from "./index";

/** One page view or one action on the public site, as the browser reports it. Untrusted input. */
export const siteEventSchema = z
  .object({
    kind: z.enum(["view", "action"]),
    name: z
      .string()
      .regex(/^[a-z0-9_]{1,40}$/)
      .nullable()
      .default(null),
    // A path on this site, without query string or fragment.
    path: z
      .string()
      .min(1)
      .max(200)
      .regex(/^\/[^?#\s]*$/),
    locale: z.enum(["en", "ar"]),
    // The referring page; only its host is kept.
    referrer: z.string().max(2000).nullable().default(null),
  })
  .refine((event) => (event.kind === "view") === (event.name === null), { path: ["name"] });

export type SiteEventInput = z.infer<typeof siteEventSchema>;

export interface SiteEventRecord {
  readonly kind: "view" | "action";
  readonly name: string | null;
  readonly path: string;
  readonly locale: "en" | "ar";
  /** Host only, or null. */
  readonly referrer: string | null;
  readonly device: "mobile" | "desktop";
  /** A keyed hash that changes every day. Never an IP address. */
  readonly visitor: string;
}

export interface SiteEventStore {
  insert(event: SiteEventRecord): Promise<void>;
}

/** Host of an external referrer, lower-cased and without "www.". Null for none, invalid or this site. */
export function referrerHost(referrer: string | null, ownHosts: readonly string[]): string | null {
  if (!referrer) return null;
  let host: string;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    host = url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  if (!host || host.length > 120) return null;
  const own = ownHosts.map((value) => value.toLowerCase().replace(/^www\./, "").replace(/:\d+$/, ""));
  return own.includes(host) ? null : host;
}

/**
 * Website statistics on Supabase through its REST interface. Server only, with the service
 * role key, because RLS denies the public roles all access.
 */
export function createSiteEventStore({
  url,
  serviceKey,
  fetchImpl = fetch,
}: {
  readonly url: string;
  readonly serviceKey: string;
  readonly fetchImpl?: typeof fetch;
}): SiteEventStore {
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/site_events`;
  return {
    async insert(event) {
      let response: Response;
      try {
        response = await fetchImpl(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: "return=minimal" },
          body: JSON.stringify(event),
          signal: AbortSignal.timeout(4000),
        });
      } catch {
        throw new DbError("Could not reach the database");
      }
      if (!response.ok) throw new DbError(`Database returned HTTP ${response.status}`, response.status);
    },
  };
}
