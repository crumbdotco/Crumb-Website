/**
 * Single source for the founding-member cap.
 *
 * The cap used to be duplicated as two independent literals (webhook's
 * FOUNDING_CAP, founding route's MAX_FOUNDING) that had to be kept in sync by
 * hand. It now lives server-side in the app repo's `growth_config` table
 * (founder_cap column, seeded by migration 371) and is read through the
 * `get_founding_cap()` RPC, which both `authenticated` and `service_role`
 * may call. This module is the only place either Next.js route reads the
 * cap from.
 *
 * Fail-CLOSED contract: this module never guesses. Any failure to read the
 * live value (the RPC call itself throwing/rejecting, the RPC returning an
 * error, or the returned value not being a finite number >= 1 - null, a
 * string, NaN, 0, or negative) throws FoundingCapUnavailableError instead of
 * returning a fallback number. A cap moving is meant to be reflected
 * everywhere the instant it changes; a hardcoded fallback here would be a
 * second source of truth that silently disagrees with the server the day
 * the cap moves. Every caller decides what "unavailable" means for its own
 * surface (refuse to grant/deactivate, or degrade a display) - this module
 * only ever returns a real, usable cap or throws.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = { rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<any> };

export class FoundingCapUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FoundingCapUnavailableError";
  }
}

function isValidCap(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1;
}

function describeUnusableValue(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export async function getFoundingCap(supabase: SupabaseLike): Promise<number> {
  let result: { data?: unknown; error?: { message: string } | null };

  try {
    result = await supabase.rpc("get_founding_cap");
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown error";
    console.error("get_founding_cap RPC threw, refusing to guess the cap:", reason);
    throw new FoundingCapUnavailableError(`get_founding_cap RPC threw: ${reason}`);
  }

  const { data, error } = result;

  if (error) {
    console.error("get_founding_cap RPC returned an error, refusing to guess the cap:", error.message);
    throw new FoundingCapUnavailableError(`get_founding_cap RPC error: ${error.message}`);
  }

  if (!isValidCap(data)) {
    const unusable = describeUnusableValue(data);
    console.error("get_founding_cap RPC returned an unusable value, refusing to guess the cap:", unusable);
    throw new FoundingCapUnavailableError(`get_founding_cap RPC returned an unusable value: ${unusable}`);
  }

  return data;
}
