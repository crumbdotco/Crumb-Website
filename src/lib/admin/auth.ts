import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Admin gate — checks that the current Supabase session belongs to a
 * user listed in ADMIN_USER_IDS. Returns the user id on success,
 * `null` when not authorised.
 *
 * Why ID-list and not a role/RLS check: keeps the admin allowlist out
 * of Postgres, avoids the bootstrap problem (granting a role to your
 * own row) and keeps revocation a single-env-var change.
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
  if (error || !data.user) return null;

  const allowlist = (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allowlist.includes(data.user.id)) return null;

  return data.user.id;
}
