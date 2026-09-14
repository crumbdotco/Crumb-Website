# Task 5 report: review-to-zero security correction

## RED and GREEN evidence

The required focused tests were written before production changes and run with two workers.
The initial RED run was:

```text
npm test -- --runTestsByPath src/__tests__/lib/admin/moderation.test.ts src/__tests__/app/admin-moderation-actions.test.ts src/__tests__/app/admin-moderation-page.test.tsx src/__tests__/api/admin-session.test.ts --maxWorkers=2
```

It failed for the expected missing-behaviour reasons: the unban event sequence had no
`is_platform_admin` preflight, the denial test reached GoTrue and produced the old
destructuring error, the new exported guards were absent, and production still accepted
`http://localhost:3000`. The page/action tests also exposed stale alert and auth mocks,
which were removed as part of the reduced scope.

After the smallest implementation, the focused GREEN command was run twice, including a
fresh run immediately before commit:

```text
npm test -- --runTestsByPath src/__tests__/lib/admin/moderation.test.ts src/__tests__/app/admin-moderation-actions.test.ts src/__tests__/app/admin-moderation-page.test.tsx src/__tests__/api/admin-session.test.ts --maxWorkers=2
PASS: 4 suites, 56 tests, 0 snapshots failed
```

## Changed files

- `src/lib/admin/moderation.ts`: exported UUID/source/status guards; exact-true
  bearer-aware `is_platform_admin` preflight before GoTrue; final bearer-aware
  `admin_unban`; removed Resend alert adapters and environment dependencies.
- `src/app/admin/moderation/actions.ts`: consumes shared guards and retains fail-closed
  unauthorized redirects without alerting.
- `src/app/admin/moderation/page.tsx`: retains the existing redirect gate without alerting.
- `src/app/api/admin/session/route.ts`: production-only `https://crumbify.co.uk`
  allowlist, with localhost origins available only outside production; exact Origin and
  Referer fallback behaviour retained.
- `src/__tests__/lib/admin/moderation.test.ts`: preflight ordering, exact-true denial,
  guard exports, and bearer/client ordering; removed alert tests.
- `src/__tests__/app/admin-moderation-actions.test.ts`: removed alert mocks/tests and
  covered the shared guard wiring and existing redirects.
- `src/__tests__/app/admin-moderation-page.test.tsx`: removed alert mocks/tests while
  retaining page redirect and rendering coverage.
- `src/__tests__/api/admin-session.test.ts`: development localhost and production
  localhost Origin/Referer coverage.
- `implementation-notes.md`: recurring security classes, exact guard tests, gate results,
  and browser-check limitation.
- `HANDOFF.md`: corrected branch, removed alert environment steps, and marked the browser
  exit check incomplete.
- `.superpowers/sdd/2026-09-13-admin-moderation/task-5-report.md`: this report.

All four modified production files have the required opening headers with purpose,
security/brand rules, interfaces, and `Test IDs: none` for server-only files.

## Self-review

- The bearer-aware RPC client is created and calls `is_platform_admin` before the
  bearer-free GoTrue client is created. The result must be exactly `true` and error or
  exception paths deny before GoTrue.
- GoTrue clears the ban before `admin_unban`; the latter uses the verified bearer and the
  final RPC error remains fail-closed.
- Origin checks are exact, do not accept paths/query strings as origins, reject malformed
  and lookalike values, and use Referer only when Origin is absent.
- No source page/action alert calls, Resend imports, or alert environment reads remain.
- UUID, report source, and report status validation have one exported source of truth.
- No migration, waitlist data, unrelated production behaviour, or locked moderation page
  functions were changed.

## Verification gates

- Focused Jest: passed, 4 suites / 56 tests, `--maxWorkers=2`.
- Full Jest immediately before commit: passed, 33 suites / 402 tests. Existing console
  warnings remain from React `act(...)`, webhook/referral error-path logging, and jsdom
  navigation tests.
- `npm run build`: passed. Next reported pre-existing middleware-convention and metadata
  `themeColor` warnings.
- `npx eslint` on all touched source and test files: passed with zero errors or warnings.
- `npx tsc --noEmit`: failed only on seven pre-existing tuple-index errors in
  `src/__tests__/api/stripe-webhook-refund.test.ts`; no touched-file errors remained.
- `npm run test:coverage -- --maxWorkers=2`: all 33 suites / 402 tests passed, but the
  existing global thresholds failed at 66.11% statements, 58.59% branches, 64.61%
  functions, and 67.21% lines.
- `npm run lint`: failed because the repository-wide scan includes generated `.next`,
  coverage, and `.claude/worktrees` artifacts with 132 pre-existing errors and 520
  warnings. The touched-file lint command passed.
- `npx react-doctor@latest --verbose --diff` started and reported that `--diff` is
  deprecated in favour of `--scope changed`, but the scan was interrupted before a score
  was emitted. No React Doctor regression score is available.

## Commit

Commit SHA is recorded after staging and committing this report and all scoped task files.

## Concerns

The repository-wide lint, global coverage threshold, standalone typecheck, and React Doctor
score remain blocked by pre-existing repository conditions documented above. Live browser
verification of an authenticated moderation action and exit check remains incomplete and
requires the owner.
