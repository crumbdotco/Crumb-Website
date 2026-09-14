/**
 * Purpose: Render the protected Crumbify moderation dashboard for reports, bans, and audit history.
 * Security and brand rules: Gate before data reads, keep service credentials server-side, and use the existing dark admin visual language.
 * Interface: ModerationPage() server component; child sections receive typed moderation data.
 * Test IDs: none (server-only file).
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  getAdminAccessToken,
  requireAdmin,
} from '@/lib/admin/auth';
import {
  AUDIT_HISTORY_LIMIT,
  fetchModerationData,
  isModerationCursor,
  isReportStatusFilter,
  logModerationServerError,
  REPORT_PAGE_SIZE,
  type ModerationAuditEntry,
  type ModerationBan,
  type ModerationData,
  type ModerationQueryOptions,
  type ModerationReport,
  type ReportStatus,
  type ReportStatusFilter,
} from '@/lib/admin/moderation';
import { setReportStatusAction, unbanUserAction } from './actions';

export const dynamic = 'force-dynamic';

const UNAVAILABLE_DATA: ModerationData = {
  reports: { available: false },
  bans: { available: false },
  audit: { available: false },
};

const REPORT_STATUSES: ReportStatus[] = ['queued', 'actioned', 'dismissed'];
const DEFAULT_REPORT_STATUS_FILTER: ReportStatusFilter = 'queued';
const REPORT_STATUS_FILTERS: ReportStatusFilter[] = ['queued', 'actioned', 'dismissed', 'all'];
const STATUS_FILTER_LABELS: Record<ReportStatusFilter, string> = {
  queued: 'Queued',
  actioned: 'Actioned',
  dismissed: 'Dismissed',
  all: 'All statuses',
};

type ModerationSearchParams = {
  before?: string | string[];
  status?: string | string[];
  result?: string | string[];
  error?: string | string[];
};

const MODERATION_MESSAGES: Record<string, string> = {
  report_updated: 'Report status updated.',
  user_unbanned: 'User unbanned.',
  invalid_input: 'The submitted moderation input was invalid.',
  update_failed: 'Unable to update the report.',
  unban_failed: 'Unable to unban the user.',
  unban_partial:
    'The user was re-banned because the unban could not be recorded. No audit entry was created. Retry the unban.',
};

function moderationHref(params: { status: ReportStatusFilter; before?: string | null }): string {
  const query = new URLSearchParams();
  if (params.status !== DEFAULT_REPORT_STATUS_FILTER) query.set('status', params.status);
  if (params.before) query.set('before', params.before);
  const qs = query.toString();
  return qs ? `/admin/moderation?${qs}` : '/admin/moderation';
}

function oneSearchParam(value: string | string[] | undefined): string | null {
  return typeof value === 'string' ? value : null;
}

function moderationMessage(params: ModerationSearchParams): string | null {
  const codes = [oneSearchParam(params.result), oneSearchParam(params.error)];
  for (const code of codes) {
    if (code && Object.prototype.hasOwnProperty.call(MODERATION_MESSAGES, code)) {
      return MODERATION_MESSAGES[code];
    }
  }
  return null;
}

function formatDate(value: string | null): string {
  return value ?? 'Not recorded';
}

function deliveryState(emailed: boolean | null): string {
  if (emailed === true) return 'Delivered';
  if (emailed === false) return 'Not delivered';
  return 'Delivery unknown';
}

async function denyUnauthorizedAccess(): Promise<null> {
  redirect('/admin/signin?error=unauthorized');
  return null;
}

export default async function ModerationPage({
  searchParams = Promise.resolve({}),
}: {
  searchParams?: Promise<ModerationSearchParams>;
} = {}) {
  const userId = await requireAdmin();
  if (!userId) return denyUnauthorizedAccess();

  const accessToken = await getAdminAccessToken();
  if (!accessToken) {
    redirect('/admin/signin?error=unauthorized');
    return null;
  }

  const params = await searchParams;
  const requestedBefore = oneSearchParam(params.before);
  const before = isModerationCursor(requestedBefore) ? requestedBefore : null;
  const requestedStatus = oneSearchParam(params.status);
  const status: ReportStatusFilter =
    requestedStatus !== null && isReportStatusFilter(requestedStatus)
      ? requestedStatus
      : DEFAULT_REPORT_STATUS_FILTER;

  const queryOptions: ModerationQueryOptions = {};
  if (before) queryOptions.before = before;
  if (status !== DEFAULT_REPORT_STATUS_FILTER) queryOptions.status = status;
  const hasQueryOptions = Object.keys(queryOptions).length > 0;

  const data = await (hasQueryOptions
    ? fetchModerationData(accessToken, queryOptions)
    : fetchModerationData(accessToken)
  ).catch((error: unknown) => {
    logModerationServerError('fetchModerationData', error);
    return UNAVAILABLE_DATA;
  });
  const message = moderationMessage(params);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-5">
        <div>
          <Link href="/admin" className="text-sm opacity-60 hover:opacity-100">
            Back to admin
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-[#E6C39B]">Moderation</h1>
          <p className="mt-1 text-sm opacity-60">Review reports, bans, and operator history.</p>
        </div>
      </header>

      {message && (
        <p role="status" className="rounded-lg border border-[#E6C39B]/30 bg-[#E6C39B]/10 p-3 text-sm text-[#E6C39B]">
          {message}
        </p>
      )}

      <ReportsSection reports={data.reports} before={before} status={status} />
      <BansSection bans={data.bans} />
      <AuditSection audit={data.audit} />
    </main>
  );
}

function SectionShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-[#E6C39B]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function UnavailableState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-white/15 p-4 text-sm opacity-60">
      {children}
    </p>
  );
}

function ReportsSection({
  reports,
  before,
  status,
}: {
  reports: ModerationData['reports'];
  before: string | null;
  status: ReportStatusFilter;
}) {
  return (
    <SectionShell title="Reports">
      <ReportStatusFilterNav status={status} />
      {!reports.available ? (
        <UnavailableState>Reports are unavailable right now.</UnavailableState>
      ) : reports.rows.length === 0 ? (
        <p className="text-sm opacity-60">No reports need review.</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {reports.rows.map((report) => <ReportCard key={`${report.source}-${report.id}`} report={report} />)}
        </div>
      )}
      <ReportPagination reports={reports.available ? reports.rows : []} before={before} status={status} />
    </SectionShell>
  );
}

function ReportStatusFilterNav({ status }: { status: ReportStatusFilter }) {
  const otherFilters = REPORT_STATUS_FILTERS.filter((candidate) => candidate !== status);
  return (
    <nav aria-label="Report status filter" className="mb-4 flex flex-wrap items-center gap-3 text-sm">
      <span className="text-xs opacity-60">Showing: {STATUS_FILTER_LABELS[status]}</span>
      {otherFilters.map((candidate) => (
        <Link
          key={candidate}
          href={moderationHref({ status: candidate })}
          className="text-[#E6C39B] underline-offset-4 hover:underline"
        >
          {STATUS_FILTER_LABELS[candidate]}
        </Link>
      ))}
    </nav>
  );
}

function ReportPagination({
  reports,
  before,
  status,
}: {
  reports: ModerationReport[];
  before: string | null;
  status: ReportStatusFilter;
}) {
  const oldest = reports[reports.length - 1]?.created_at;
  const hasOlder = reports.length === REPORT_PAGE_SIZE && isModerationCursor(oldest);
  if (!before && !hasOlder) return null;

  return (
    <nav aria-label="Report pages" className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-4 text-sm">
      {before && (
        <Link href={moderationHref({ status })} className="text-[#E6C39B] underline-offset-4 hover:underline">
          Newest reports
        </Link>
      )}
      {hasOlder && (
        <Link
          href={moderationHref({ status, before: oldest })}
          className="text-[#E6C39B] underline-offset-4 hover:underline"
        >
          Older reports
        </Link>
      )}
    </nav>
  );
}

function ReportCard({ report }: { report: ModerationReport }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs opacity-60">{report.source}</p>
          {report.report_number != null && <p className="mt-1 text-sm font-semibold">Report #{report.report_number}</p>}
        </div>
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold capitalize">
          {report.status}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Target type" value={report.target_type} />
        <Detail label="Target ID" value={report.target_id} mono />
        <Detail label="Category" value={report.category ?? 'Not provided'} />
        <Detail label="Reason" value={report.reason ?? 'Not provided'} />
        <Detail label="Note" value={report.note ?? 'Not provided'} />
        <Detail label="Delivery" value={deliveryState(report.emailed)} />
        <Detail label="Created" value={formatDate(report.created_at)} />
        <Detail label="Handled" value={formatDate(report.handled_at)} />
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        {REPORT_STATUSES.map((status) => (
          <form key={status} action={setReportStatusAction}>
            <input type="hidden" name="source" value={report.source} />
            <input type="hidden" name="reportId" value={report.id} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              className="min-h-[36px] rounded-md border border-[#E6C39B]/30 px-3 text-xs font-semibold text-[#E6C39B] hover:bg-[#E6C39B]/10"
            >
              Set {status}
            </button>
          </form>
        ))}
      </div>
    </article>
  );
}

function BansSection({ bans }: { bans: ModerationData['bans'] }) {
  return (
    <SectionShell title="Active bans">
      {!bans.available ? (
        <UnavailableState>Active bans are unavailable right now.</UnavailableState>
      ) : bans.rows.length === 0 ? (
        <p className="text-sm opacity-60">No active bans found.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {bans.rows.map((ban) => <BanCard key={ban.user_id} ban={ban} />)}
        </div>
      )}
    </SectionShell>
  );
}

function BanCard({ ban }: { ban: ModerationBan }) {
  const identityLabel = `${ban.identity_count} linked ${ban.identity_count === 1 ? 'identity' : 'identities'}`;
  return (
    <article className="rounded-xl border border-red-400/20 bg-red-500/5 p-4">
      <p className="font-semibold">{ban.username ?? 'Username unavailable'}</p>
      <p className="mt-1 break-all font-mono text-xs opacity-60">{ban.user_id}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Shadow banned" value={formatDate(ban.shadow_banned_at)} />
        <Detail label="Hard banned" value={formatDate(ban.hard_banned_at)} />
        <Detail label="Reason" value={ban.reason ?? 'Not provided'} />
        <Detail label="Identity count" value={identityLabel} />
        <Detail label="Last updated" value={formatDate(ban.updated_at)} />
      </dl>
      <form action={unbanUserAction} className="mt-4 border-t border-white/10 pt-4">
        <input type="hidden" name="userId" value={ban.user_id} />
        <button
          type="submit"
          className="min-h-[36px] rounded-md border border-red-300/40 px-3 text-xs font-semibold text-red-100 hover:bg-red-500/10"
        >
          Unban user
        </button>
      </form>
    </article>
  );
}

function AuditSection({ audit }: { audit: ModerationData['audit'] }) {
  return (
    <SectionShell title="Audit history">
      {!audit.available ? (
        <UnavailableState>Audit history is unavailable right now.</UnavailableState>
      ) : audit.rows.length === 0 ? (
        <p className="text-sm opacity-60">No audit history found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-black/20 text-xs text-[#E6C39B]">
              <tr>
                <th className="p-3 font-semibold">Actor</th>
                <th className="p-3 font-semibold">Action</th>
                <th className="p-3 font-semibold">Target</th>
                <th className="p-3 font-semibold">Reason</th>
                <th className="p-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {audit.rows.map((entry) => <AuditRow key={entry.id} entry={entry} />)}
            </tbody>
          </table>
        </div>
      )}
      {audit.available && (
        <p className="mt-3 text-xs opacity-60">Showing the latest {AUDIT_HISTORY_LIMIT} entries.</p>
      )}
    </SectionShell>
  );
}

function AuditRow({ entry }: { entry: ModerationAuditEntry }) {
  return (
    <tr className="border-b border-white/10 last:border-0 align-top">
      <td className="p-3 font-mono text-xs">{entry.actor_id ?? 'System'}</td>
      <td className="p-3">{entry.action}</td>
      <td className="p-3">
        <div>{entry.target_type}</div>
        <div className="mt-1 font-mono text-xs opacity-60">{entry.target_id}</div>
      </td>
      <td className="p-3">{entry.reason ?? 'Not provided'}</td>
      <td className="p-3 whitespace-nowrap">{formatDate(entry.created_at)}</td>
    </tr>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs opacity-60">{label}</dt>
      <dd className={mono ? 'mt-1 break-all font-mono text-xs' : 'mt-1'}>{value}</dd>
    </div>
  );
}
