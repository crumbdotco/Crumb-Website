import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'sb-access-token';
const COOKIE_MAX_AGE = 60 * 60;

export async function POST(req: NextRequest) {
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
