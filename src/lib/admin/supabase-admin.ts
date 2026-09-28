/**
 * Service-role Supabase queries for the admin dashboard. Bypasses RLS,
 * MUST stay server-side only.
 */

import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function readCount(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
): Promise<number> {
  const { count, error } = await query;
  if (error) throw new Error(`Supabase count read failed: ${error.message}`);
  if (typeof count !== 'number' || !Number.isFinite(count)) {
    throw new Error('Supabase count read returned no count');
  }
  return count;
}

export interface SupabaseAdminMetrics {
  waitlistCount: number;
  profilesCount: number;
  onboardedCount: number;
  premiumCount: number;
  reviewsCount: number;
  reviewsLast7d: number;
  newProfilesLast7d: number;
  newWaitlistLast7d: number;
}

export async function fetchSupabaseAdminMetrics(): Promise<SupabaseAdminMetrics> {
  const supabase = adminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    waitlistCount,
    profilesCount,
    onboardedCount,
    premiumCount,
    reviewsCount,
    reviewsLast7dCount,
    newProfilesLast7dCount,
    newWaitlistLast7dCount,
  ] = await Promise.all([
    readCount(supabase.from('waitlist').select('id', { count: 'exact', head: true })),
    readCount(supabase.from('profiles').select('id', { count: 'exact', head: true })),
    readCount(
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_onboarded', true),
    ),
    readCount(
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_premium', true),
    ),
    readCount(
      supabase
        .from('restaurant_reviews')
        .select('id', { count: 'exact', head: true }),
    ),
    readCount(
      supabase
        .from('restaurant_reviews')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
    ),
    readCount(
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
    ),
    readCount(
      supabase
        .from('waitlist')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
    ),
  ]);

  return {
    waitlistCount,
    profilesCount,
    onboardedCount,
    premiumCount,
    reviewsCount,
    reviewsLast7d: reviewsLast7dCount,
    newProfilesLast7d: newProfilesLast7dCount,
    newWaitlistLast7d: newWaitlistLast7dCount,
  };
}
