import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'sb-access-token';
const COOKIE_MAX_AGE = 60 * 60;
const ALLOWED_ORIGINS = new Set([
  'https://crumbify.co.uk',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

export function isAllowedAdminSessionRequest(
  origin: string | null,
  referer: string | null,
): boolean {
  if (origin !== null) {
    if (!origin || origin === 'null') {
      return false;
    }

    try {
      const parsedOrigin = new URL(origin).origin;
      return origin === parsedOrigin && ALLOWED_ORIGINS.has(parsedOrigin);
    } catch {
      return false;
    }
  }

  if (!referer) {
    return false;
  }

  try {
    return ALLOWED_ORIGINS.has(new URL(referer).origin);
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
