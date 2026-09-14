# HANDOFF — v1.0.0 B6c website admin moderation review correction

## Last session: 2026-09-14 (codex/admin-moderation)

## Done

- [x] Added the protected `/admin/moderation` reports, active bans, unban, and audit page.
- [x] Added service-role RPC wiring with verified bearer audit identity and platform-admin preflight before GoTrue unban.
- [x] Added exact Origin/Referer checks to `POST /api/admin/session`, with localhost limited to non-production.
- [x] Removed the unauthorized-access alert path and its Resend environment requirements.
- [x] Consolidated moderation UUID, report-source, and report-status type guards.
- [x] Added focused tests for preflight ordering, denial, production origins, and fail-closed redirects.
- [x] Recorded the review-to-zero report at `.superpowers/sdd/2026-09-13-admin-moderation/task-5-report.md`.

## Not done / Blocked

- [ ] Live browser exit check remains incomplete. The owner must sign in and verify a throwaway report and unban flow.
- [ ] Full repository coverage remains below its existing threshold because of unrelated untested modules.
- [ ] `npx tsc --noEmit` retains seven pre-existing tuple-index errors in `src/__tests__/api/stripe-webhook-refund.test.ts`.
- [ ] Repository-wide lint scans generated `.next`, coverage, and `.claude/worktrees` artifacts and reports pre-existing errors. Touched-file lint is clean.
- [ ] React Doctor did not emit a score because its scan was interrupted after it reported that `--diff` is deprecated.

## Context for next session

- Work is committed on `codex/admin-moderation`; no push or deployment was performed.
- No auto-ban is performed for URL navigation. Unauthorized access remains fail-closed with the existing redirect.
- No Resend or unauthorized-access alert environment variables are required.
