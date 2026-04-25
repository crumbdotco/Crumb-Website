import { redirect } from 'next/navigation';
import { fetchSupabaseAdminMetrics } from '@/lib/admin/supabase-admin';
import { fetchRcMetrics } from '@/lib/admin/revenuecat';
import { fetchAscMetrics } from '@/lib/admin/asc';
import { fetchSentryMetrics } from '@/lib/admin/sentry';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

const RC_PROJECT_ID = process.env.REVENUECAT_PROJECT_ID ?? '';

export default async function AdminPage() {
  const userId = await requireAdmin();
  if (!userId) redirect('/admin/signin');

  // Fetch in parallel — each source caches independently via fetch()
  // revalidate, so a failure in one doesn't block the others.
  const [supabase, rc, asc, sentry] = await Promise.all([
    fetchSupabaseAdminMetrics().catch(() => null),
    RC_PROJECT_ID
      ? fetchRcMetrics(RC_PROJECT_ID).catch(() => null)
      : Promise.resolve(null),
    fetchAscMetrics().catch(() => null),
    fetchSentryMetrics().catch(() => null),
  ]);

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-bold text-[#E6C39B]">Crumb Admin</h1>
        <p className="text-sm opacity-60">
          Auto-refresh every 5 min · {new Date().toLocaleString('en-GB')}
        </p>
      </header>

      <Section title="Funnel">
        <Stat label="Waitlist" value={supabase?.waitlistCount} delta={supabase?.newWaitlistLast7d} />
        <Stat label="Signed up" value={supabase?.profilesCount} delta={supabase?.newProfilesLast7d} />
        <Stat label="Onboarded" value={supabase?.onboardedCount} />
        <Stat label="Premium" value={supabase?.premiumCount} />
        <Stat label="Reviews" value={supabase?.reviewsCount} delta={supabase?.reviewsLast7d} />
      </Section>

      <Section title="Revenue (RevenueCat)">
        <Stat label="Active subs" value={rc?.activeSubscribers} />
        <Stat label="Trial subs" value={rc?.trialSubscribers} />
        <Stat label="MRR" value={rc?.mrr} prefix="£" />
        <Stat label="ARR" value={rc?.arr} prefix="£" />
        <Stat label="New 30d" value={rc?.newSubscribers30d} />
        <Stat label="Churn 30d" value={rc?.churned30d} />
      </Section>

      <Section title="App Store">
        <Stat label="Rating" value={asc?.ratingsAverage} fixed={2} />
        <Stat label="Total reviews" value={asc?.ratingsCount} />
        <Stat label="Recent reviews (200 max)" value={asc?.recentReviewCount} />
      </Section>

      <Section title="Errors (Sentry, 24h)">
        <Stat label="Crash-free user %" value={sentry?.crashFreeUsers24h ? sentry.crashFreeUsers24h * 100 : null} suffix="%" fixed={2} />
        <Stat label="Total events" value={sentry?.totalEvents24h} />
      </Section>

      {sentry?.topIssues && sentry.topIssues.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E6C39B]">Top issues</h2>
          <ul className="divide-y divide-white/10 rounded-lg border border-white/10">
            {sentry.topIssues.map((i) => (
              <li key={i.id} className="flex items-center justify-between p-3">
                <span className="truncate pr-4">{i.title}</span>
                <span className="font-mono text-sm opacity-80">{i.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-[#E6C39B]">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {children}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  delta,
  prefix,
  suffix,
  fixed,
}: {
  label: string;
  value: number | null | undefined;
  delta?: number | null;
  prefix?: string;
  suffix?: string;
  fixed?: number;
}) {
  const display =
    value == null
      ? '—'
      : `${prefix ?? ''}${
          fixed != null ? value.toFixed(fixed) : value.toLocaleString('en-GB')
        }${suffix ?? ''}`;
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-wider opacity-60">{label}</div>
      <div className="mt-1 text-2xl font-bold">{display}</div>
      {delta != null && (
        <div className="mt-1 text-xs text-[#E6C39B]">+{delta} (7d)</div>
      )}
    </div>
  );
}
