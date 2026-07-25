import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import {
  fetchReferralStats,
  type ReferralCodeStats,
  type UnregisteredCodeStats,
} from '@/lib/admin/referrals';
import { CopyLinkButton } from '@/components/admin/CopyLinkButton';
import { createReferralCodeAction, setReferralCodeActiveAction } from './actions';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://crumbify.co.uk';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: 'That code is not valid. Use 2 to 64 letters, numbers, hyphens or underscores, and a creator name.',
  duplicate: 'That code already exists.',
  unknown: 'Something went wrong, please try again.',
  not_found: 'That code could not be found.',
};

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const userId = await requireAdmin();
  if (!userId) redirect('/admin/signin?error=unauthorized');

  const params = await searchParams;
  const errorParam = typeof params.error === 'string' ? params.error : null;
  const createdParam = typeof params.created === 'string' ? params.created : null;
  const updatedParam = typeof params.updated === 'string' ? params.updated : null;

  const stats = await fetchReferralStats().catch(() => ({
    codes: [],
    unregistered: [],
    totalUniqueClicks: 0,
    activeCodes: 0,
    totalCodes: 0,
    totalLast7d: 0,
  }));

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
      <header className="space-y-1">
        <Link href="/admin" className="text-sm opacity-60 hover:opacity-100">
          Back to admin
        </Link>
        <h1 className="text-3xl font-bold text-[#E6C39B]">Referral codes</h1>
        <p className="text-sm opacity-60">
          Share links use the format {SITE_URL}/referral?code=CODE
        </p>
        <p className="text-xs opacity-50">
          Each visitor is counted once per code. IP addresses are stored as a salted
          hash and never in plain text.
        </p>
      </header>

      {errorParam && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {ERROR_MESSAGES[errorParam] ?? ERROR_MESSAGES.unknown}
        </div>
      )}
      {createdParam && (
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          Created referral code {createdParam}.
        </div>
      )}
      {updatedParam && (
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          Updated referral code {updatedParam}.
        </div>
      )}

      <AddCodeForm />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryStat label="Total unique clicks" value={stats.totalUniqueClicks} />
        <SummaryStat label="Active codes" value={stats.activeCodes} />
        <SummaryStat label="Clicks last 7 days" value={stats.totalLast7d} />
      </section>

      {stats.codes.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#E6C39B]">Codes</h2>
          <div className="space-y-3 md:hidden">
            {stats.codes.map((row) => (
              <CodeCard key={row.code} row={row} />
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-lg border border-white/10 md:block">
            <CodeTable rows={stats.codes} />
          </div>
        </section>
      )}

      {stats.unregistered.length > 0 && (
        <UnregisteredSection rows={stats.unregistered} />
      )}
    </main>
  );
}

function AddCodeForm() {
  return (
    <section className="rounded-xl border border-[#E6C39B]/25 bg-black/25 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-[#E6C39B]">Add referral code</h2>
      <p className="mt-1 text-xs opacity-60">
        Register a code before sharing it, so it shows up here even before the first
        click.
      </p>
      <form action={createReferralCodeAction} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="opacity-70">Creator name</span>
          <input
            name="creatorName"
            required
            placeholder="e.g. Jess Bakes"
            className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#E6C39B]/60"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="opacity-70">Code</span>
          <input
            name="code"
            required
            placeholder="e.g. JESS10"
            pattern="[A-Za-z0-9_-]{2,64}"
            className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm font-mono outline-none focus:border-[#E6C39B]/60"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="opacity-70">Note (optional)</span>
          <input
            name="note"
            placeholder="Campaign, platform, anything worth remembering"
            className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#E6C39B]/60"
          />
        </label>
        <button
          type="submit"
          className="mt-1 w-full rounded-md bg-[#E6C39B] px-4 py-2 text-sm font-semibold text-[#1A1208] transition hover:bg-[#d8b489] sm:col-span-2 sm:w-auto"
        >
          Add code
        </button>
      </form>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-6 text-sm">
      <p className="font-semibold text-[#E6C39B]">No referral codes yet</p>
      <p className="mt-2 opacity-70">
        Give each creator a link in the format {SITE_URL}/referral?code=THEIRCODE. Every
        unique visitor who follows it is counted once and redirected to the app store.
        Add your first code above to start tracking clicks.
      </p>
    </div>
  );
}

function shareUrl(code: string): string {
  return `${SITE_URL}/referral?code=${code}`;
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString('en-GB') : 'No clicks yet';
}

function PlatformBar({ row }: { row: { ios: number; android: number; other: number } }) {
  const total = row.ios + row.android + row.other;
  if (total === 0) {
    return <div className="h-1.5 w-full rounded-full bg-white/10" />;
  }
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className="bg-[#5AC8FA]" style={{ width: `${(row.ios / total) * 100}%` }} />
      <div className="bg-[#7ED957]" style={{ width: `${(row.android / total) * 100}%` }} />
      <div className="bg-white/30" style={{ width: `${(row.other / total) * 100}%` }} />
    </div>
  );
}

