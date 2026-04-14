import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const FLOOR = 900;

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ count: FLOOR });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient<any>(url, key);
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({ count: Math.max(count ?? 0, FLOOR) });
  } catch {
    return NextResponse.json({ count: FLOOR });
  }
}
