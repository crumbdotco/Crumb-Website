import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { fetchReferralStats } from '@/lib/admin/referrals';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const userId = await requireAdmin();
  if (!userId) redirect('/admin/signin?error=unauthorized');

  const stats = await fetchReferralStats().catch(() => []);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-[#E6C39B]">Referral clicks</h1>
        <p className="text-sm opacity-60">
          Share links use the format https://crumbify.co.uk/referral?code=CODE
        </p>
      </header>

      {stats.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm opacity-70">
          No referral clicks recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-3 font-semibold text-[#E6C39B]">Code</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Total</th>
                <th className="p-3 font-semibold text-[#E6C39B]">iOS</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Android</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Other</th>
                <th className="p-3 font-semibold text-[#E6C39B]">Last 7 days</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.code} className="border-b border-white/10 last:border-0">
                  <td className="p-3 font-mono">{row.code}</td>
                  <td className="p-3">{row.total}</td>
                  <td className="p-3">{row.ios}</td>
                  <td className="p-3">{row.android}</td>
                  <td className="p-3">{row.other}</td>
                  <td className="p-3">{row.last7d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
