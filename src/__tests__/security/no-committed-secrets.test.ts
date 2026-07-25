/**
 * Static-analysis guard: fails the suite if a real-looking secret is
 * committed to tracked source. This repo is PUBLIC on GitHub - a committed
 * key is scraped by bots within minutes of a push, so this check runs on
 * every `npm test` / CI run instead of relying on a human catching it in
 * review.
 *
 * Filesystem only: no network calls, no git subprocess (keeps this fast and
 * safe to run in CI/offline). Walks the same source roots documented in
 * CLAUDE.md; skips node_modules/.next/.git and binary asset directories.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const SCAN_ROOTS = ["src", "supabase", "tests", "next.config.ts", "package.json"];

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "playwright-report",
  "test-results",
]);

// Only scan text/source file extensions - skip binaries so we never try to
// decode images/fonts as UTF-8.
const SCAN_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".sql",
  ".env",
  ".md",
]);

interface SecretMatch {
  pattern: string;
  advice: string;
}

interface SecretPattern {
  name: string;
  regex: RegExp;
  advice: string;
}

// Each pattern below requires a realistic minimum key length/entropy rather
// than allowlisting specific file paths, so it still fires no matter which
// file a real key lands in, but tolerates the short fake placeholders this
// repo's own tests use (e.g. "sk_test_key", "whsec_test", "test-service-role-key").
const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: "Stripe secret key (sk_live_/sk_test_)",
    regex: /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/g,
    advice:
      "Move this Stripe secret key to an environment variable (process.env.STRIPE_SECRET_KEY) and rotate the key in the Stripe dashboard.",
  },
  {
    name: "Stripe webhook secret (whsec_)",
    regex: /\bwhsec_[A-Za-z0-9]{20,}\b/g,
    advice:
      "Move this Stripe webhook secret to an environment variable (process.env.STRIPE_WEBHOOK_SECRET) and rotate it in the Stripe dashboard.",
  },
  {
    name: "JWT-shaped string (eyJ...)",
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    advice:
      "Move this JWT (likely a Supabase service-role or anon key) to an environment variable and rotate it in the Supabase dashboard.",
  },
  {
    name: "Google API key (AIza...)",
    regex: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    advice:
      "Move this Google API key to an environment variable and rotate/restrict it in the Google Cloud Console.",
  },
  {
    name: "literal 'service_role' key assignment",
    regex: /\bservice_role\w*\s*[:=]\s*["'`][A-Za-z0-9._-]{20,}["'`]/gi,
    advice:
      "Never assign a service-role key as a literal. Read it from process.env.SUPABASE_SERVICE_ROLE_KEY and rotate the exposed key in Supabase.",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY assigned a literal value",
    regex: /(?<!process\.env\.)\bSUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["'`][A-Za-z0-9._-]{20,}["'`]/g,
    advice:
      "Reference this as process.env.SUPABASE_SERVICE_ROLE_KEY instead of a literal string, and rotate the exposed key in Supabase.",
  },
  {
    name: "STRIPE_SECRET_KEY assigned a literal value",
    regex: /(?<!process\.env\.)\bSTRIPE_SECRET_KEY\s*[:=]\s*["'`][A-Za-z0-9._-]{20,}["'`]/g,
    advice:
      "Reference this as process.env.STRIPE_SECRET_KEY instead of a literal string, and rotate the exposed key in the Stripe dashboard.",
  },
];

function shouldSkipDir(name: string): boolean {
  return SKIP_DIR_NAMES.has(name) || name.startsWith(".");
}

function collectFiles(entryPath: string, out: string[]): void {
  const stat = statSync(entryPath);
  if (stat.isDirectory()) {
    const base = path.basename(entryPath);
    if (shouldSkipDir(base)) return;
    for (const child of readdirSync(entryPath)) {
      collectFiles(path.join(entryPath, child), out);
    }
    return;
  }
  if (!stat.isFile()) return;
  if (!SCAN_EXTENSIONS.has(path.extname(entryPath))) return;
  out.push(entryPath);
}

function gatherScanTargets(): string[] {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) {
    const abs = path.join(REPO_ROOT, root);
    try {
      collectFiles(abs, files);
    } catch {
      // Root doesn't exist (e.g. no tests/ dir yet) - not a scan failure.
    }
  }
  return files;
}

function findSecretsInFile(filePath: string): Array<{ line: number; text: string; match: SecretMatch }> {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const findings: Array<{ line: number; text: string; match: SecretMatch }> = [];

  lines.forEach((lineText, index) => {
    for (const pattern of SECRET_PATTERNS) {
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(lineText)) {
        findings.push({
          line: index + 1,
          text: lineText.trim(),
          match: { pattern: pattern.name, advice: pattern.advice },
        });
      }
    }
  });

  return findings;
}

describe("security: no committed secrets", () => {
  it("contains no real-looking Stripe/Supabase/Google/JWT secrets in tracked source", () => {
    const files = gatherScanTargets();
    expect(files.length).toBeGreaterThan(0);

    const allFindings: string[] = [];

    for (const file of files) {
      const relPath = path.relative(REPO_ROOT, file);
      const findings = findSecretsInFile(file);
      for (const finding of findings) {
        allFindings.push(
          `${relPath}:${finding.line} matched [${finding.match.pattern}]\n` +
            `  > ${finding.text}\n` +
            `  Fix: ${finding.match.advice}`
        );
      }
    }

    if (allFindings.length > 0) {
      throw new Error(
        `Found ${allFindings.length} possible committed secret(s). This repo is PUBLIC - ` +
          `treat every match as compromised.\n\n${allFindings.join("\n\n")}`
      );
    }
  });

  // Guards against silently narrowing the pattern list to nothing.
  it("defines at least one pattern per secret class this repo actually uses", () => {
    const names = SECRET_PATTERNS.map((p) => p.name);
    expect(names.some((n) => n.includes("Stripe secret key"))).toBe(true);
    expect(names.some((n) => n.includes("webhook secret"))).toBe(true);
    expect(names.some((n) => n.includes("JWT"))).toBe(true);
    expect(names.some((n) => n.includes("Google API key"))).toBe(true);
    expect(names.some((n) => n.toLowerCase().includes("service_role"))).toBe(true);
  });
});

/**
 * Static-analysis guard: no hardcoded @crumbify.co.uk email address may
 * appear in src/lib/**, src/app/admin/** or src/app/api/**. Those are the
 * roots where auth allowlists and internal config live - a hardcoded admin
 * email there (e.g. a DEFAULT_ADMIN_EMAILS fallback) publishes a phishing /
 * account-takeover target to anyone reading this PUBLIC repo. Allowlists
 * must come from env vars only.
 *
 * Deliberately narrower than the general secret scan above: legal/support/
 * footer pages under src/app (outside these three roots) legitimately show
 * contact@crumbify.co.uk, support@crumbify.co.uk, admin@crumbify.co.uk
 * (account-deletion instructions) and appreview@crumbify.co.uk, and must
 * keep passing.
 */
