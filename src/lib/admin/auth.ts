import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function parseList(env: string | undefined): string[] {
  return (env ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getAdminEmailAllowlist(): string[] {
  const configured = parseList(process.env.ADMIN_EMAILS);
  if (configured.length === 0) {
    // Fail closed: never fall back to a built-in list. Do not log the
    // configured value (there is none) or any candidate email here.
    console.warn(
      'ADMIN_EMAILS is not configured. Admin access is disabled until it is set.',
    );
    return [];
  }
  return configured.map((email) => email.toLowerCase().trim());
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return getAdminEmailAllowlist().includes(normalized);
}

/**
 * Admin gate: Cookie session — Supabase access token cookie + user email in
 * ADMIN_EMAILS. ADMIN_EMAILS is required; if it is unset or empty, admin
 * access is disabled entirely (fail closed). Returns a truthy id on success,
 * `null` when not authorised.
 */
export async function requireAdmin(): Promise<string | null> {
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
  if (error || !data.user || !isAdminEmail(data.user.email)) return null;

  return data.user.id;
}
