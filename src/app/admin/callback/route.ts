/**
 * Magic-link callback for /admin sign-in.
 *
 * Flow: Supabase emails the user a link with `?code=...`. Clicking it
 * lands here. We exchange the code for a session, set the access token
 * as an HTTP-only cookie, then redirect to /admin where the layout
 * checks the allowlist.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const COOKIE_NAME = 'sb-access-token';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour — short-lived, re-sign-in often

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error_description');

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/signin?error=${encodeURIComponent(error)}`, req.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/signin', req.url));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.redirect(
      new URL('/admin/signin?error=server-misconfigured', req.url),
    );
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    return NextResponse.redirect(
      new URL(
        `/admin/signin?error=${encodeURIComponent(exchangeError?.message ?? 'no session')}`,
        req.url,
      ),
    );
  }

  const response = NextResponse.redirect(new URL('/admin', req.url));
  response.cookies.set(COOKIE_NAME, data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}
