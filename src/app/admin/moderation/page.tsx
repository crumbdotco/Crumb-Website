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
  fetchModerationData,
  type ModerationAuditEntry,
  type ModerationBan,
  type ModerationData,
  type ModerationReport,
  type ReportStatus,
} from '@/lib/admin/moderation';
import { setReportStatusAction, unbanUserAction } from './actions';

export const dynamic = 'force-dynamic';

const UNAVAILABLE_DATA: ModerationData = {
  reports: { available: false },
  bans: { available: false },
  audit: { available: false },
};

const REPORT_STATUSES: ReportStatus[] = ['queued', 'actioned', 'dismissed'];

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

export default async function ModerationPage() {
  const userId = await requireAdmin();
  if (!userId) return denyUnauthorizedAccess();

  const accessToken = await getAdminAccessToken();
  if (!accessToken) {
    redirect('/admin/signin?error=unauthorized');
    return null;
  }

  const data = await fetchModerationData(accessToken).catch(() => UNAVAILABLE_DATA);

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

      <ReportsSection reports={data.reports} />
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

function ReportsSection({ reports }: { reports: ModerationData['reports'] }) {
  return (
    <SectionShell title="Reports">
      {!reports.available ? (
        <UnavailableState>Reports are unavailable right now.</UnavailableState>
      ) : reports.rows.length === 0 ? (
        <p className="text-sm opacity-60">No reports need review.</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {reports.rows.map((report) => <ReportCard key={`${report.source}-${report.id}`} report={report} />)}
        </div>
      )}
    </SectionShell>
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
