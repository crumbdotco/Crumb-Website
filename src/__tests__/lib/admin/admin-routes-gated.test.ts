import fs from "fs";
import path from "path";

/**
 * Static-analysis guard: every page.tsx / route.ts under src/app/admin/**
 * and src/app/api/admin/** must either call requireAdmin() (the session
 * gate in src/lib/admin/auth.ts) or be explicitly named on the allowlist
 * below as an intentionally-public part of the login handshake.
 *
 * This repo is public on GitHub, so a future admin page that forgets the
 * gate is an immediately discoverable hole. If this test fails, either:
 *   - add `await requireAdmin()` (and redirect/401 when it returns
 *     null/false) to the offending file, or
 *   - add the file to PUBLIC_ADMIN_ROUTES below with a comment
 *     justifying why it must stay reachable to unauthenticated users.
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
    return [];
  });
}

function relativeToAppRoot(filePath: string): string {
  return path.relative(APP_ROOT, filePath);
}

describe("admin routes are gated by requireAdmin", () => {
  const adminDir = path.join(APP_ROOT, "admin");
  const apiAdminDir = path.join(APP_ROOT, "api", "admin");
  const candidates = [...walk(adminDir), ...walk(apiAdminDir)];

  it("found at least one admin route to check (sanity check for the walker)", () => {
    expect(candidates.length).toBeGreaterThan(0);
  });

  it.each(candidates.map((f) => [relativeToAppRoot(f), f] as const))(
    "%s calls requireAdmin() or is on PUBLIC_ADMIN_ROUTES",
    (relPath, fullPath) => {
      if (PUBLIC_ADMIN_ROUTES.has(relPath)) {
        return;
      }

      const source = fs.readFileSync(fullPath, "utf8");
      const callsRequireAdmin =
        /requireAdmin\s*\(/.test(source) &&
        /from\s+['"].*\/lib\/admin\/auth['"]/.test(source);

      if (!callsRequireAdmin) {
        throw new Error(
          `${relPath} does not call requireAdmin() and is not on PUBLIC_ADMIN_ROUTES. ` +
            `Add requireAdmin() (and redirect/401 when it returns null/false), or add ` +
            `'${relPath}' to PUBLIC_ADMIN_ROUTES in this test with a comment justifying why ` +
            `it must be reachable without an admin session.`,
        );
      }
    },
  );
});
