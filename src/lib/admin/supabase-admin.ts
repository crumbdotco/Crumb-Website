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
    waitlist,
    profiles,
    onboarded,
    premium,
    reviews,
    reviewsLast7d,
    newProfilesLast7d,
    newWaitlistLast7d,
  ] = await Promise.all([
    supabase.from('waitlist').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_onboarded', true),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_premium', true),
    supabase
      .from('restaurant_reviews')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('restaurant_reviews')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
    supabase
      .from('waitlist')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
  ]);

  return {
    waitlistCount: waitlist.count ?? 0,
    profilesCount: profiles.count ?? 0,
    onboardedCount: onboarded.count ?? 0,
    premiumCount: premium.count ?? 0,
    reviewsCount: reviews.count ?? 0,
    reviewsLast7d: reviewsLast7d.count ?? 0,
    newProfilesLast7d: newProfilesLast7d.count ?? 0,
    newWaitlistLast7d: newWaitlistLast7d.count ?? 0,
  };
}
