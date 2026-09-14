# Admin Moderation Page and Origin Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a protected `/admin/moderation` dashboard for reports, bans, unban, and audit history, and harden the admin session cookie endpoint against cross-origin requests.

**Architecture:** Keep the existing `requireAdmin()` page-level gate. Read and mutate moderation data through the B6a security-definer RPCs using a server-only service-role client with the verified admin bearer in its `Authorization` header, so the RPC `auth.uid()` guard and audit actor remain correct. Use a bearer-free service-role client only for the GoTrue unban operation after a bearer-aware `is_platform_admin` preflight returns exact `true`. Server actions re-check the gate before every mutation and unauthorized access remains fail-closed with the existing redirect; navigation alone never bans an account.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase JS, React server components/server actions, Jest, Tailwind CSS.

**Spec:** `C:/Users/aliba/Downloads/Crumbify/app/docs/v1.0/STAGE-4.5-SPEC.md` section 5 row B6c, grounding `C1-2`, `V-1`, `V-2`, `C2-5`, and `website-read.md` section 6.

## Global Constraints

- Every admin page gates itself with `requireAdmin()`; `src/app/admin/layout.tsx` remains ungated so sign-in and callback routes stay reachable.
- B6a RPC names and return columns are authoritative: `admin_list_reports`, `admin_set_report_status`, `admin_list_bans`, `admin_audit_log`, and `admin_unban`.
- RPC calls must use the server-only service-role key and carry the verified admin bearer so `auth.uid()` and audit `actor_id` identify the real admin.
- The service-role key must remain server-only and must never be sent to the browser or logged.
- Page navigation cannot auto-ban users. Unauthorized access redirects fail-closed.
- Origin checks compare parsed origins exactly. Never use substring matching for `Origin` or `Referer`.
- No migrations, no waitlist changes, no version bump, no money/spend copy, no em/en dashes, and no attribution trailers.
- New production logic and tests must have complete meaningful coverage; existing website thresholds remain at least 80% global.

---

### Task 1: Typed moderation service

**Files:**
- Create: `src/lib/admin/moderation.ts`
- Create: `src/__tests__/lib/admin/moderation.test.ts`
- Modify: `src/lib/admin/auth.ts`
- Modify: `src/__tests__/lib/admin/auth.test.ts`

**Interfaces:**
- `getAdminSessionUser(): Promise<{ id: string; email: string | null } | null>` reads and verifies the existing session cookie.
- `requireAdmin(): Promise<string | null>` keeps its existing public contract.
- `fetchModerationData(accessToken: string): Promise<ModerationData>` returns reports, bans, and audit rows with independent unavailable states.
- `setModerationReportStatus(accessToken: string, input: { source: ReportSource; reportId: string; status: ReportStatus }): Promise<void>` calls `admin_set_report_status`.
- `unbanModerationUser(accessToken: string, userId: string): Promise<void>` clears GoTrue with the service-role client first, then calls `admin_unban` with the admin bearer.

- [x] **Step 1: Write failing unit tests** for session-user extraction, all RPC response mappings, independent read failures, mutation argument validation, and unban ordering.
- [x] **Step 2: Run the focused test file** with `npm test -- --runInBand` replaced by the repository-safe worker setting `npm test -- --runTestsByPath src/__tests__/lib/admin/moderation.test.ts --maxWorkers=1`; confirm the tests fail for missing exports or behavior.
- [x] **Step 3: Implement the typed service** with injected client seams for tests, a service-role client factory, and a bearer-aware RPC client. Keep error messages generic at the page boundary.
- [x] **Step 4: Add the reusable verified-session helper** in `auth.ts` without changing the existing allowlist behavior.
- [x] **Step 5: Run the focused tests again** and confirm all service behavior passes.
- [x] **Step 6: Commit the service slice** with explicit file staging and a conventional commit message.

### Task 2: Origin and Referer protection

**Files:**
- Modify: `src/app/api/admin/session/route.ts`
- Create: `src/__tests__/api/admin-session.test.ts`

**Interfaces:**
- `isAllowedAdminSessionRequest(origin: string | null, referer: string | null): boolean` accepts exact production or explicit local-development origins and rejects missing, malformed, null, and lookalike origins.

