/**
 * Purpose: Read and mutate the server-only Crumbify moderation surface.
 * Security and brand rules: Require the verified bearer for every RPC, keep the service-role
 * key confined to the GoTrue admin client only (every moderation RPC is granted to
 * `authenticated`, so the RPC client authenticates as the caller via the anon key plus the
 * caller's bearer JWT, never the service-role key), and never expose moderation details,
 * raw error text, or money-related copy.
 * Interface: Exported moderation data types, input type guards, and bearer-aware service
 * functions.
 * Test IDs: none (server-only file).
 */

import { createClient } from '@supabase/supabase-js';

export type ReportSource = 'post_reports' | 'group_content_reports';
export type ReportStatus = 'queued' | 'actioned' | 'dismissed';
export type ReportStatusFilter = ReportStatus | 'all';

export interface ModerationReport {
  source: ReportSource;
  id: string;
  target_type: string;
  target_id: string;
  reporter_id: string | null;
  reason: string | null;
  category: string | null;
  note: string | null;
  status: ReportStatus;
  emailed: boolean | null;
  created_at: string;
  handled_by: string | null;
  handled_at: string | null;
  report_number: number | null;
}

export interface ModerationBan {
  user_id: string;
  username: string | null;
  shadow_banned_at: string | null;
  hard_banned_at: string | null;
  reason: string | null;
  actor_id: string | null;
  updated_at: string;
  identity_count: number;
}

export interface ModerationAuditEntry {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  created_at: string;
}

export type ModerationAvailability<T> =
  | { available: true; rows: T[] }
  | { available: false };

export interface ModerationData {
  reports: ModerationAvailability<ModerationReport>;
  bans: ModerationAvailability<ModerationBan>;
  audit: ModerationAvailability<ModerationAuditEntry>;
}

export interface ModerationQueryOptions {
  before?: string | null;
  status?: ReportStatusFilter;
}

interface RpcClient {
  rpc(name: string, params?: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown | null }>;
}

interface ServiceRoleClient {
  auth: {
    admin: {
      updateUserById(userId: string, attributes: { ban_duration: string }): Promise<{ error: unknown | null }>;
    };
  };
}

export interface ModerationDependencies {
  /**
   * The bearer-aware RPC client used for every moderation RPC. Every RPC this
   * module calls is granted to `authenticated` (migration 370), so this
   * client authenticates using the project anon key as the `apikey` plus the
   * caller's verified admin access token as the `Authorization` bearer -
   * never the service-role key. Naming it "service role" here previously
   * misdescribed what the client actually is and invited exactly the mixed
   * anon-key/service-role-key confusion this rename fixes.
   */
  createVerifiedRpcClient(accessToken: string): RpcClient;
  /**
   * The GoTrue admin client. This is the ONLY client in this module allowed
   * to hold the service-role key, and it never carries a caller bearer
   * header - GoTrue's admin API is authorised by the service-role key alone.
   */
  createServiceRoleClient(): ServiceRoleClient;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Matches exactly the shape `Date.prototype.toISOString()` produces (the
// only shape this module's own cursor links emit). A loose `Date.parse`-only
// check previously accepted anything the runtime's date parser tolerates
// ("1", "2026", "Dec 25"), which Postgres's `timestamptz` input either
// rejects outright or parses under different rules than the browser/Node
// date parser does.
const ISO_8601_INSTANT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// Shared page-size constants. Previously duplicated as an independent
// literal in this module (`p_limit: 50`) and in the page component
// (`REPORT_PAGE_SIZE = 50`); a future change to one without the other would
// have silently desynced the RPC page size from the "Older reports" cursor
// logic that depends on knowing when a page is "full".
export const REPORT_PAGE_SIZE = 50;

// The audit log RPC (`admin_audit_log`) defaults to 100 rows server-side
// when no `p_limit` is passed. This module now passes the limit explicitly
// so the cap is visible here (not just as an implicit RPC default) and the
// page can render an honest "latest N entries" note from the same value.
export const AUDIT_HISTORY_LIMIT = 100;

// Matches the app repo's `supabase/functions/admin-moderate/index.ts`
// HARD_BAN_DURATION ("effectively forever", GoTrue has no literal
// "permanent" ban duration). Used only for the compensating re-ban below:
// if the GoTrue ban is cleared but the `admin_unban` audit RPC then fails,
// the user must NOT end up unbanned with zero audit trail, so this module
// puts the same hard ban back rather than leaving a half-completed unban.
const HARD_BAN_DURATION = '876000h';
const UNBAN_DURATION = 'none';

function productionDependencies(): ModerationDependencies {
  return {
    createVerifiedRpcClient(accessToken) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anonKey) throw new Error('Supabase admin RPC client is not configured');
      return createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });
    },
    createServiceRoleClient() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) throw new Error('Supabase service role is not configured');
      return createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    },
  };
}

