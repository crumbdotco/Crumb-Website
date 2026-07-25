import Link from 'next/link';
import { redirect } from 'next/navigation';
import { fetchSupabaseAdminMetrics } from '@/lib/admin/supabase-admin';
import { fetchRcMetrics } from '@/lib/admin/revenuecat';
import { fetchAscMetrics } from '@/lib/admin/asc';
import { fetchSentryMetrics } from '@/lib/admin/sentry';
import { fetchReferralStats } from '@/lib/admin/referrals';
import { requireAdmin } from '@/lib/admin/auth';
import {
  DashboardSection,
  HeroStat,
  ListCard,
  ListRow,
  StatCard,
} from './dashboard-components';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

const RC_PROJECT_ID = process.env.REVENUECAT_PROJECT_ID ?? '';

export default async function AdminPage() {
  const userId = await requireAdmin();
  if (!userId) redirect('/admin/signin?error=unauthorized');

  // Fetch in parallel — each source caches independently via fetch()
  // revalidate, so a failure in one doesn't block the others.
  const [supabase, rc, asc, sentry, referrals] = await Promise.all([
    fetchSupabaseAdminMetrics().catch(() => null),
    RC_PROJECT_ID
      ? fetchRcMetrics(RC_PROJECT_ID).catch(() => null)
      : Promise.resolve(null),
    fetchAscMetrics().catch(() => null),
    fetchSentryMetrics().catch(() => null),
    fetchReferralStats().catch(() => null),
  ]);

  // Sentry/ASC return an object with null fields (not a null object) when
  // their env vars are missing or a call fails, so "connected" is judged
  // per source rather than assumed from object presence.
  const sentryConnected = sentry != null && sentry.totalEvents24h != null;
  const ascConnected = asc != null && asc.ratingsAverage != null;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6C39B] text-lg font-bold text-[#1A1208]">
            C
          </span>
          <div>
            <h1 className="text-2xl font-bold text-[#E6C39B]">Crumbify Admin</h1>
            <p className="text-xs opacity-60">
              Last updated {new Date().toLocaleString('en-GB')} · auto-refreshes every 5 min
            </p>
          </div>
        </div>
        <Link
          href="/admin/referrals"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-[#E6C39B]/40 px-4 text-sm font-semibold text-[#E6C39B] hover:bg-[#E6C39B]/10"
        >
          Referrals dashboard
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <HeroStat label="Signed up" value={supabase?.profilesCount} />
        <HeroStat label="Premium" value={supabase?.premiumCount} />
        <HeroStat
          label="MRR"
          value={rc?.mrr}
          prefix="£"
          unavailable={rc == null}
        />
        <HeroStat
          label="Crash-free (24h)"
          value={sentryConnected && sentry?.crashFreeUsers24h != null ? sentry.crashFreeUsers24h * 100 : null}
          suffix="%"
          fixed={2}
          unavailable={!sentryConnected}
        />
        <HeroStat
          label="Referral clicks"
          value={referrals?.totalUniqueClicks}
          unavailable={referrals == null}
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardSection
          title="Funnel"
          subtitle="Waitlist through to reviews"
          connected={supabase != null}
          unavailableReason="Supabase service-role metrics failed to load. Check SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL."
        >
          <StatCard label="Waitlist" value={supabase?.waitlistCount} delta={supabase?.newWaitlistLast7d} />
          <StatCard label="Signed up" value={supabase?.profilesCount} delta={supabase?.newProfilesLast7d} />
          <StatCard label="Onboarded" value={supabase?.onboardedCount} />
          <StatCard label="Premium" value={supabase?.premiumCount} />
          <StatCard label="Reviews" value={supabase?.reviewsCount} delta={supabase?.reviewsLast7d} />
        </DashboardSection>

        <DashboardSection
          title="Revenue"
          subtitle="RevenueCat"
          connected={rc != null}
          unavailableReason="RevenueCat metrics are not connected. Set REVENUECAT_PROJECT_ID and REVENUECAT_SECRET_KEY."
        >
          <StatCard label="Active subs" value={rc?.activeSubscribers} />
          <StatCard label="Trial subs" value={rc?.trialSubscribers} />
          <StatCard label="MRR" value={rc?.mrr} prefix="£" />
          <StatCard label="ARR" value={rc?.arr} prefix="£" />
          <StatCard label="New (30d)" value={rc?.newSubscribers30d} deltaPeriod="30d" />
          <StatCard label="Churn (30d)" value={rc?.churned30d} deltaPeriod="30d" />
        </DashboardSection>

        <DashboardSection
          title="App Store"
          subtitle="App Store Connect"
          connected={ascConnected}
          unavailableReason="App Store Connect metrics are not connected. Set ASC_KEY_ID, ASC_ISSUER_ID and ASC_PRIVATE_KEY."
        >
          <StatCard label="Rating" value={asc?.ratingsAverage} fixed={2} unavailable={!ascConnected} />
          <StatCard label="Total reviews" value={asc?.ratingsCount} unavailable={!ascConnected} />
          <StatCard label="Recent reviews (200 max)" value={asc?.recentReviewCount} unavailable={!ascConnected} />
        </DashboardSection>

        <DashboardSection
          title="Errors"
          subtitle="Sentry, last 24 hours"
          connected={sentryConnected}
          unavailableReason="Sentry metrics are not connected. Set SENTRY_AUTH_TOKEN, SENTRY_ORG and SENTRY_PROJECT."
        >
          <StatCard
            label="Crash-free users"
            value={sentry?.crashFreeUsers24h != null ? sentry.crashFreeUsers24h * 100 : null}
            suffix="%"
            fixed={2}
            unavailable={!sentryConnected}
          />
          <StatCard label="Total events" value={sentry?.totalEvents24h} unavailable={!sentryConnected} />
        </DashboardSection>
      </div>

      <DashboardSection
        title="Referrals"
        subtitle="UGC influencer tracking links"
        connected={referrals != null}
        unavailableReason="Referral click data failed to load from Supabase."
        action={
          <Link href="/admin/referrals" className="text-sm font-medium text-[#E6C39B] hover:underline">
            View full dashboard →
          </Link>
        }
      >
        <StatCard label="Unique clicks" value={referrals?.totalUniqueClicks} />
        <StatCard label="Active codes" value={referrals?.activeCodes} />
        <StatCard label="Last 7 days" value={referrals?.totalLast7d} deltaPeriod="7d" />
      </DashboardSection>

      {referrals && referrals.codes.length > 0 && (
        <ListCard title="Top referral codes">
          {referrals.codes.slice(0, 5).map((c) => (
            <ListRow key={c.code} left={<span className="font-mono text-sm">{c.code}</span>} right={c.total} />
          ))}
        </ListCard>
      )}

      {sentry?.topIssues && sentry.topIssues.length > 0 && (
        <ListCard title="Top issues (Sentry)">
          {sentry.topIssues.map((i) => (
            <ListRow key={i.id} left={i.title} right={i.count} />
          ))}
        </ListCard>
      )}
    </main>
  );
}
