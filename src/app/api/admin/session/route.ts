/**
 * Purpose: Set the httpOnly admin-session cookie after a same-origin sign-in exchange.
 * Security and brand rules: Production accepts only exact origins (the apex, www, and the
 * current Vercel preview host when genuinely running as a Vercel preview); localhost is
 * development-only and malformed/lookalike origins fail closed. No prefix or wildcard
 * matching anywhere.
 * Interface: POST(req) accepts { accessToken: string }; origin helpers preserve exact-origin
 * and Referer fallback checks.
 * Test IDs: none (server-only file).
 */

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'sb-access-token';
const COOKIE_MAX_AGE = 60 * 60;
const PRODUCTION_ORIGINS = [
  'https://crumbify.co.uk',
  'https://www.crumbify.co.uk',
];
const DEVELOPMENT_ORIGINS = new Set([
  'https://crumbify.co.uk',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

/**
 * Vercel runs every non-production branch/PR build with NODE_ENV=production
 * (Next.js production build), so the plain NODE_ENV check alone rejects
 * every preview deploy with a 403. This adds exactly one more exact origin
 * when the request is genuinely a Vercel preview: VERCEL_ENV must literally
 * equal "preview" (never inferred from VERCEL_URL alone, which is also set
 * in real production) and VERCEL_URL must be set. No wildcard or suffix
 * matching - only that one exact host.
 */
function productionAllowedOrigins(): Set<string> {
  const origins = new Set(PRODUCTION_ORIGINS);
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }
  return origins;
}

export function isAllowedAdminSessionRequest(
  origin: string | null,
  referer: string | null,
): boolean {
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? productionAllowedOrigins()
    : DEVELOPMENT_ORIGINS;

  if (origin !== null) {
    if (!origin || origin === 'null') {
      return false;
    }

    try {
      const parsedOrigin = new URL(origin).origin;
      return origin === parsedOrigin && allowedOrigins.has(parsedOrigin);
    } catch {
      return false;
    }
  }

  if (!referer) {
    return false;
  }

  try {
    return allowedOrigins.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isAllowedAdminSessionRequest(req.headers.get('origin'), req.headers.get('referer'))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { accessToken } = await req.json();
  if (!accessToken || typeof accessToken !== 'string') {
    return NextResponse.json({ error: 'missing token' }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
