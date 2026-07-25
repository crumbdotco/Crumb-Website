/**
 * Shared referral code validation, used by both the public redirect route
 * (src/app/referral/route.ts) and the admin code-registry functions
 * (src/lib/admin/referrals.ts). Keep this the single source of truth for the
 * pattern so the two never drift.
 */
export const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9_-]{2,64}$/;

export function isValidReferralCode(code: string): boolean {
  return REFERRAL_CODE_PATTERN.test(code);
}

/** Normalise a code to a single consistent case for storage/lookup. */
export function normaliseReferralCode(code: string): string {
  return code.trim().toUpperCase();
}
