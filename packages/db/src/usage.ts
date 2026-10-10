import { DbError } from "./index";

export interface UsageDecision {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}

export interface UsageStore {
  /**
   * Counts one use of `bucket` in the current window and says whether it is within `limit`.
   * The count is shared by every server instance and survives restarts.
   */
  consume(bucket: string, limit: number, windowSeconds: number): Promise<UsageDecision>;
}

/**
 * Usage counters on Supabase, through the `ix_consume_usage` function. Server only: the
 * function is granted to the service role alone.
 */
export function createUsageStore({
  url,
  serviceKey,
  fetchImpl = fetch,
}: {
  readonly url: string;
  readonly serviceKey: string;
  readonly fetchImpl?: typeof fetch;
}): UsageStore {
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/rpc/ix_consume_usage`;
  return {
    async consume(bucket, limit, windowSeconds) {
      let response: Response;
      try {
        response = await fetchImpl(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify({ p_bucket: bucket, p_limit: limit, p_window_seconds: windowSeconds }),
          signal: AbortSignal.timeout(4000),
        });
      } catch {
        throw new DbError("Could not reach the database");
      }
      if (!response.ok) throw new DbError(`Database returned HTTP ${response.status}`, response.status);

      const rows: unknown = await response.json().catch(() => null);
      const row: unknown = Array.isArray(rows) ? rows[0] : rows;
      if (typeof row !== "object" || row === null || !("allowed" in row) || typeof row.allowed !== "boolean") {
        throw new DbError("The usage counter returned an unexpected result");
      }
      const retry = "retry_after_seconds" in row && typeof row.retry_after_seconds === "number" ? row.retry_after_seconds : 0;
      return { allowed: row.allowed, retryAfterSeconds: Math.max(0, retry) };
    },
  };
}
