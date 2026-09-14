import fs from "fs";
import path from "path";

/**
 * Static-analysis guard: every page.tsx / route.ts under src/app/admin/**
 * and src/app/api/admin/** must either call requireAdmin() (the session
 * gate in src/lib/admin/auth.ts) or be explicitly named on the allowlist
 * below as an intentionally-public part of the login handshake.
 *
 * Every exported `'use server'` action under those same trees (actions.ts)
 * gets a STRONGER check than page.tsx/route.ts: it is not enough that the
 * file calls requireAdmin() somewhere - a server action is invoked directly
 * by a submitted <form>, so requireAdmin() must be the FIRST statement each
 * exported async function runs, before it reads any untrusted form data or
 * performs any other work. A file that merely mentions requireAdmin() later
 * in the function would pass a presence-only check while still doing
 * unauthenticated work first.
 *
 * This repo is public on GitHub, so a future admin page or action that
 * forgets the gate is an immediately discoverable hole. If this test fails,
 * either:
 *   - add `await requireAdmin()` (and redirect/401 when it returns
 *     null/false) as the FIRST statement of the offending export, or
 *   - for page.tsx/route.ts only, add the file to PUBLIC_ADMIN_ROUTES below
 *     with a comment justifying why it must stay reachable to
 *     unauthenticated users.
 */

const APP_ROOT = path.join(__dirname, "..", "..", "..", "app");

// Files under src/app/admin/** and src/app/api/admin/** that are
// intentionally reachable WITHOUT an admin session. Every entry needs a
// reason - unauthenticated reachability here is a deliberate act.
const PUBLIC_ADMIN_ROUTES = new Set<string>([
  // The sign-in form itself. It has to render for a logged-out visitor,
  // otherwise nobody could ever sign in.
  path.join("admin", "signin", "page.tsx"),

  // Magic-link/OTP callback: Supabase redirects the (as yet unauthenticated)
  // browser here with a code to exchange for a session. It sets the
  // session cookie and is the mechanism BY WHICH auth happens, so it
  // cannot itself require an existing session.
  path.join("admin", "callback", "route.ts"),

  // Client-side OTP verification (src/app/admin/signin/SignInClient.tsx)
  // POSTs the Supabase-issued access token here to persist it as an
  // HTTP-only cookie. The token was already verified by Supabase's
  // verifyOtp() call client-side before this endpoint is hit, so this is
  // part of the login handshake, not a data-serving admin endpoint.
  path.join("api", "admin", "session", "route.ts"),
]);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (entry.name === "page.tsx" || entry.name === "route.ts") return [full];
    if (entry.name === "actions.ts" && isServerActionsFile(full)) return [full];
    return [];
  });
}

