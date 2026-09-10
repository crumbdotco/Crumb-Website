/**
 * Static-analysis guard: the founding-member cap must have exactly one
 * source (src/lib/founding-cap.ts, backed by the get_founding_cap() RPC),
 * never a hardcoded `= 100` literal or the old per-file constants
 * (FOUNDING_CAP / MAX_FOUNDING / DEFAULT_FOUNDING_CAP) duplicated across the
 * Stripe webhook and the public founding-availability route
 * (Stage 4.5 B7 / Crumb-Website#17).
 *
 * Also pins that the founder-clawback RPC call sits AFTER the waitlist
 * delete in the webhook's refund branch (it demotes profiles for rows the
 * delete actually removed), never before it.
 *
 * SCOPE, deliberately narrow (owner ruling, Stage 4.5 B7 fix round):
 *   - The cap-literal scan below walks only src/app/api/** and src/lib/**.
 *     It does NOT scan the landing components (e.g.
 *     src/components/landing/FoundingSection.tsx). That page's "first
 *     100" headline, its `x / 100` display, and its progress-bar math are
 *     editorial copy about the launch promise, not a cap read - the page
 *     renders whatever count/remaining the API handed it and clamps its
 *     own display to 100 regardless of the live cap's actual value. Widening
 *     this scan to include it would block an ordinary copy edit for no
 *     safety gain. Do not "fix" this scope without a fresh ruling.
 *   - The DEFAULT_FOUNDING_CAP-identifier scan below walks all of src/
 *     EXCEPT __tests__ directories, since this very guard file (and any
 *     future test asserting the identifier is retired) necessarily mentions
 *     the string itself.
 *
 * Reads the actual route sources (filesystem only) so it stays correct
 * across reasonable refactors instead of pinning exact whitespace.
 */

import { readFileSync, readdirSync } from "fs";
import path from "path";

const WEBHOOK_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "app",
  "api",
  "stripe",
  "webhook",
  "route.ts"
);
const FOUNDING_ROUTE_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "app",
  "api",
  "waitlist",
  "founding",
  "route.ts"
);

const SRC_ROOT = path.resolve(__dirname, "..", "..");
const API_ROOT = path.resolve(SRC_ROOT, "app", "api");
const LIB_ROOT = path.resolve(SRC_ROOT, "lib");

const BANNED_IDENTIFIERS = ["FOUNDING_CAP", "MAX_FOUNDING"];
const RETIRED_IDENTIFIERS = ["DEFAULT_FOUNDING_CAP"];

/**
 * Anchors on an identifier that contains cap/founding/founder, immediately
 * followed by an assignment, object-property, or fallback operator and a
 * numeric literal - e.g. `FOUNDING_CAP = 100`, `founderCap: 100`,
 * `remaining: cap ?? 100`. Deliberately requires identifier-THEN-operator-
 * THEN-digits so it does not fire on unrelated numbers elsewhere in a file
 * (a port, a timeout) or on legitimate comparisons/reads of the live `cap`
 * variable itself (`count >= cap`, `getFoundingCap(supabase)`).
 */
const CAP_LITERAL_PATTERN = /\b\w*(?:cap|founding|founder)\w*\b\s*(?:=|:|\?\?|\|\|)\s*\d+\b/i;

function listTsFiles(root: string, opts: { excludeTests: boolean }): string[] {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const out: string[] = [];
  for (const entry of entries) {
    if (opts.excludeTests && entry.name === "__tests__") continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...listTsFiles(full, opts));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe("security: the founding-member cap has exactly one source", () => {
  const webhookSource = readFileSync(WEBHOOK_PATH, "utf-8");
  const foundingRouteSource = readFileSync(FOUNDING_ROUTE_PATH, "utf-8");

  it.each([
    ["webhook route", WEBHOOK_PATH, webhookSource],
    ["founding route", FOUNDING_ROUTE_PATH, foundingRouteSource],
  ])("%s never declares a `= 100` cap literal", (_label, _filePath, source) => {
    expect(source).not.toMatch(/=\s*100\s*;/);
  });

  it.each([
    ["webhook route", WEBHOOK_PATH, webhookSource],
    ["founding route", FOUNDING_ROUTE_PATH, foundingRouteSource],
  ])("%s never references the retired FOUNDING_CAP / MAX_FOUNDING identifiers", (_label, _filePath, source) => {
    for (const identifier of BANNED_IDENTIFIERS) {
      expect(source).not.toMatch(new RegExp(`\\b${identifier}\\b`));
    }
  });

  it.each([
    ["webhook route", webhookSource],
    ["founding route", foundingRouteSource],
  ])("%s imports the cap from @/lib/founding-cap", (_label, source) => {
    expect(source).toMatch(/from\s+["']@\/lib\/founding-cap["']/);
  });

  it("the webhook calls demote_refunded_founder inside the refund branch, AFTER the waitlist delete (never before it)", () => {
    const deleteIndex = webhookSource.indexOf(".delete()");
    const rpcIndex = webhookSource.search(/\.rpc\(\s*['"]demote_refunded_founder['"]/);

    expect(deleteIndex).toBeGreaterThan(-1);
    expect(rpcIndex).toBeGreaterThan(-1);
    expect(rpcIndex).toBeGreaterThan(deleteIndex);
  });
});

describe("security: CAP_LITERAL_PATTERN cannot go vacuous", () => {
  it("flags real offenders (the exact shapes this guard exists to catch)", () => {
    expect(CAP_LITERAL_PATTERN.test("const FOUNDING_CAP = 100;")).toBe(true);
    expect(CAP_LITERAL_PATTERN.test("const founderCap = 100;")).toBe(true);
    expect(CAP_LITERAL_PATTERN.test("remaining: cap ?? 100")).toBe(true);
    expect(CAP_LITERAL_PATTERN.test("closed: safeCount >= foundingCap || 100")).toBe(true);
  });

  it("does not flag innocent, unrelated numeric literals or legitimate cap reads/comparisons", () => {
    expect(CAP_LITERAL_PATTERN.test("const timeoutMs = 100;")).toBe(false);
    expect(CAP_LITERAL_PATTERN.test("const port = 3000;")).toBe(false);
    expect(CAP_LITERAL_PATTERN.test("const cap = await getFoundingCap(supabase);")).toBe(false);
    expect(CAP_LITERAL_PATTERN.test("const closed = safeCount >= cap;")).toBe(false);
  });
});

describe("security: no cap-identifier numeric literal anywhere under src/app/api or src/lib", () => {
  const files = [
    ...listTsFiles(API_ROOT, { excludeTests: true }),
    ...listTsFiles(LIB_ROOT, { excludeTests: true }),
  ];

  it("scanned more than zero files (the guard itself is not vacuous)", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => [path.relative(SRC_ROOT, f), f]))(
    "%s has no cap-identifier numeric literal",
    (_label, file) => {
      const source = readFileSync(file as string, "utf-8");
      expect(source).not.toMatch(CAP_LITERAL_PATTERN);
    }
  );
});

describe("security: DEFAULT_FOUNDING_CAP no longer exists anywhere under src/ (excluding __tests__)", () => {
  const files = listTsFiles(SRC_ROOT, { excludeTests: true });

  it("scanned more than zero files (the guard itself is not vacuous)", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => [path.relative(SRC_ROOT, f), f]))(
    "%s does not reference DEFAULT_FOUNDING_CAP",
    (_label, file) => {
      const source = readFileSync(file as string, "utf-8");
      for (const identifier of RETIRED_IDENTIFIERS) {
        expect(source).not.toMatch(new RegExp(`\\b${identifier}\\b`));
      }
    }
  );
});
