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
  query: PromiseLike<{
    count: number | null;
    error: { code?: string | null } | null;
    status?: number;
  }>,
  metric: string,
): Promise<number | null> {
  try {
    const { count, error, status } = await query;
    if (error || typeof count !== 'number' || !Number.isFinite(count)) {
      console.error('Supabase count read unavailable:', {
        metric,
        status: status ?? 0,
        code: error?.code ?? 'COUNT_UNAVAILABLE',
      });
      return null;
    }
    return count;
  } catch {
    console.error('Supabase count read unavailable:', {
      metric,
      status: 0,
      code: 'FETCH_ERROR',
    });
    return null;
  }
}

export interface SupabaseAdminMetrics {
  waitlistCount: number | null;
  profilesCount: number | null;
  onboardedCount: number | null;
  premiumCount: number | null;
  reviewsCount: number | null;
  reviewsLast7d: number | null;
  newProfilesLast7d: number | null;
  newWaitlistLast7d: number | null;
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
    readCount(supabase.from('waitlist').select('id', { count: 'exact', head: true }), 'waitlistCount'),
    readCount(supabase.from('profiles').select('id', { count: 'exact', head: true }), 'profilesCount'),
    readCount(
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('onboarding_complete', true),
      'onboardedCount',
    ),
    readCount(
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_premium', true),
      'premiumCount',
    ),
    readCount(
      supabase
        .from('restaurant_reviews')
        .select('id', { count: 'exact', head: true }),
      'reviewsCount',
    ),
    readCount(
      supabase
        .from('restaurant_reviews')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      'reviewsLast7d',
    ),
    readCount(
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      'newProfilesLast7d',
    ),
    readCount(
      supabase
        .from('waitlist')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      'newWaitlistLast7d',
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