function isServerActionsFile(filePath: string): boolean {
  const source = fs.readFileSync(filePath, "utf8");
  return /^\s*['"]use server['"]\s*;?\s*$/m.test(source);
}

function relativeToAppRoot(filePath: string): string {
  return path.relative(APP_ROOT, filePath);
}

/**
 * Extracts `export async function NAME(...) { ... }` bodies via brace-depth
 * scanning (this file's source is small and controlled, so a full parser is
 * not warranted - the same trade-off every other readFileSync+regex guard
 * in this repo makes).
 */
function extractExportedAsyncFunctions(source: string): { name: string; body: string }[] {
  const results: { name: string; body: string }[] = [];
  const fnHeaderRe = /export\s+async\s+function\s+([A-Za-z0-9_]+)\s*\([^)]*\)[^{]*\{/g;
  let match: RegExpExecArray | null;
  while ((match = fnHeaderRe.exec(source)) !== null) {
    const name = match[1];
    const bodyStart = fnHeaderRe.lastIndex;
    let depth = 1;
    let i = bodyStart;
    while (i < source.length && depth > 0) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") depth--;
      i++;
    }
    results.push({ name, body: source.slice(bodyStart, i - 1) });
    fnHeaderRe.lastIndex = i;
  }
  return results;
}

/**
 * True only when the body's first real statement (comments and blank lines
 * skipped) is a `requireAdmin()` call, optionally assigned to a variable -
 * exactly the `const userId = await requireAdmin();` shape this repo's real
 * actions use. Anything else as the first statement fails, even if
 * requireAdmin() is called later in the body.
 */
function firstStatementCallsRequireAdmin(body: string): boolean {
  const firstStatement = body
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .find((line) => line.length > 0);
  if (!firstStatement) return false;
  return /^(?:const\s+\w+\s*=\s*|let\s+\w+\s*=\s*)?await\s+requireAdmin\s*\(/.test(firstStatement);
}

function checkServerActionsGating(source: string, label: string): { ok: boolean; failures: string[] } {
  const failures = extractExportedAsyncFunctions(source)
    .filter((fn) => !firstStatementCallsRequireAdmin(fn.body))
    .map(
      (fn) =>
        `${label}: exported server action '${fn.name}' does not call requireAdmin() as its first statement`,
    );
  return { ok: failures.length === 0, failures };
}

describe("admin routes are gated by requireAdmin", () => {
  const adminDir = path.join(APP_ROOT, "admin");
  const apiAdminDir = path.join(APP_ROOT, "api", "admin");
  const candidates = [...walk(adminDir), ...walk(apiAdminDir)];

  it("found at least one admin route to check (sanity check for the walker)", () => {
    expect(candidates.length).toBeGreaterThan(0);
  });

  it("found at least one server actions file to check (sanity check for the actions.ts walker)", () => {
    const actionsFiles = candidates.filter((f) => path.basename(f) === "actions.ts");
    expect(actionsFiles.length).toBeGreaterThan(0);
  });

  it.each(candidates.map((f) => [relativeToAppRoot(f), f] as const))(
    "%s calls requireAdmin() or is on PUBLIC_ADMIN_ROUTES",
    (relPath, fullPath) => {
      if (PUBLIC_ADMIN_ROUTES.has(relPath)) {
        return;
      }

      const source = fs.readFileSync(fullPath, "utf8");

      if (path.basename(fullPath) === "actions.ts") {
        const result = checkServerActionsGating(source, relPath);
        if (!result.ok) throw new Error(result.failures.join("\n"));
        return;
      }

      const callsRequireAdmin =
        /requireAdmin\s*\(/.test(source) &&
        /from\s+['"].*\/lib\/admin\/auth['"]/.test(source);

      if (!callsRequireAdmin) {
        throw new Error(
          `${relPath} does not call requireAdmin() and is not on PUBLIC_ADMIN_ROUTES. ` +
            `Add requireAdmin() (and redirect/401 when it returns null/false) to the offending file, or add ` +
            `'${relPath}' to PUBLIC_ADMIN_ROUTES in this test with a comment justifying why ` +
            `it must be reachable without an admin session.`,
        );
      }
    },
  );
});

describe("checkServerActionsGating (the actions.ts guard itself)", () => {
  it("RED: flags an exported async function whose first statement is not requireAdmin()", () => {
    const source = `
'use server';

import { requireAdmin } from '@/lib/admin/auth';

export async function riskyAction(formData: FormData): Promise<void> {
  const value = formData.get('value');
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(value);
}
`;

    const result = checkServerActionsGating(source, "fixture/actions.ts");

    expect(result.ok).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain("riskyAction");
    expect(result.failures[0]).toContain("fixture/actions.ts");
  });

  it("GREEN: passes an exported async function whose first statement calls requireAdmin()", () => {
    const source = `
'use server';

import { requireAdmin } from '@/lib/admin/auth';

export async function safeAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
}
`;

    const result = checkServerActionsGating(source, "fixture/actions.ts");

    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it("RED: names every non-compliant export when a file has more than one", () => {
    const source = `
'use server';

export async function firstAction(): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
}

export async function secondAction(formData: FormData): Promise<void> {
  const raw = formData.get('x');
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(raw);
}
`;

    const result = checkServerActionsGating(source, "fixture/actions.ts");

    expect(result.ok).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain("secondAction");
    expect(result.failures.join(" ")).not.toContain("firstAction");
  });

  it("GREEN: the real moderation and referrals actions files pass today", () => {
    const moderationSource = fs.readFileSync(
      path.join(APP_ROOT, "admin", "moderation", "actions.ts"),
      "utf8",
    );
    const referralsSource = fs.readFileSync(
      path.join(APP_ROOT, "admin", "referrals", "actions.ts"),
      "utf8",
    );

    expect(checkServerActionsGating(moderationSource, "admin/moderation/actions.ts").ok).toBe(true);
    expect(checkServerActionsGating(referralsSource, "admin/referrals/actions.ts").ok).toBe(true);
  });
});
