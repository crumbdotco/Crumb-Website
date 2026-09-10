import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getFoundingCap } from "@/lib/founding-cap";

/**
 * Public founding-availability endpoint, read by FoundingSection.tsx on the
 * landing page. Always responds 200 - this is a display surface, not a
 * grant/deny decision, so it degrades rather than refuses (unlike the
 * webhook's deactivation check, which fails closed). It never invents a
 * value: `count` is present only when the live row count was actually read;
 * `remaining` and `closed` are present only when the live cap was actually
 * read too. A cap-read blip must never be reported as `closed: true` (a
 * fabricated "closed" would wrongly hide the CTA), so `closed` is omitted
 * rather than defaulted whenever the cap is unavailable - the CTA still
 * routes to Stripe, whose own payment-link deactivation and the SQL grant
 * check are the real gates, not this endpoint.
 */
export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Founding availability unavailable: Supabase environment variables are not configured");
    return NextResponse.json({ capAvailable: false });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: ReturnType<typeof createClient<any>>;
  let safeCount: number;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase = createClient<any>(url, key);
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("tier", "founding_member");
    safeCount = count ?? 0;
  } catch (err) {
    console.error(
      "Founding availability unavailable: waitlist count read failed:",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.json({ capAvailable: false });
  }

  try {
    const cap = await getFoundingCap(supabase);
    const remaining = Math.max(0, cap - safeCount);
    const closed = safeCount >= cap;

    return NextResponse.json({ count: safeCount, remaining, closed, capAvailable: true });
  } catch (err) {
    console.error(
      "Founding availability degraded: cap unavailable:",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.json({ count: safeCount, capAvailable: false });
  }
}
