import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CODE_PATTERN = /^[A-Za-z0-9_-]{2,64}$/;

type Platform = "ios" | "android" | "other";

function detectPlatform(userAgent: string | null): Platform {
  if (!userAgent) return "other";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

function resolveDestination(platform: Platform): string {
  if (platform === "ios") {
    return process.env.NEXT_PUBLIC_APP_STORE_URL || "/";
  }
  if (platform === "android") {
    return process.env.NEXT_PUBLIC_PLAY_STORE_URL || "/";
  }
  return "/";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || !CODE_PATTERN.test(code)) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const userAgent = request.headers.get("user-agent");
  const platform = detectPlatform(userAgent);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient<any>(url, key);
      const { error } = await supabase.from("referral_clicks").insert({
        code,
        platform,
        user_agent: userAgent,
      });
      if (error) {
        console.error("referral_clicks insert failed:", error);
      }
    } catch (err) {
      console.error("referral_clicks insert threw:", err);
    }
  }

  const destination = resolveDestination(platform);
  return NextResponse.redirect(new URL(destination, request.url), 302);
}
