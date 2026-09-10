import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { DEFAULT_FOUNDING_CAP, getFoundingCap } from "@/lib/founding-cap";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ count: 0, remaining: DEFAULT_FOUNDING_CAP, closed: false });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient<any>(url, key);
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("tier", "founding_member");

    const cap = await getFoundingCap(supabase);
    const safeCount = count ?? 0;
    const remaining = Math.max(0, cap - safeCount);
    const closed = safeCount >= cap;

    return NextResponse.json({ count: safeCount, remaining, closed });
  } catch {
    return NextResponse.json({ count: 0, remaining: DEFAULT_FOUNDING_CAP, closed: false });
  }
}
