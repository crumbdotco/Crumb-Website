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

interface AlertResponse {
  ok: boolean;
}

export interface ModerationDependencies {
  createBearerClient(accessToken: string): RpcClient;
  createServiceRoleClient(): ServiceRoleClient;
  fetch(url: string, init: RequestInit): Promise<AlertResponse>;
  getEnvironment(): { resendApiKey?: string; reportsEmailFrom?: string; reportsEmailTo?: string };
  now(): Date;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function productionDependencies(): ModerationDependencies {
  return {
    createBearerClient(accessToken) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anonKey) throw new Error('Supabase is not configured');
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
    fetch: (url, init) => globalThis.fetch(url, init),
    getEnvironment: () => ({
      resendApiKey: process.env.RESEND_API_KEY,
      reportsEmailFrom: process.env.REPORTS_EMAIL_FROM,
      reportsEmailTo: process.env.REPORTS_EMAIL_TO,
    }),
    now: () => new Date(),
  };
}

function isReportInputValid(input: {
  source: ReportSource;
  reportId: string;
  status: ReportStatus;
}): boolean {
  return (
    (input.source === 'post_reports' || input.source === 'group_content_reports') &&
    UUID_RE.test(input.reportId) &&
    (input.status === 'queued' || input.status === 'actioned' || input.status === 'dismissed')
  );
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
      const client = dependencies.createBearerClient(accessToken);
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
      const { error } = await dependencies.createBearerClient(accessToken).rpc('admin_set_report_status', {
        p_source: input.source,
        p_report_id: input.reportId,
        p_status: input.status,
      });
      if (error) throw new Error('Unable to update moderation report status');
    },

    async unbanModerationUser(accessToken: string, userId: string): Promise<void> {
      if (!UUID_RE.test(userId)) throw new Error('Invalid moderation user id');
      const { error: authError } = await dependencies
        .createServiceRoleClient()
        .auth.admin.updateUserById(userId, { ban_duration: 'none' });
      if (authError) throw new Error('Unable to unban moderation user');

      const { error: rpcError } = await dependencies
        .createBearerClient(accessToken)
        .rpc('admin_unban', { p_user_id: userId });
      if (rpcError) throw new Error('Unable to unban moderation user');
    },

    async sendUnauthorizedModerationAlert(userId: string, email: string | null): Promise<void> {
      const { resendApiKey, reportsEmailFrom, reportsEmailTo } = dependencies.getEnvironment();
      if (!resendApiKey || !reportsEmailFrom || !reportsEmailTo) return;

      const emailLine = email ? ` Email: ${email}.` : '';
      const text = `Unauthorized moderation access attempt. User ID: ${userId}.${emailLine} Path: /admin/moderation. Timestamp: ${dependencies.now().toISOString()}.`;
      try {
        await dependencies.fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
            'X-Priority': '1',
          },
          body: JSON.stringify({
            from: reportsEmailFrom,
            to: [reportsEmailTo],
            subject: 'Unauthorized moderation access attempt',
            text,
          }),
        });
      } catch {
        // Alerts are best effort. Do not expose delivery failures to the page.
      }
    },
  };
}

const service = createModerationService(productionDependencies());

export const fetchModerationData = service.fetchModerationData;
export const setModerationReportStatus = service.setModerationReportStatus;
export const unbanModerationUser = service.unbanModerationUser;
export const sendUnauthorizedModerationAlert = service.sendUnauthorizedModerationAlert;
