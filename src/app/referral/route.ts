import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isValidReferralCode } from "@/lib/referral-code";

export const dynamic = "force-dynamic";

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

// Never store or log the raw client IP: only a salted hash. This repo is
// public and the DB tracks UGC referral traffic, so the IP itself must not
// be persisted anywhere. `ignoreDuplicates` upsert on (code, ip_hash) keeps
// the click count to one row per unique visitor per code.
function resolveClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || !isValidReferralCode(code)) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const userAgent = request.headers.get("user-agent");
  const platform = detectPlatform(userAgent);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const salt = process.env.REFERRAL_IP_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientIp = resolveClientIp(request.headers);

  if (url && key && salt && clientIp) {
    try {
      const ipHash = hashIp(clientIp, salt);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient<any>(url, key);
      const { error } = await supabase.from("referral_clicks").upsert(
        {
          code,
          platform,
          ip_hash: ipHash,
        },
        { onConflict: "code,ip_hash", ignoreDuplicates: true }
      );
      if (error) {
        console.error("referral_clicks upsert failed:", error);
      }
    } catch (err) {
      console.error("referral_clicks upsert threw:", err);
    }
  }

  const destination = resolveDestination(platform);
  return NextResponse.redirect(new URL(destination, request.url), 302);
}
