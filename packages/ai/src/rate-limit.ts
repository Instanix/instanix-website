export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string): RateLimitDecision;
}

/**
 * Fixed-window, in-memory limiter. It protects a single server process only:
 * on serverless or multi-instance hosting each instance counts separately, so a
 * shared store must replace this before a public launch.
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: {
  readonly limit: number;
  readonly windowMs: number;
  readonly now?: () => number;
}): RateLimiter {
  const windows = new Map<string, { startedAt: number; count: number }>();

  return {
    check(key) {
      const time = now();
      // Drop expired windows so the map cannot grow without bound.
      for (const [storedKey, window] of windows) {
        if (time - window.startedAt >= windowMs) windows.delete(storedKey);
      }

      const window = windows.get(key);
      if (!window) {
        windows.set(key, { startedAt: time, count: 1 });
        return { allowed: true, retryAfterSeconds: 0 };
      }
      if (window.count >= limit) {
        return { allowed: false, retryAfterSeconds: Math.ceil((window.startedAt + windowMs - time) / 1000) };
      }
      window.count += 1;
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
