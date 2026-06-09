import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const MAX_FOUNDING = 100;

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ count: 0, remaining: MAX_FOUNDING, closed: false });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient<any>(url, key);
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("tier", "founding_member");

    const safeCount = count ?? 0;
    const remaining = Math.max(0, MAX_FOUNDING - safeCount);
    const closed = safeCount >= MAX_FOUNDING;

    return NextResponse.json({ count: safeCount, remaining, closed });
  } catch {
    return NextResponse.json({ count: 0, remaining: MAX_FOUNDING, closed: false });
  }
}