describe("security: no hardcoded crumbify.co.uk emails in lib/admin/api", () => {
  const EMAIL_SCOPED_ROOTS = [
    path.join("src", "lib"),
    path.join("src", "app", "admin"),
    path.join("src", "app", "api"),
  ];

  const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@crumbify\.co\.uk/g;

  function gatherEmailScanTargets(): string[] {
    const files: string[] = [];
    for (const root of EMAIL_SCOPED_ROOTS) {
      const abs = path.join(REPO_ROOT, root);
      try {
        collectFiles(abs, files);
      } catch {
        // Root doesn't exist - not a scan failure.
      }
    }
    return files;
  }

  it("contains no hardcoded @crumbify.co.uk email addresses", () => {
    const files = gatherEmailScanTargets();
    expect(files.length).toBeGreaterThan(0);

    const allFindings: string[] = [];

    for (const file of files) {
      const relPath = path.relative(REPO_ROOT, file);
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");

      lines.forEach((lineText, index) => {
        EMAIL_REGEX.lastIndex = 0;
        const match = EMAIL_REGEX.exec(lineText);
        if (match) {
          allFindings.push(
            `${relPath}:${index + 1} contains hardcoded email "${match[0]}"\n` +
              `  > ${lineText.trim()}\n` +
              `  Fix: read the allowlist from process.env.ADMIN_EMAILS (or the relevant env var) instead of hardcoding it.`
          );
        }
      });
    }

    if (allFindings.length > 0) {
      throw new Error(
        `Found ${allFindings.length} hardcoded crumbify.co.uk email(s) in src/lib, src/app/admin or ` +
          `src/app/api. This repo is PUBLIC - treat every match as a phishing/account-takeover target.\n\n` +
          allFindings.join("\n\n")
      );
    }
  });
});
