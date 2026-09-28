import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import {
  GENERIC_ERROR_MESSAGE,
  NON_ALLOWED_DOMAIN_MESSAGE,
  RATE_LIMITED_MESSAGE,
  isAllowedEmailDomain,
  isAllowedOrigin,
  isBotUserAgent,
  isDisposableEmailDomain,
  isValidEmail,
} from "@/lib/waitlist-guards";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any, "public", any>;

const DB_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DB_RATE_LIMIT_MAX = 60;
const IN_MEMORY_RATE_LIMIT_MAX = 20;
const IN_MEMORY_RATE_LIMIT_WINDOW_MS = 60_000;
const TURNSTILE_TIMEOUT_MS = 5_000;
const TURNSTILE_REQUIRED_MESSAGE = "Please complete the bot check, then try again.";
const TURNSTILE_FAILED_MESSAGE = "The bot check could not be verified. Please try again.";

type TurnstileVerification = "verified" | "failed" | "unavailable";

function getSupabase(): AdminClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(url, key);
}

/** Extract client IP from request headers */
function getClientIp(request: Request): string {
  // Vercel sets x-real-ip; x-forwarded-for can be spoofed via proxies
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

async function isDbRateLimited(supabase: AdminClient, ip: string): Promise<boolean> {
  if (ip === "unknown") return false;
  try {
    const since = new Date(Date.now() - DB_RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("waitlist")
      .select("id", { count: "exact", head: true })
      .eq("signup_ip", ip)
      .gte("created_at", since);
    return (count ?? 0) >= DB_RATE_LIMIT_MAX;
  } catch {
    // If the read itself fails, do not block real signups on it.
    return false;
  }
}

async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string,
): Promise<TurnstileVerification> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT_MS);

  try {
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: ip,
        }),
        signal: controller.signal,
      },
    );
    const verification = (await verifyRes.json()) as { success: boolean };
    return verification.success === true ? "verified" : "failed";
  } catch {
    return "unavailable";
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    // ---------------------------------------------------------------
    // Layer 0: Bot user-agent detection - block before any processing.
    // Returns fake success so bots think it worked and don't adapt.
    // ---------------------------------------------------------------
    if (isBotUserAgent(userAgent)) {
      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------------
    // Layer 1: Origin check - only accept requests from our domain
    // (or a Vercel preview deployment of this project).
    // ---------------------------------------------------------------
    const origin = request.headers.get("origin") ?? "";
    if (
      !isAllowedOrigin(origin, {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      })
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ---------------------------------------------------------------
    // Layer 1.5: Require browser-like headers.
    // ---------------------------------------------------------------
    const accept = request.headers.get("accept") ?? "";
    const acceptLang = request.headers.get("accept-language") ?? "";
    if (!accept || !acceptLang) {
      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------------
    // Layer 2: In-memory rate limit (fast, best-effort on serverless).
    // 20/min per IP: an event has many real people on the same wifi/NAT.
    // ---------------------------------------------------------------
    if (isRateLimited(ip, IN_MEMORY_RATE_LIMIT_MAX, IN_MEMORY_RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, website, turnstileToken } = body ?? {};

    // ---------------------------------------------------------------
    // Layer 3: Honeypot - hidden field bots fill in, humans don't.
    // ---------------------------------------------------------------
    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    // ---------------------------------------------------------------
    // Layer 4: Disposable-domain block.
    // ---------------------------------------------------------------
    if (isDisposableEmailDomain(normalised)) {
      return NextResponse.json({ error: NON_ALLOWED_DOMAIN_MESSAGE }, { status: 400 });
    }

    // ---------------------------------------------------------------
    // Layer 5: Email domain allow-list. A real attendee must know their
    // email was rejected - never fake success here.
    // ---------------------------------------------------------------
    if (!isAllowedEmailDomain(normalised)) {
      return NextResponse.json({ error: NON_ALLOWED_DOMAIN_MESSAGE }, { status: 400 });
    }

    // ---------------------------------------------------------------
    // Layer 3.5: Turnstile verification. It is enforced only after the
    // email checks so a rejected address never burns a one-time token.
    // ---------------------------------------------------------------
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSiteKey && turnstileSecret) {
      if (typeof turnstileToken !== "string" || !turnstileToken) {
        return NextResponse.json({ error: TURNSTILE_REQUIRED_MESSAGE }, { status: 400 });
      }

      const verification = await verifyTurnstile(turnstileToken, turnstileSecret, ip);
      if (verification === "failed") {
        return NextResponse.json({ error: TURNSTILE_FAILED_MESSAGE }, { status: 400 });
      }
      if (verification === "unavailable") {
        console.warn("Turnstile verification unavailable; allowing signup to continue");
      }
    }

    const supabase = getSupabase();

    // ---------------------------------------------------------------
    // Layer 6: Database-backed rate limit (persistent across cold starts).
    // ---------------------------------------------------------------
    if (await isDbRateLimited(supabase, ip)) {
      return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { status: 429 });
    }

    // ---------------------------------------------------------------
    // Layer 7: Check existence first - a repeat email is a success.
    // ---------------------------------------------------------------
    const { data: existing } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", normalised)
      .maybeSingle();

    if (existing !== null) {
      return NextResponse.json({ success: true, alreadyExists: true });
    }

    const { error: insertError } = await supabase.from("waitlist").insert({
      email: normalised,
      tier: "free",
      signup_ip: ip !== "unknown" ? ip : null,
      signup_user_agent: userAgent,
    });

    if (insertError) {
      const message = insertError.message ?? "";
      if (message.toLowerCase().includes("blocked")) {
        // DB trigger trg_block_bot_inserts rejected the domain (belt and braces).
        return NextResponse.json({ error: NON_ALLOWED_DOMAIN_MESSAGE }, { status: 400 });
      }
      console.error("Waitlist insert error:", message);
      return NextResponse.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
    }

    return NextResponse.json({ success: true, alreadyExists: false });
  } catch (err) {
    console.error(
      "Waitlist route error:",
      err instanceof Error ? err.message : "unknown error",
    );
    return NextResponse.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}
