/**
 * RevenueCat REST API client (v2) — pulls live subscription metrics
 * for the admin dashboard.
 *
 * Auth: server-side secret key (`REVENUECAT_SECRET_KEY`). NEVER expose
 * to the client bundle.
 *
 * Cache: caller passes their own revalidate. Default 5min via Next's
 * native fetch caching.
 */

const RC_BASE = 'https://api.revenuecat.com/v2';

function authHeaders(): Headers {
  const key = process.env.REVENUECAT_SECRET_KEY;
  if (!key) throw new Error('REVENUECAT_SECRET_KEY not configured');
  return new Headers({
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  });
}

export interface RcMetrics {
  activeSubscribers: number;
  trialSubscribers: number;
  mrr: number;
  arr: number;
  newSubscribers30d: number;
  churned30d: number;
}

/**
 * Pull active/trial subscriber counts and MRR from RevenueCat charts API.
 * RC v2 charts: /projects/{project}/charts/{metric}
 *
 * Operator: replace `<project-id>` with your RC project id from the
 * dashboard URL.
 */
export async function fetchRcMetrics(projectId: string): Promise<RcMetrics> {
  const headers = authHeaders();

  const metric = async (slug: string): Promise<number> => {
    try {
      const res = await fetch(
        `${RC_BASE}/projects/${projectId}/metrics/overview?metric=${slug}`,
        { headers, next: { revalidate: 300 } },
      );
      if (!res.ok) return 0;
      const json = (await res.json()) as { value?: number };
      return json.value ?? 0;
    } catch {
      return 0;
    }
  };

  const [
    activeSubscribers,
    trialSubscribers,
    mrr,
    newSubscribers30d,
    churned30d,
  ] = await Promise.all([
    metric('active_subscriptions'),
    metric('active_trials'),
    metric('mrr'),
    metric('new_customers_30d'),
    metric('churn_30d'),
  ]);

  return {
    activeSubscribers,
    trialSubscribers,
    mrr,
    arr: mrr * 12,
    newSubscribers30d,
    churned30d,
  };
}
