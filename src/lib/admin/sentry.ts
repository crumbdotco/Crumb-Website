/**
 * Sentry REST API client — pulls error stats for the admin dashboard.
 *
 * Auth: bearer token (`SENTRY_AUTH_TOKEN`) with `event:read` scope.
 */

const SENTRY_BASE = 'https://sentry.io/api/0';

export interface SentryMetrics {
  crashFreeUsers24h: number | null;
  totalEvents24h: number | null;
  topIssues: Array<{ id: string; title: string; count: number }>;
}

export async function fetchSentryMetrics(): Promise<SentryMetrics> {
  const token = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;

  if (!token || !org || !project) {
    return {
      crashFreeUsers24h: null,
      totalEvents24h: null,
      topIssues: [],
    };
  }

  const headers = { Authorization: `Bearer ${token}` };

  const fetchJson = async <T>(path: string): Promise<T | null> => {
    try {
      const res = await fetch(`${SENTRY_BASE}${path}`, {
        headers,
        next: { revalidate: 300 },
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  const sessions = await fetchJson<{
    groups?: Array<{ totals?: Record<string, number> }>;
  }>(
    `/organizations/${org}/sessions/?project=${project}&statsPeriod=24h&field=crash_free_rate(user)`,
  );
  const crashFreeUsers24h =
    sessions?.groups?.[0]?.totals?.['crash_free_rate(user)'] ?? null;

  const issues = await fetchJson<
    Array<{ id: string; title: string; count: string }>
  >(`/projects/${org}/${project}/issues/?statsPeriod=24h&limit=10&sort=freq`);

  const topIssues =
    issues?.map((i) => ({
      id: i.id,
      title: i.title,
      count: Number(i.count) || 0,
    })) ?? [];

  return {
    crashFreeUsers24h,
    totalEvents24h: topIssues.reduce((a, b) => a + b.count, 0),
    topIssues,
  };
}