- [x] **Step 1: Write failing route tests** for exact production origin, exact local origins, valid Referer fallback, missing both headers, malformed values, `Origin: null`, and lookalike domains.
- [x] **Step 2: Run the focused route tests** with `npm test -- --runTestsByPath src/__tests__/api/admin-session.test.ts --maxWorkers=1`; confirm the origin helper is absent or the protection is not enforced.
- [x] **Step 3: Implement exact parsed-origin validation** before parsing JSON or setting the cookie, returning a generic 403 response for rejected requests.
- [x] **Step 4: Run the focused route tests** and confirm the cookie behavior still passes for allowed requests.
- [x] **Step 5: Commit the origin slice** with explicit file staging.

### Task 3: Moderation page and server actions

**Files:**
- Create: `src/app/admin/moderation/page.tsx`
- Create: `src/app/admin/moderation/actions.ts`
- Modify: `src/app/admin/page.tsx`
- Create: `src/__tests__/app/admin-moderation-page.test.tsx`
- Create: `src/__tests__/app/admin-moderation-actions.test.ts`

**Interfaces:**
- `setReportStatusAction(formData: FormData): Promise<void>` validates `source`, `reportId`, and `status`, re-checks admin access, calls the service, revalidates, and redirects with a safe result code.
- `unbanUserAction(formData: FormData): Promise<void>` validates `userId`, re-checks admin access, calls the service, revalidates, and redirects with a safe result code.

- [x] **Step 1: Write failing page and action tests** for page gating, report/ban/audit rendering, status action forms, unban form, invalid action inputs, and successful revalidation redirects.
- [x] **Step 2: Run the focused page/action tests** with `npm test -- --runTestsByPath src/__tests__/app/admin-moderation-page.test.tsx src/__tests__/app/admin-moderation-actions.test.ts --maxWorkers=1`; confirm they fail before the route exists.
- [x] **Step 3: Implement server actions** with safe form parsing and no client-side authorization assumptions.
- [x] **Step 4: Implement the responsive moderation page** with the existing dark admin visual language, accessible headings and buttons, report status controls, active ban details, audit rows, unavailable states, and no sensitive service credentials.
- [x] **Step 5: Add the Moderation link** to the existing admin dashboard header.
- [x] **Step 6: Run the focused tests** and confirm the page and actions pass.
- [x] **Step 7: Commit the page slice** with explicit file staging.

### Task 4: Full verification and handoff

**Files:**
- Modify: `HANDOFF.md`
- Modify: `implementation-notes.md`

- [x] **Step 1: Run website tests and coverage** with `npm test` and `npm run test:coverage` using the repository worker policy.
- [x] **Step 2: Run static checks** with `npm run lint`, `npm run build`, and `npx tsc --noEmit` if the repository has no separate typecheck script.
- [x] **Step 3: Review the diff** for origin substring checks, client exposure of service credentials, missing admin gates, unsafe redirects, and forbidden copy.
- [x] **Step 4: Record the implementation decisions, the no-auto-ban security rationale, and any unavailable live-device checks** in `implementation-notes.md` and `HANDOFF.md`.
- [x] **Step 5: Commit documentation updates** with explicit file staging and report the final verification evidence.

### Task 5: Review-to-zero security correction

**Files:**
- Modify: `src/lib/admin/moderation.ts`
- Modify: `src/app/admin/moderation/actions.ts`
- Modify: `src/app/admin/moderation/page.tsx`
- Modify: `src/app/api/admin/session/route.ts`
- Modify: focused tests for these modules
- Modify: `implementation-notes.md`
- Modify: `HANDOFF.md`

**Interfaces:**
- The moderation service must verify the caller through `is_platform_admin` before any bearer-free GoTrue admin mutation, then keep the final `admin_unban` RPC check.
- Shared exported validators are the one source for moderation UUID, report-source, and report-status validation.
- Production accepts only `https://crumbify.co.uk` for admin-session POST requests. Localhost origins are development-only.
- The unrequested unauthorized-access email path and its environment requirements are removed.

- [x] **Step 1: Write focused failing tests** for platform-admin preflight ordering, denial before GoTrue mutation, and production rejection of localhost origins. Confirm each RED failure has the expected reason.
- [x] **Step 2: Implement the minimal security corrections**, remove the alert path, and consolidate validators.
- [x] **Step 3: Add the required production-file headers** and update tests for the reduced scope.
- [x] **Step 4: Run focused tests, full Jest, lint, build, typecheck, coverage, and React Doctor.**
- [x] **Step 5: Correct implementation notes and handoff**, name the class guards, and commit with explicit file staging.
