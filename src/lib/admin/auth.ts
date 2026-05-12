import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

const IP_BYPASS_SENTINEL = 'ip-bypass';

function getRequestIp(headerList: Headers): string | null {
  const xff = headerList.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return headerList.get('x-real-ip')?.trim() ?? null;
}

function parseList(env: string | undefined): string[] {
  return (env ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Admin gate. Two paths:
 *   1. ADMIN_IPS allowlist — request IP match grants access without a session
 *      (operator convenience for the single human admin from a known IP).
 *   2. Cookie session — Supabase access token cookie + user id in ADMIN_USER_IDS.
 * Returns a truthy id on success, `null` when not authorised.
 */
export async function requireAdmin(): Promise<string | null> {
  const headerList = await headers();
  const ip = getRequestIp(headerList);

  const ipAllowlist = parseList(process.env.ADMIN_IPS);
  if (ip && ipAllowlist.includes(ip)) {
    return IP_BYPASS_SENTINEL;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  if (!accessToken) return null;

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const allowlist = parseList(process.env.ADMIN_USER_IDS);
  if (!allowlist.includes(data.user.id)) return null;

  return data.user.id;
}

export async function getCallerIp(): Promise<string | null> {
  const headerList = await headers();
  return getRequestIp(headerList);
}
