/**
 * Service-role Supabase queries for the referral clicks admin dashboard.
 * Bypasses RLS, MUST stay server-side only.
 */

import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface ReferralCodeStats {
  code: string;
  total: number;
  ios: number;
  android: number;
  other: number;
  last7d: number;
}

interface ReferralClickRow {
  code: string;
  platform: string;
  created_at: string;
}

export async function fetchReferralStats(): Promise<ReferralCodeStats[]> {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from('referral_clicks')
    .select('code, platform, created_at');

  if (error) throw error;

  const rows = (data ?? []) as ReferralClickRow[];
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const byCode = new Map<string, ReferralCodeStats>();

  for (const row of rows) {
    const existing = byCode.get(row.code) ?? {
      code: row.code,
      total: 0,
      ios: 0,
      android: 0,
      other: 0,
      last7d: 0,
    };

    const updated: ReferralCodeStats = {
      ...existing,
      total: existing.total + 1,
      ios: existing.ios + (row.platform === 'ios' ? 1 : 0),
      android: existing.android + (row.platform === 'android' ? 1 : 0),
      other: existing.other + (row.platform === 'other' ? 1 : 0),
      last7d:
        existing.last7d + (new Date(row.created_at).getTime() >= sevenDaysAgo ? 1 : 0),
    };

    byCode.set(row.code, updated);
  }

  return Array.from(byCode.values()).sort((a, b) => b.total - a.total);
}