export function isModerationUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function isModerationCursor(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ISO_8601_INSTANT_RE.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

export function isReportSource(value: unknown): value is ReportSource {
  return value === 'post_reports' || value === 'group_content_reports';
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return value === 'queued' || value === 'actioned' || value === 'dismissed';
}

export function isReportStatusFilter(value: unknown): value is ReportStatusFilter {
  return value === 'all' || isReportStatus(value);
}

function isReportInputValid(input: {
  source: unknown;
  reportId: unknown;
  status: unknown;
}): input is { source: ReportSource; reportId: string; status: ReportStatus } {
  return isReportSource(input.source) && isModerationUuid(input.reportId) && isReportStatus(input.status);
}

function resolveReportStatusFilter(status: ReportStatusFilter | undefined): ReportStatus | null {
  if (status === undefined) return 'queued';
  if (status === 'all') return null;
  return status;
}

/**
 * Pulls only the fields safe to log from an unknown thrown/returned error:
 * a Postgres/PostgREST error code and an HTTP-ish status, never the message
 * (Supabase/Postgres error messages can echo user emails or other row
 * content) and never any token or credential.
 */
function describeServerError(error: unknown): { code: string | null; status: string | number | null } {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const rawCode = record.code;
    const rawStatus = record.status;
    return {
      code: typeof rawCode === 'string' || typeof rawCode === 'number' ? String(rawCode) : null,
      status: typeof rawStatus === 'string' || typeof rawStatus === 'number' ? rawStatus : null,
    };
  }
  return { code: null, status: null };
}

/**
 * The one logging entry point for this module's server-side error sinks.
 * Every RPC/GoTrue failure this module handles is logged here before it is
 * turned into a generic, UI-safe message - operators get the code/status to
 * diagnose with, callers never see raw Supabase error text.
 */
export function logModerationServerError(operation: string, error: unknown): void {
  const { code, status } = describeServerError(error);
  console.error('[moderation] operation failed', { operation, code, status });
}

async function readModerationRows<T>(
  rpcName: string,
  request: PromiseLike<{ data: unknown; error: unknown | null }>,
): Promise<ModerationAvailability<T>> {
  let result: { data: unknown; error: unknown | null };
  try {
    result = await request;
  } catch (err) {
    logModerationServerError(rpcName, err);
    return { available: false };
  }
  if (result.error) {
    logModerationServerError(rpcName, result.error);
    return { available: false };
  }
  return { available: true, rows: (result.data ?? []) as T[] };
}

/**
 * Thrown by `unbanModerationUser` when the GoTrue ban was already cleared
 * but the `admin_unban` audit RPC then failed. The service re-applies the
 * hard ban as a best-effort compensating action before throwing this, so
 * the account is never left unbanned with no audit row - but the caller
 * still needs a DISTINCT signal from a plain failure, because "the unban
 * did not happen" (ordinary failure) and "the unban was attempted, rolled
 * back, and needs a retry" (this error) are different operator stories.
 */
