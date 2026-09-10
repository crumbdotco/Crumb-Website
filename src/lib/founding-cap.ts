/**
 * Single source for the founding-member cap.
 *
 * The cap used to be duplicated as two independent literals (webhook's
 * FOUNDING_CAP, founding route's MAX_FOUNDING) that had to be kept in sync by
 * hand. It now lives server-side in the app repo's `growth_config` table
 * (founder_cap column) and is read through the `get_founding_cap()` RPC,
 * which both `authenticated` and `service_role` may call. This module is the
 * only place either Next.js route reads the cap from.
 *
 * Fail-open contract: any failure to read the live value (RPC error, a null
 * result, or a non-numeric/out-of-range result) falls back to
 * DEFAULT_FOUNDING_CAP, never to 0 - a cap of 0 would incorrectly close the
 * founding offer or deactivate the payment link. Caps are never lowered
 * (owner decision), so 100 remains a safe historical floor to fall back to.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = { rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<any> };

export const DEFAULT_FOUNDING_CAP = 100;

function isValidCap(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1;
}

export async function getFoundingCap(supabase: SupabaseLike): Promise<number> {
  try {
    const { data, error } = await supabase.rpc("get_founding_cap");

    if (error || !isValidCap(data)) {
      console.warn(
        "get_founding_cap RPC did not return a usable value, falling back to DEFAULT_FOUNDING_CAP:",
        error ? error.message : `received ${JSON.stringify(data)}`
      );
      return DEFAULT_FOUNDING_CAP;
    }

    return data;
  } catch (err) {
    console.warn(
      "get_founding_cap RPC threw, falling back to DEFAULT_FOUNDING_CAP:",
      err instanceof Error ? err.message : "unknown error"
    );
    return DEFAULT_FOUNDING_CAP;
  }
}
