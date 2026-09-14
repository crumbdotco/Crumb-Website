/**
 * Purpose: Read and mutate the server-only Crumbify moderation surface.
 * Security and brand rules: Require the verified bearer for every RPC, keep the service-role key server-only, and never expose moderation details or money-related copy.
 * Interface: Exported moderation data types, input type guards, and bearer-aware service functions.
 * Test IDs: none (server-only file).
 */

import { createClient } from '@supabase/supabase-js';

export type ReportSource = 'post_reports' | 'group_content_reports';
export type ReportStatus = 'queued' | 'actioned' | 'dismissed';

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

interface RpcClient {
  rpc(name: string, params?: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown | null }>;
}

interface ServiceRoleClient {
  auth: {
    admin: {
      updateUserById(userId: string, attributes: { ban_duration: 'none' }): Promise<{ error: unknown | null }>;
    };
  };
}

export interface ModerationDependencies {
  createServiceRoleRpcClient(accessToken: string): RpcClient;
  createServiceRoleClient(): ServiceRoleClient;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function productionDependencies(): ModerationDependencies {
  return {
    createServiceRoleRpcClient(accessToken) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) throw new Error('Supabase service role is not configured');
      return createClient(url, serviceRoleKey, {
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

export function isReportSource(value: unknown): value is ReportSource {
  return value === 'post_reports' || value === 'group_content_reports';
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return value === 'queued' || value === 'actioned' || value === 'dismissed';
}

function isReportInputValid(input: {
  source: unknown;
  reportId: unknown;
  status: unknown;
}): input is { source: ReportSource; reportId: string; status: ReportStatus } {
  return isReportSource(input.source) && isModerationUuid(input.reportId) && isReportStatus(input.status);
}

function unavailableWhenError<T>(result: { data: unknown; error: unknown | null }): ModerationAvailability<T> {
  if (result.error) return { available: false };
  return { available: true, rows: (result.data ?? []) as T[] };
}

async function readModerationRows<T>(request: PromiseLike<{ data: unknown; error: unknown | null }>): Promise<ModerationAvailability<T>> {
  try {
    return unavailableWhenError<T>(await request);
  } catch {
    return { available: false };
  }
}

export function createModerationService(dependencies: ModerationDependencies) {
  return {
    async fetchModerationData(accessToken: string): Promise<ModerationData> {
      const client = dependencies.createServiceRoleRpcClient(accessToken);
      const [reports, bans, audit] = await Promise.all([
        readModerationRows<ModerationReport>(client.rpc('admin_list_reports')),
        readModerationRows<ModerationBan>(client.rpc('admin_list_bans')),
        readModerationRows<ModerationAuditEntry>(client.rpc('admin_audit_log')),
      ]);
      return { reports, bans, audit };
    },

    async setModerationReportStatus(
      accessToken: string,
      input: { source: ReportSource; reportId: string; status: ReportStatus },
    ): Promise<void> {
      if (!isReportInputValid(input)) throw new Error('Invalid moderation report status input');
      const { error } = await dependencies.createServiceRoleRpcClient(accessToken).rpc('admin_set_report_status', {
        p_source: input.source,
        p_report_id: input.reportId,
        p_status: input.status,
      });
      if (error) throw new Error('Unable to update moderation report status');
    },

    async unbanModerationUser(accessToken: string, userId: string): Promise<void> {
      if (!isModerationUuid(userId)) throw new Error('Invalid moderation user id');
      const rpcClient = dependencies.createServiceRoleRpcClient(accessToken);
      let adminCheck: { data: unknown; error: unknown | null };
      try {
        adminCheck = await rpcClient.rpc('is_platform_admin');
      } catch {
        throw new Error('Unable to verify moderation admin access');
      }
      if (adminCheck.error || adminCheck.data !== true) {
        throw new Error('Unable to verify moderation admin access');
      }

      const { error: authError } = await dependencies
        .createServiceRoleClient()
        .auth.admin.updateUserById(userId, { ban_duration: 'none' });
      if (authError) throw new Error('Unable to unban moderation user');

      const { error: rpcError } = await rpcClient.rpc('admin_unban', { p_user_id: userId });
      if (rpcError) throw new Error('Unable to unban moderation user');
    },
  };
}

const service = createModerationService(productionDependencies());

export const fetchModerationData = service.fetchModerationData;
export const setModerationReportStatus = service.setModerationReportStatus;
export const unbanModerationUser = service.unbanModerationUser;
