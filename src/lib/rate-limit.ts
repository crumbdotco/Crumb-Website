/**
 * Simple in-memory rate limiter for API routes.
 * Suitable for single-server deployments (Vercel serverless has short-lived instances
 * so this provides best-effort protection, not a hard guarantee).
 * For stronger guarantees, use Upstash Redis (@upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically to prevent memory growth
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

/**
 * Check if a request is rate limited.
 * @param key - Unique identifier (e.g. IP address)
 * @param limit - Max requests per window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request should be BLOCKED
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}
