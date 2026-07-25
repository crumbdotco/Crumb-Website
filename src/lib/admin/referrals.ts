/**
 * Service-role Supabase queries for the referral clicks admin dashboard, plus
 * management of the referral_codes registry (create / list / activate).
 * Bypasses RLS, MUST stay server-side only.
 */

import { createClient } from '@supabase/supabase-js';
import { isValidReferralCode, normaliseReferralCode } from '@/lib/referral-code';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

interface ClickAggregate {
  total: number;
  ios: number;
  android: number;
  other: number;
  last7d: number;
  firstClickAt: string;
  lastClickAt: string;
}

export interface ReferralCodeRecord {
  code: string;
  creatorName: string;
  note: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ReferralCodeStats extends ReferralCodeRecord {
  total: number;
  ios: number;
  android: number;
  other: number;
  last7d: number;
  firstClickAt: string | null;
  lastClickAt: string | null;
}

export interface UnregisteredCodeStats extends ClickAggregate {
  code: string;
}

export interface ReferralStatsSummary {
  /** Every registered code, including ones with zero clicks so far. */
  codes: ReferralCodeStats[];
  /** Codes that have received clicks but were never registered. */
  unregistered: UnregisteredCodeStats[];
  totalUniqueClicks: number;
  activeCodes: number;
  totalCodes: number;
  totalLast7d: number;
}

export type CreateReferralCodeResult =
  | { ok: true; record: ReferralCodeRecord }
  | { ok: false; error: 'invalid_code' | 'duplicate' | 'unknown' };

export type SetReferralCodeActiveResult =
  | { ok: true }
  | { ok: false; error: 'not_found' | 'unknown' };

interface ReferralClickRow {
  code: string;
  platform: string;
  created_at: string;
}

interface ReferralCodeRow {
  code: string;
  creator_name: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
}

function toRecord(row: ReferralCodeRow): ReferralCodeRecord {
  return {
    code: row.code,
    creatorName: row.creator_name,
    note: row.note,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function aggregateClicks(rows: ReferralClickRow[]): Map<string, ClickAggregate> {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const byCode = new Map<string, ClickAggregate>();

  for (const row of rows) {
    const existing = byCode.get(row.code) ?? {
      total: 0,
      ios: 0,
      android: 0,
      other: 0,
      last7d: 0,
      firstClickAt: row.created_at,
      lastClickAt: row.created_at,
    };

    const updated: ClickAggregate = {
      ...existing,
      total: existing.total + 1,
      ios: existing.ios + (row.platform === 'ios' ? 1 : 0),
      android: existing.android + (row.platform === 'android' ? 1 : 0),
      other: existing.other + (row.platform === 'other' ? 1 : 0),
      last7d:
        existing.last7d + (new Date(row.created_at).getTime() >= sevenDaysAgo ? 1 : 0),
      firstClickAt:
        new Date(row.created_at).getTime() < new Date(existing.firstClickAt).getTime()
          ? row.created_at
          : existing.firstClickAt,
      lastClickAt:
        new Date(row.created_at).getTime() > new Date(existing.lastClickAt).getTime()
          ? row.created_at
          : existing.lastClickAt,
    };

    byCode.set(row.code, updated);
  }

  return byCode;
}

/**
 * Fetch the referral_codes registry LEFT JOINed with click aggregates:
 * every registered code appears even with zero clicks, and any code with
 * clicks that was never registered is returned separately as `unregistered`.
 */
export async function fetchReferralStats(): Promise<ReferralStatsSummary> {
  const supabase = adminClient();

  const [clicksResult, codesResult] = await Promise.all([
    supabase.from('referral_clicks').select('code, platform, created_at'),
    supabase
      .from('referral_codes')
      .select('code, creator_name, note, is_active, created_at'),
  ]);

  if (clicksResult.error) throw clicksResult.error;
  if (codesResult.error) throw codesResult.error;

  const clickRows = (clicksResult.data ?? []) as ReferralClickRow[];
  const codeRows = (codesResult.data ?? []) as ReferralCodeRow[];

  const aggregates = aggregateClicks(clickRows);
  const registeredCodeSet = new Set(codeRows.map((r) => r.code));

  const codes: ReferralCodeStats[] = codeRows
    .map((row) => {
      const agg = aggregates.get(row.code);
      return {
        ...toRecord(row),
        total: agg?.total ?? 0,
        ios: agg?.ios ?? 0,
        android: agg?.android ?? 0,
        other: agg?.other ?? 0,
        last7d: agg?.last7d ?? 0,
        firstClickAt: agg?.firstClickAt ?? null,
        lastClickAt: agg?.lastClickAt ?? null,
      };
    })
    .sort((a, b) => b.total - a.total);

  const unregistered: UnregisteredCodeStats[] = Array.from(aggregates.entries())
    .filter(([code]) => !registeredCodeSet.has(code))
    .map(([code, agg]) => ({ code, ...agg }))
    .sort((a, b) => b.total - a.total);

  const totalUniqueClicks =
    codes.reduce((sum, c) => sum + c.total, 0) +
    unregistered.reduce((sum, c) => sum + c.total, 0);
  const activeCodes = codes.filter((c) => c.isActive).length;
  const totalLast7d =
    codes.reduce((sum, c) => sum + c.last7d, 0) +
    unregistered.reduce((sum, c) => sum + c.last7d, 0);

  return {
    codes,
    unregistered,
    totalUniqueClicks,
    activeCodes,
    totalCodes: codes.length,
    totalLast7d,
  };
}

export async function listReferralCodes(): Promise<ReferralCodeRecord[]> {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from('referral_codes')
    .select('code, creator_name, note, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ReferralCodeRow[]).map(toRecord);
}

export async function createReferralCode(input: {
  code: string;
  creatorName: string;
  note?: string | null;
}): Promise<CreateReferralCodeResult> {
  const trimmedCode = input.code.trim();
  const creatorName = input.creatorName.trim();

  if (!isValidReferralCode(trimmedCode) || !creatorName) {
    return { ok: false, error: 'invalid_code' };
  }

  const normalisedCode = normaliseReferralCode(trimmedCode);
  const supabase = adminClient();

  const { data, error } = await supabase
    .from('referral_codes')
    .insert({
      code: normalisedCode,
      creator_name: creatorName,
      note: input.note?.trim() || null,
    })
    .select('code, creator_name, note, is_active, created_at')
    .single();

  if (error) {
    // Postgres unique-violation code.
    if (error.code === '23505') {
      return { ok: false, error: 'duplicate' };
    }
    return { ok: false, error: 'unknown' };
  }

  return { ok: true, record: toRecord(data as ReferralCodeRow) };
}

export async function setReferralCodeActive(
  code: string,
  isActive: boolean
): Promise<SetReferralCodeActiveResult> {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from('referral_codes')
    .update({ is_active: isActive })
    .eq('code', normaliseReferralCode(code))
    .select('code')
    .maybeSingle();

  if (error) return { ok: false, error: 'unknown' };
  if (!data) return { ok: false, error: 'not_found' };
  return { ok: true };
}
