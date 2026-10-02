import { NextResponse } from "next/server";

/**
 * POST /api/waitlist: CLOSED (owner decision 2026-10-02).
 *
 * The iOS app is live on the App Store, so the free waitlist has ended.
 * This endpoint no longer accepts signups: it performs NO database write,
 * NO Turnstile call and sends NO email. Existing waitlist rows are left
 * untouched. Founding-member sales use /api/waitlist/founding (spot count)
 * and /api/stripe/webhook, which are unaffected.
 */
export async function POST() {
  return NextResponse.json({ error: "waitlist_closed" }, { status: 410 });
}