export class ModerationUnbanPartialError extends Error {
  constructor(message = 'Unable to record the unban after the ban was cleared; the ban was restored') {
    super(message);
    this.name = 'ModerationUnbanPartialError';
  }
}

export function createModerationService(dependencies: ModerationDependencies) {
  return {
    async fetchModerationData(
      accessToken: string,
      options: ModerationQueryOptions = {},
    ): Promise<ModerationData> {
      const client = dependencies.createVerifiedRpcClient(accessToken);
      const reportParams = {
        p_status: resolveReportStatusFilter(options.status),
        p_limit: REPORT_PAGE_SIZE,
        p_before: isModerationCursor(options.before) ? options.before : null,
      };
      const [reports, bans, audit] = await Promise.all([
        readModerationRows<ModerationReport>('admin_list_reports', client.rpc('admin_list_reports', reportParams)),
        readModerationRows<ModerationBan>('admin_list_bans', client.rpc('admin_list_bans')),
        readModerationRows<ModerationAuditEntry>(
          'admin_audit_log',
          client.rpc('admin_audit_log', { p_limit: AUDIT_HISTORY_LIMIT }),
        ),
      ]);
      return { reports, bans, audit };
    },

    async setModerationReportStatus(
      accessToken: string,
      input: { source: ReportSource; reportId: string; status: ReportStatus },
    ): Promise<void> {
      if (!isReportInputValid(input)) throw new Error('Invalid moderation report status input');
      const { error } = await dependencies.createVerifiedRpcClient(accessToken).rpc('admin_set_report_status', {
        p_source: input.source,
        p_report_id: input.reportId,
        p_status: input.status,
      });
      if (error) {
        logModerationServerError('admin_set_report_status', error);
        throw new Error('Unable to update moderation report status');
      }
    },

    async unbanModerationUser(accessToken: string, userId: string): Promise<void> {
      if (!isModerationUuid(userId)) throw new Error('Invalid moderation user id');
      const rpcClient = dependencies.createVerifiedRpcClient(accessToken);
      let adminCheck: { data: unknown; error: unknown | null };
      try {
        adminCheck = await rpcClient.rpc('is_platform_admin');
      } catch (err) {
        logModerationServerError('is_platform_admin', err);
        throw new Error('Unable to verify moderation admin access');
      }
      if (adminCheck.error || adminCheck.data !== true) {
        if (adminCheck.error) logModerationServerError('is_platform_admin', adminCheck.error);
        throw new Error('Unable to verify moderation admin access');
      }

      const { error: authError } = await dependencies
        .createServiceRoleClient()
        .auth.admin.updateUserById(userId, { ban_duration: UNBAN_DURATION });
      if (authError) {
        logModerationServerError('auth.admin.updateUserById', authError);
        throw new Error('Unable to unban moderation user');
      }

      const { error: rpcError } = await rpcClient.rpc('admin_unban', { p_user_id: userId });
      if (rpcError) {
        logModerationServerError('admin_unban', rpcError);

        // Best-effort compensation: the GoTrue ban is already cleared, but
        // the audit-writing RPC failed, so re-apply the hard ban rather than
        // leave the account unbanned with no audit row. A failure here must
        // never mask the original admin_unban failure below.
        try {
          const { error: reBanError } = await dependencies
            .createServiceRoleClient()
            .auth.admin.updateUserById(userId, { ban_duration: HARD_BAN_DURATION });
          if (reBanError) {
            logModerationServerError('auth.admin.updateUserById (compensating re-ban)', reBanError);
          }
        } catch (err) {
          logModerationServerError('auth.admin.updateUserById (compensating re-ban)', err);
        }

        throw new ModerationUnbanPartialError();
      }
    },
  };
}

const service = createModerationService(productionDependencies());

export const fetchModerationData = service.fetchModerationData;
export const setModerationReportStatus = service.setModerationReportStatus;
export const unbanModerationUser = service.unbanModerationUser;
