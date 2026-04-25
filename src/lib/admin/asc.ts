/**
 * App Store Connect API client — pulls download counts, ratings, and
 * crash rates for the admin dashboard.
 *
 * Auth: ES256 JWT signed with your .p8 key. Tokens expire after 20
 * minutes; we generate a new one per request (cheap — JWT signing is
 * sub-millisecond).
 *
 * Required env vars (set in Vercel project):
 *   ASC_KEY_ID
 *   ASC_ISSUER_ID
 *   ASC_PRIVATE_KEY    (full .p8 contents, including BEGIN/END lines)
 *
 * Operator: see OPERATOR_TODO.md section 3b for setup.
 */

import { createPrivateKey, sign } from 'node:crypto';

const ASC_BASE = 'https://api.appstoreconnect.apple.com/v1';
const APP_ID = '6761197468'; // Crumbify ASC App ID

function generateAscToken(): string {
  const keyId = process.env.ASC_KEY_ID;
  const issuerId = process.env.ASC_ISSUER_ID;
  const privateKey = process.env.ASC_PRIVATE_KEY;
  if (!keyId || !issuerId || !privateKey) {
    throw new Error('ASC API credentials not configured');
  }

  const header = {
    alg: 'ES256',
    kid: keyId,
    typ: 'JWT',
  };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 1200, // 20min, max allowed
    aud: 'appstoreconnect-v1',
  };

  const b64 = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64url')
      .replace(/=+$/, '');
  const unsigned = `${b64(header)}.${b64(payload)}`;

  // ES256 = ECDSA P-256 + SHA-256, JWT requires raw R||S signature
  // (64 bytes), not Node's default DER. dsaEncoding: 'ieee-p1363' is the
  // correct format for JWT.
  const key = createPrivateKey(privateKey);
  const signature = sign('sha256', Buffer.from(unsigned), {
    key,
    dsaEncoding: 'ieee-p1363',
  }).toString('base64url');

  return `${unsigned}.${signature}`;
}

async function ascFetch<T>(path: string): Promise<T | null> {
  try {
    const token = generateAscToken();
    const res = await fetch(`${ASC_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 600 }, // ASC rate limits — cache 10min
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface AscMetrics {
  appName: string | null;
  bundleId: string | null;
  ratingsAverage: number | null;
  ratingsCount: number | null;
  recentReviewCount: number | null;
}

/**
 * Pull a snapshot of ASC metrics. Note: download counts + crash data
 * live in the Sales and Reports endpoints which return CSV/TSV reports
 * with 24h+ delay. For the dashboard we use the public-facing rating
 * + review fields which are near-real-time.
 */
export async function fetchAscMetrics(): Promise<AscMetrics> {
  const app = await ascFetch<{
    data?: { attributes?: { name?: string; bundleId?: string } };
  }>(`/apps/${APP_ID}`);

  const reviews = await ascFetch<{
    data?: Array<{ attributes?: { rating?: number } }>;
    meta?: { paging?: { total?: number } };
  }>(`/apps/${APP_ID}/customerReviews?limit=200&sort=-createdDate`);

  const ratings = reviews?.data?.map((r) => r.attributes?.rating ?? 0) ?? [];
  const ratingsAverage =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;

  return {
    appName: app?.data?.attributes?.name ?? null,
    bundleId: app?.data?.attributes?.bundleId ?? null,
    ratingsAverage,
    ratingsCount: reviews?.meta?.paging?.total ?? null,
    recentReviewCount: reviews?.data?.length ?? null,
  };
}
