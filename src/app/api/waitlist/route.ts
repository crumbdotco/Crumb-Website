import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/rate-limit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any, 'public', any>;

// RFC 5322-compliant email regex (practical subset)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Disposable/throwaway email providers — block on signup
const DISPOSABLE_DOMAINS = new Set([
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamailblock.com',
  'guerrillamail.de', 'guerrillamail.info',
  'mailinator.com', 'tempmail.com', 'throwaway.email', 'yopmail.com',
  'sharklasers.com', 'grr.la', 'dispostable.com', 'temp-mail.org',
  'fakeinbox.com', 'maildrop.cc', '10minutemail.com', 'trashmail.com',
  'tempinbox.com', 'getairmail.com', 'mohmal.com', 'emailondeck.com',
  'crazymailing.com', 'tmail.ws', 'burnermail.io', 'inboxbear.com',
]);

function getSupabase(): AdminClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(url, key);
}

function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

// Major email providers — only these domains are allowed to sign up
const ALLOWED_EMAIL_DOMAINS = new Set([
  // Google
  'gmail.com', 'googlemail.com',
  // Microsoft
  'outlook.com', 'hotmail.com', 'hotmail.co.uk', 'live.com', 'live.co.uk', 'msn.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in',
  // ProtonMail
  'protonmail.com', 'proton.me', 'pm.me',
  // AOL
  'aol.com',
  // Zoho
  'zoho.com',
  // UK ISPs
  'btinternet.com', 'sky.com', 'virginmedia.com', 'talktalk.net',
  // Other common
  'mail.com', 'fastmail.com', 'tutanota.com', 'hey.com',
]);

function isAllowedEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (ALLOWED_EMAIL_DOMAINS.has(domain)) return true;
  // Allow .ac.uk and .edu subdomains (e.g. student@city.ac.uk)
  if (domain.endsWith('.ac.uk') || domain.endsWith('.edu')) return true;
  return false;
}

/** Extract client IP from request headers */
function getClientIp(request: Request): string {
  // Vercel sets x-real-ip; x-forwarded-for can be spoofed via proxies
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? 'unknown';
}

/** Extract geo-country from Vercel's edge headers */
function getCountry(request: Request): string | null {
  return request.headers.get('x-vercel-ip-country') ?? null;
}

/** Log every signup attempt to the audit table for forensics */
async function logAuditEntry(
  supabase: AdminClient,
  entry: {
    email: string;
    ip: string;
    user_agent: string | null;
    country: string | null;
    action: string;
    blocked_reason: string | null;
  },
) {
  try {
    await supabase.from('waitlist_audit_log').insert(entry);
  } catch {
    // Audit logging is non-critical — never block the request
  }
}

/** Check persistent rate limit in the database (survives cold starts) */
async function isDbRateLimited(
  supabase: AdminClient,
  ip: string,
): Promise<boolean> {
  try {
    const { data } = await supabase.rpc('check_ip_rate_limit', {
      check_ip: ip,
      max_attempts: 5,
      window_seconds: 60,
    });
    return data === true;
  } catch {
    // If the function doesn't exist yet (pre-migration), fall through
    return false;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') ?? '';
  const country = getCountry(request);

  try {
    // ---------------------------------------------------------------
    // Layer 0: Bot user-agent detection — block before any processing
    // Blocks headless browsers, curl, python scripts, etc.
    // Returns fake success so bots think it worked and don't adapt.
    // ---------------------------------------------------------------
    const ua = userAgent.toLowerCase();
    if (
      ua.includes('headlesschrome') ||
      ua.includes('phantomjs') ||
      ua.includes('puppeteer') ||
      ua.includes('selenium') ||
      ua.includes('playwright') ||
      ua.includes('python-requests') ||
      ua.includes('python-urllib') ||
      ua.includes('node-fetch') ||
      ua.includes('go-http-client') ||
      ua.includes('scrapy') ||
      ua.includes('curl/') ||
      ua.includes('wget/') ||
      ua.includes('httpie') ||
      ua.includes('postman') ||
      ua === '' ||
      !ua
    ) {
      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------------
    // Layer 1: Origin check — only accept requests from our domain
    // ---------------------------------------------------------------
    const origin = request.headers.get('origin') ?? '';
    const allowedOrigins = [
      'https://crumbify.co.uk',
      'https://www.crumbify.co.uk',
    ];
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
    }
    if (!allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ---------------------------------------------------------------
    // Layer 1.5: Require browser-like headers — real browsers always send these
    // ---------------------------------------------------------------
    const accept = request.headers.get('accept') ?? '';
    const acceptLang = request.headers.get('accept-language') ?? '';
    if (!accept || !acceptLang) {
      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------------
    // Layer 2: In-memory rate limit (fast, best-effort on serverless)
    // ---------------------------------------------------------------
    if (isRateLimited(ip, 3, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, website, turnstileToken } = body;

    // ---------------------------------------------------------------
    // Layer 3: Honeypot — hidden field that bots fill in, humans don't
    // ---------------------------------------------------------------
    if (website) {
      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------------
    // Layer 3.5: Cloudflare Turnstile verification
    // ---------------------------------------------------------------
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && turnstileToken) {
      // Verify the token if provided
      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken as string,
            remoteip: ip,
          }),
        },
      );

      const verification = await verifyRes.json() as { success: boolean };
      if (!verification.success) {
        // Failed verification — bot with fake token. Silent reject.
        return NextResponse.json({ success: true });
      }
    } else if (turnstileSecret && !turnstileToken) {
      // No token provided but Turnstile is configured.
      // This means either the widget hasn't loaded yet or it's a bot.
      // Reject silently — real users will have the widget loaded.
      return NextResponse.json({ success: true });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 },
      );
    }

    const normalised = email.trim().toLowerCase();

    // ---------------------------------------------------------------
    // Layer 4: Email domain whitelist — only major providers allowed
    // ---------------------------------------------------------------
    if (!isAllowedEmailDomain(normalised)) {
      // Return fake success — don't write to audit log, don't give the bot any signal
      return NextResponse.json({ success: true });
    }

    const supabase = getSupabase();

    // ---------------------------------------------------------------
    // Layer 5: Database-backed rate limit (persistent across cold starts)
    // ---------------------------------------------------------------
    if (await isDbRateLimited(supabase, ip)) {
      await logAuditEntry(supabase, {
        email: normalised,
        ip,
        user_agent: userAgent,
        country,
        action: 'signup_blocked',
        blocked_reason: 'rate_limited',
      });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    // ---------------------------------------------------------------
    // Layer 6: Insert (ignoreDuplicates — never overwrites existing rows)
    // ---------------------------------------------------------------
    const { error } = await supabase.from('waitlist').upsert(
      {
        email: normalised,
        tier: 'free',
        signup_ip: ip !== 'unknown' ? ip : null,
        signup_user_agent: userAgent,
        signup_country: country,
      },
      { onConflict: 'email', ignoreDuplicates: true },
    );

    // ---------------------------------------------------------------
    // Layer 7: Audit log — record every attempt for forensics
    // ---------------------------------------------------------------
    await logAuditEntry(supabase, {
      email: normalised,
      ip,
      user_agent: userAgent,
      country,
      action: error ? 'signup_error' : 'signup_attempt',
      blocked_reason: error ? error.message : null,
    });

    if (error) {
      console.error('Waitlist insert error:', error.message);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Do not surface internal error details to the client
    if (err instanceof Error && err.message.includes('environment variables')) {
      console.error('Configuration error:', err.message);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