function ActiveToggleForm({ code, isActive }: { code: string; isActive: boolean }) {
  return (
    <form action={setReferralCodeActiveAction}>
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="isActive" value={(!isActive).toString()} />
      <button
        type="submit"
        className={
          isActive
            ? 'rounded-md border border-white/15 px-2.5 py-1 text-xs font-semibold opacity-80 hover:opacity-100'
            : 'rounded-md border border-emerald-400/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10'
        }
      >
        {isActive ? 'Deactivate' : 'Reactivate'}
      </button>
    </form>
  );
}

function CodeCard({ row }: { row: ReferralCodeStats }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-base font-semibold">{row.code}</div>
          <div className="text-xs opacity-70">{row.creatorName}</div>
        </div>
        <span
          className={
            row.isActive
              ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300'
              : 'rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold opacity-60'
          }
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {row.note && <p className="mt-2 text-xs opacity-60">{row.note}</p>}

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="Clicks" value={row.total} />
        <Metric label="Last 7d" value={row.last7d} />
        <Metric label="iOS/Android/other" value={`${row.ios}/${row.android}/${row.other}`} />
      </div>
      <div className="mt-3">
        <PlatformBar row={row} />
      </div>

      <dl className="mt-3 space-y-1 text-xs opacity-70">
        <div className="flex justify-between">
          <dt>First click</dt>
          <dd>{formatDate(row.firstClickAt)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Last click</dt>
          <dd>{formatDate(row.lastClickAt)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
        <span className="truncate font-mono text-xs opacity-70">{shareUrl(row.code)}</span>
        <div className="flex shrink-0 items-center gap-2">
          <CopyLinkButton url={shareUrl(row.code)} />
          <ActiveToggleForm code={row.code} isActive={row.isActive} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-white/5 px-2 py-1.5">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[10px] opacity-60">{label}</div>
    </div>
  );
}

function CodeTable({ rows }: { rows: ReferralCodeStats[] }) {
  return (
    <table className="w-full min-w-[880px] border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-white/10 bg-black/20">
          <th className="p-3 font-semibold text-[#E6C39B]">Code</th>
          <th className="p-3 font-semibold text-[#E6C39B]">Creator</th>
          <th className="p-3 font-semibold text-[#E6C39B]">Status</th>
          <th className="p-3 font-semibold text-[#E6C39B]">Clicks</th>
          <th className="p-3 font-semibold text-[#E6C39B]">Platform split</th>
          <th className="p-3 font-semibold text-[#E6C39B]">Last 7d</th>
          <th className="p-3 font-semibold text-[#E6C39B]">First / last click</th>
          <th className="p-3 font-semibold text-[#E6C39B]">Share link</th>
          <th className="p-3 font-semibold text-[#E6C39B]">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.code} className="border-b border-white/10 last:border-0 align-top">
            <td className="p-3 font-mono">{row.code}</td>
            <td className="p-3">
              {row.creatorName}
              {row.note && <div className="text-xs opacity-50">{row.note}</div>}
            </td>
            <td className="p-3">
              <span
                className={
                  row.isActive
                    ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300'
                    : 'rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold opacity-60'
                }
              >
                {row.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="p-3">{row.total}</td>
            <td className="p-3">
              <div className="w-28">
                <PlatformBar row={row} />
                <div className="mt-1 text-xs opacity-60">
                  {row.ios} / {row.android} / {row.other}
                </div>
              </div>
            </td>
            <td className="p-3">{row.last7d}</td>
            <td className="p-3 text-xs opacity-70">
              <div>{formatDate(row.firstClickAt)}</div>
              <div>{formatDate(row.lastClickAt)}</div>
            </td>
            <td className="p-3">
              <div className="flex items-center gap-2">
                <span className="truncate font-mono text-xs opacity-70">
                  {shareUrl(row.code)}
                </span>
                <CopyLinkButton url={shareUrl(row.code)} />
              </div>
            </td>
            <td className="p-3">
              <ActiveToggleForm code={row.code} isActive={row.isActive} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UnregisteredSection({ rows }: { rows: UnregisteredCodeStats[] }) {
  return (
    <details className="rounded-lg border border-amber-400/25 bg-amber-500/5 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-amber-200">
        Unregistered codes with clicks ({rows.length})
      </summary>
      <p className="mt-2 text-xs opacity-70">
        These codes received clicks but were never added above, register one to start
        tracking creator and note details for it.
      </p>
      <div className="mt-3 space-y-3">
        {rows.map((row) => (
          <div key={row.code} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono text-sm font-semibold">{row.code}</div>
                <div className="text-xs opacity-60">
                  {row.total} clicks, last 7d {row.last7d}
                </div>
              </div>
            </div>
            <form
              action={createReferralCodeAction}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="code" value={row.code} />
              <input
                name="creatorName"
                required
                placeholder="Creator name"
                className="min-w-0 flex-1 rounded-md border border-white/15 bg-black/30 px-2.5 py-1.5 text-xs outline-none focus:border-[#E6C39B]/60"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-[#E6C39B] px-3 py-1.5 text-xs font-semibold text-[#1A1208] hover:bg-[#d8b489]"
              >
                Register this code
              </button>
            </form>
          </div>
        ))}
      </div>
    </details>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="text-xs opacity-60">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value.toLocaleString('en-GB')}</div>
    </div>
  );
}
