import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAllowedOrigin } from '@/lib/waitlist-guards';

/**
 * Vercel Edge Middleware — runs BEFORE any API route or page.
 * Blocks bot traffic to /api/waitlist at the CDN edge, so the
 * serverless function never even starts.
 */

// Known bot/headless user-agent fragments
const BOT_UA_FRAGMENTS = [
  'headlesschrome',
  'phantomjs',
  'puppeteer',
  'selenium',
  'playwright',
  'python-requests',
  'python-urllib',
  'node-fetch',
  'go-http-client',
  'scrapy',
  'curl/',
  'wget/',
  'httpie',
  'postman',
];

export function middleware(request: NextRequest) {
  // Only gate the waitlist endpoint
  if (!request.nextUrl.pathname.startsWith('/api/waitlist')) {
    return NextResponse.next();
  }

  const ua = (request.headers.get('user-agent') ?? '').toLowerCase();

  // Block empty user-agent
  if (!ua) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Block known bot user-agents — return fake success so they don't adapt
  for (const fragment of BOT_UA_FRAGMENTS) {
    if (ua.includes(fragment)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
  }

  // Block requests missing browser headers (Accept-Language, Referer)
  const acceptLang = request.headers.get('accept-language');
  const referer = request.headers.get('referer') ?? '';
  if (!acceptLang) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Referer must be from our domain (browsers always send this for same-origin fetch)
  let refererOrigin = '';
  if (referer) {
    try {
      refererOrigin = new URL(referer).origin;
    } catch {
      refererOrigin = '';
    }
  }
  if (
    request.method === 'POST' &&
    referer &&
    !isAllowedOrigin(refererOrigin, {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    })
  ) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/waitlist',
};
