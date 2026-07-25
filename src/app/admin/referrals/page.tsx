import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { fetchReferralStats } from '@/lib/admin/referrals';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const userId = await requireAdmin();
  if (!userId) redirect('/admin/signin?error=unauthorized');

  const stats = await fetchReferralStats().catch(() => ({
    codes: [],
    totalUniqueClicks: 0,
    totalCodes: 0,
    totalLast7d: 0,
  }));

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-1">
        <Link href="/admin" className="text-sm opacity-60 hover:opacity-100">
          Back to admin
        </Link>
        <h1 className="text-3xl font-bold text-[#E6C39B]">Referral clicks</h1>
        <p className="text-sm opacity-60">
          Share links use the format https://crumbify.co.uk/referral?code=CODE
        </p>
        <p className="text-xs opacity-50">
          Each visitor is counted once per code, IP addresses are stored as a salted
          hash and never in plain text.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryStat label="Total unique clicks" value={stats.totalUniqueClicks} />
        <SummaryStat label="Codes with clicks" value={stats.totalCodes} />
        <SummaryStat label="Clicks last 7 days" value={stats.totalLast7d} />
      </section>

      {stats.codes.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm opacity-70">
          No referral clicks recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-3 font-semibold text-[#E6C39B]">Code</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Share URL</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Unique clicks</th>
                <th className="p-3 font-semibold text-[#E6C39B]">iOS</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Android</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Other</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Last 7 days</th>
                <th className="p-3 font-semibold text-[#E6C39B]">First click</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Last click</th>
              </tr>
            </thead>
            <tbody>
              {stats.codes.map((row) => (
                <tr key={row.code} className="border-b border-white/10 last:border-0">
                  <td className="p-3 font-mono">{row.code}</td>
                  <td className="p-3 font-mono text-xs opacity-80">
                    https://crumbify.co.uk/referral?code={row.code}
                  </td>
                  <td className="p-3">{row.total}</td>
                  <td className="p-3">{row.ios}</td>
                  <td className="p-3">{row.android}</td>
                  <td className="p-3">{row.other}</td>
                  <td className="p-3">{row.last7d}</td>
                  <td className="p-3 text-xs opacity-70">
                    {new Date(row.firstClickAt).toLocaleString('en-GB')}
                  </td>
                  <td className="p-3 text-xs opacity-70">
                    {new Date(row.lastClickAt).toLocaleString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-wider opacity-60">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value.toLocaleString('en-GB')}</div>
    </div>
  );
}
