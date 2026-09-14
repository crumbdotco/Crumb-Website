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
 * file calls requireAdmin() somewhere, or even that requireAdmin() is the
 * first statement - requireAdmin() returns `string | null` and never
 * throws, so calling it proves nothing on its own. The guard instead pins
 * the DATA FLOW: the first statement must assign requireAdmin()'s result to
 * a variable, and the very next statement must branch on that SAME
 * variable being falsy and return or redirect - exactly the shape this
 * repo's real actions use (`const userId = await requireAdmin(); if
 * (!userId) return ...;`). A file that calls requireAdmin() but discards
 * the result, checks a different variable, or never branches on it at all
 * would pass a presence-only check while still doing unauthenticated work.
 *
 * The guard also checks import PROVENANCE for actions.ts: requireAdmin
 * must be imported from the real auth module, not redeclared locally or
 * imported from a look-alike module, or every other check here can be
 * satisfied by a function that shares the name and does nothing.
 *
 * Both `export async function NAME(...) {...}` and
 * `export const NAME = async (...) => {...}` (and the function-expression
 * form `export const NAME = async function (...) {...}`) shapes are
 * extracted. A 'use server' file from which no exported async function
 * could be extracted at all fails LOUDLY (the guard cannot verify a file
 * it cannot parse) rather than passing vacuously.
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
const AUTH_MODULE_SUFFIX = "/lib/admin/auth";

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

interface ExtractedFunction {
  name: string;
  body: string;
}

interface ExtractionResult {
  functions: ExtractedFunction[];
  /** Names of exported async candidates whose header matched but whose
   * body could not be located (e.g. a concise-body arrow with no braces).
   * Reported as its own failure rather than silently skipped. */
  unparsable: string[];
}

interface HeaderMatch {
  name: string;
  /** Index of the '(' that opens the parameter list. */
  openParenIndex: number;
  index: number;
}

const FUNCTION_DECL_HEADER_RE = /export\s+async\s+function\s+([A-Za-z0-9_]+)\s*\(/g;
const CONST_FUNCTION_EXPR_HEADER_RE =
  /export\s+const\s+([A-Za-z0-9_]+)\s*=\s*async\s+function\s*[A-Za-z0-9_]*\s*\(/g;
const CONST_ARROW_HEADER_RE = /export\s+const\s+([A-Za-z0-9_]+)\s*=\s*async\s*\(/g;

function findHeaderMatches(source: string, re: RegExp): HeaderMatch[] {
  const matches: HeaderMatch[] = [];
  const scoped = new RegExp(re.source, re.flags);
  let m: RegExpExecArray | null;
  while ((m = scoped.exec(source)) !== null) {
    // Every header regex above ends with a literal '(' as its last
    // character, so lastIndex - 1 is exactly that paren's index.
    matches.push({ name: m[1], openParenIndex: scoped.lastIndex - 1, index: m.index });
  }
  return matches;
}

/** Depth-aware scan for the ')' that closes the parameter list starting at
 * the '(' index. Tracks only parens, so nested braces/brackets in a
 * destructured or typed parameter (e.g. `({ a }: { a: string })`) do not
 * confuse it. */
function findParamListEnd(source: string, openParenIndex: number): number {
  let depth = 1;
  for (let i = openParenIndex + 1; i < source.length; i++) {
    if (source[i] === "(") depth++;
    else if (source[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Scans forward from just past a parameter list's closing paren to find the
 * '{' that opens the function BODY, skipping over any '<'/'('/'{' that
 * appear inside a return-type annotation (e.g. `Promise<{ ok: boolean }>`
 * or an arrow's `(): Promise<void> =>`). Returns -1 when no body brace is
 * found before a top-level ';' (a concise-body arrow with no block body,
 * which this guard does not support extracting).
 */
function findBodyBraceIndex(source: string, fromIndex: number): number {
  let depth = 0;
  for (let i = fromIndex; i < source.length; i++) {
    const ch = source[i];
    if (ch === "<" || ch === "(") {
      depth++;
    } else if (ch === ">" || ch === ")") {
      depth = Math.max(0, depth - 1);
    } else if (ch === "{") {
      if (depth === 0) return i;
      depth++;
    } else if (ch === "}") {
      depth = Math.max(0, depth - 1);
    } else if (ch === ";" && depth === 0) {
      return -1;
    }
  }
  return -1;
}

/** Depth-aware scan from a body's opening '{' to its matching '}'. */
function findMatchingBrace(source: string, openBraceIndex: number): number {
  let depth = 1;
  for (let i = openBraceIndex + 1; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Extracts exported async function bodies via brace-depth scanning (this
 * file's subject files are small and controlled, so a full parser is not
 * warranted - the same trade-off every other readFileSync+regex guard in
 * this repo makes). Covers `export async function NAME(...) {...}`,
 * `export const NAME = async (...) => {...}`, and
 * `export const NAME = async function (...) {...}`.
 */
function extractExportedAsyncFunctions(source: string): ExtractionResult {
  const headerMatches = [
    ...findHeaderMatches(source, FUNCTION_DECL_HEADER_RE),
    ...findHeaderMatches(source, CONST_FUNCTION_EXPR_HEADER_RE),
    ...findHeaderMatches(source, CONST_ARROW_HEADER_RE),
  ].sort((a, b) => a.index - b.index);

  const functions: ExtractedFunction[] = [];
  const unparsable: string[] = [];

  for (const { name, openParenIndex } of headerMatches) {
    const paramEnd = findParamListEnd(source, openParenIndex);
    if (paramEnd === -1) {
      unparsable.push(name);
      continue;
    }
    const bodyBrace = findBodyBraceIndex(source, paramEnd + 1);
    if (bodyBrace === -1) {
      unparsable.push(name);
      continue;
    }
    const bodyEnd = findMatchingBrace(source, bodyBrace);
    if (bodyEnd === -1) {
      unparsable.push(name);
      continue;
    }
    functions.push({ name, body: source.slice(bodyBrace + 1, bodyEnd) });
  }

  return { functions, unparsable };
}

/**
 * Splits a function body into normalised top-level statements: block and
 * line comments are stripped first (so a body-leading `/** ... *\/` never
 * shifts what counts as "the first statement"), then the remaining text is
 * split on ';' and on the closing '}' of a brace block, both only at
 * top-level depth (so `if (!x) { return y(); }` is kept as ONE statement,
 * not split on the inner ';'). Each statement has its internal whitespace
 * (including line breaks from a reflowed call) collapsed to single spaces,
 * so a statement wrapped across lines still matches the same pattern as
 * one written on a single line.
 */
function splitIntoStatements(body: string): string[] {
  const withoutBlockComments = body.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");

  const statements: string[] = [];
  let current = "";
  let depth = 0;
  for (const ch of withoutLineComments) {
    if (ch === "(" || ch === "{" || ch === "[") depth++;
    current += ch;
    if (ch === ")" || ch === "}" || ch === "]") {
      depth = Math.max(0, depth - 1);
      if (depth === 0 && ch === "}") {
        statements.push(current);
        current = "";
        continue;
      }
    }
    if (ch === ";" && depth === 0) {
      statements.push(current);
      current = "";
    }
  }
  if (current.trim()) statements.push(current);

  return statements.map((s) => s.replace(/\s+/g, " ").trim()).filter((s) => s.length > 0);
}

const ASSIGN_REQUIRE_ADMIN_RE = /^(?:const|let)\s+([A-Za-z0-9_$]+)\s*=\s*await\s+requireAdmin\s*\(\s*\)\s*;$/;
const BARE_AWAIT_REQUIRE_ADMIN_RE = /^await\s+requireAdmin\s*\(\s*\)\s*;$/;
const IF_FALSY_BRANCH_RE = /^if\s*\(\s*!\s*([A-Za-z0-9_$]+)\s*\)\s*(.*)$/;
const EXIT_KEYWORD_RE = /^(?:return|redirect)\b/;

/**
 * Checks ONE exported function's data flow: the first statement must
 * assign requireAdmin()'s result to a variable, and the second must branch
 * on that SAME variable being falsy with a return/redirect. Returns a
 * distinct, human-readable failure reason, or null when it is compliant.
 */
function checkFunctionGating(label: string, name: string, body: string): string | null {
  const statements = splitIntoStatements(body);
  const first = statements[0] ?? "";

  const assignMatch = ASSIGN_REQUIRE_ADMIN_RE.exec(first);
  if (!assignMatch) {
    if (BARE_AWAIT_REQUIRE_ADMIN_RE.test(first)) {
      return (
        `${label}: exported server action '${name}' calls requireAdmin() as its first statement ` +
        `but discards the result instead of assigning it to a variable and checking it`
      );
    }
    return `${label}: exported server action '${name}' does not call requireAdmin() as its first statement`;
  }

  const identifier = assignMatch[1];
  const second = statements[1] ?? "";
  const ifMatch = IF_FALSY_BRANCH_RE.exec(second);

  if (!ifMatch) {
    return (
      `${label}: exported server action '${name}' assigns requireAdmin()'s result to '${identifier}' ` +
      `but its second statement does not immediately branch on '${identifier}' being falsy`
    );
  }

  const [, branchedIdentifier, rawThen] = ifMatch;
  if (branchedIdentifier !== identifier) {
    return (
      `${label}: exported server action '${name}' checks '${branchedIdentifier}' in its second statement ` +
      `instead of '${identifier}', the variable requireAdmin()'s result was actually assigned to`
    );
  }

  const thenPart = rawThen
    .trim()
    .replace(/^\{\s*/, "")
    .replace(/\s*\}$/, "")
    .trim();
  if (!EXIT_KEYWORD_RE.test(thenPart)) {
    return (
      `${label}: exported server action '${name}' checks '${identifier}' in its second statement ` +
      `but that branch does not return or redirect when the check fails`
    );
  }

  return null;
}

/** True when requireAdmin is imported (by that exact local name) from the
 * real auth module - `@/lib/admin/auth` or a relative path ending the same
 * way. Deliberately does not support a renamed/aliased import: this repo's
 * real actions files never alias it, and supporting aliasing would widen
 * the guard to accommodate a form nothing in the tree uses. */
function requireAdminImportedFromAuthModule(source: string): boolean {
  const importRe = /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]*)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(source)) !== null) {
    const importPath = m[2];
    if (!importPath.endsWith(AUTH_MODULE_SUFFIX)) continue;
    const names = m[1].split(",").map((n) => n.trim());
    if (names.includes("requireAdmin")) return true;
  }
  return false;
}

/** True when the file declares its OWN `requireAdmin`, which would shadow
 * (or exist instead of) the real import and silently defeat every other
 * check in this guard, which only checks that a symbol named requireAdmin
 * is called - not what it actually does. */
function requireAdminLocallyRedeclared(source: string): boolean {
  return /\b(?:const|let|var|function)\s+requireAdmin\b/.test(source);
}

function checkServerActionsGating(source: string, label: string): { ok: boolean; failures: string[] } {
  const failures: string[] = [];

  if (requireAdminLocallyRedeclared(source)) {
    failures.push(
      `${label}: 'requireAdmin' is redeclared locally instead of imported from '@/lib/admin/auth' - ` +
        `a local redeclaration can silently bypass the real admin gate`,
    );
  } else if (!requireAdminImportedFromAuthModule(source)) {
    failures.push(
      `${label}: 'requireAdmin' is not imported from '@/lib/admin/auth' (or its relative equivalent) - ` +
        `the gate cannot be trusted against an untrusted import source`,
    );
  }

  const { functions, unparsable } = extractExportedAsyncFunctions(source);

  for (const name of unparsable) {
    failures.push(
      `${label}: could not parse the body of exported server action '${name}' ` +
        `(unsupported syntax, such as a concise-body arrow with no braces)`,
    );
  }

  if (functions.length === 0 && unparsable.length === 0) {
    failures.push(
      `${label}: no exported server actions could be parsed from this 'use server' file - ` +
        `the guard cannot verify gating and treats this as unsafe`,
    );
  }

  for (const fn of functions) {
    const failure = checkFunctionGating(label, fn.name, fn.body);
    if (failure) failures.push(failure);
  }

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
  const AUTH_IMPORT = "import { requireAdmin } from '@/lib/admin/auth';";

  describe("compliant shapes (GREEN)", () => {
    it("passes an exported async function whose first statement assigns and second statement checks requireAdmin()'s result", () => {
      const source = `
'use server';

${AUTH_IMPORT}

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

    it("[A1] passes an exported CONST ARROW function using the same shape", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export const safeAction = async (formData: FormData): Promise<void> => {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
};
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(true);
      expect(result.failures).toEqual([]);
    });

    it("[A4] passes when the return type is a generic wrapping an object type literal (Promise<{ ok: boolean }>)", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function safeAction(formData: FormData): Promise<{ ok: boolean }> {
  const userId = await requireAdmin();
  if (!userId) return { ok: false };
  console.log(formData.get('value'));
  return { ok: true };
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(true);
      expect(result.failures).toEqual([]);
    });

    it("[A4] passes when the body opens with a leading block comment before the first statement", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function safeAction(formData: FormData): Promise<void> {
  /**
   * Explains what this action does before any statement runs.
   */
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(true);
      expect(result.failures).toEqual([]);
    });

    it("[A4] passes when the requireAdmin() call is reflowed across two lines", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function safeAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin(
  );
  if (!userId) return;
  console.log(formData.get('value'));
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(true);
      expect(result.failures).toEqual([]);
    });

    it("passes the real moderation and referrals actions files today", () => {
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

  describe("mutation pairs: the [A4] false-alarm fixes must not have made the guard vacuous for those same shapes", () => {
    it("still flags a generic-return-type action whose branch does not actually exit", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function riskyAction(formData: FormData): Promise<{ ok: boolean }> {
  const userId = await requireAdmin();
  if (!userId) console.log('not authorised', formData.get('value'));
  return { ok: true };
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures[0]).toContain("does not return or redirect");
    });

    it("still flags a body-leading-comment action whose first REAL statement does not call requireAdmin()", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function riskyAction(formData: FormData): Promise<void> {
  /**
   * A comment before the first statement must not exempt the function
   * from the check - the guard must look past it, not skip checking.
   */
  const value = formData.get('value');
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(value);
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures[0]).toContain("does not call requireAdmin() as its first statement");
    });

    it("still flags a reflowed requireAdmin() call whose result is discarded rather than assigned", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function riskyAction(formData: FormData): Promise<void> {
  await requireAdmin(
  );
  console.log(formData.get('value'));
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures[0]).toContain("discards the result instead of assigning it to a variable");
    });
  });

  describe("data-flow mutants (RED) - [A2]", () => {
    it("flags a first statement that does not call requireAdmin() at all", () => {
      const source = `
'use server';

${AUTH_IMPORT}

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
      expect(result.failures[0]).toContain("does not call requireAdmin() as its first statement");
    });

    it("flags requireAdmin()'s result assigned but never checked (no second-statement branch)", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  console.log(userId, formData.get('value'));
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0]).toContain("riskyAction");
      expect(result.failures[0]).toContain("does not immediately branch on 'userId' being falsy");
    });

    it("flags requireAdmin()'s result discarded via a bare await (never assigned)", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function riskyAction(formData: FormData): Promise<void> {
  await requireAdmin();
  console.log(formData.get('value'));
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0]).toContain("riskyAction");
      expect(result.failures[0]).toContain("discards the result instead of assigning it to a variable");
    });

    it("flags a second-statement branch that checks a DIFFERENT identifier than the one requireAdmin()'s result was assigned to", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!formData) return;
  console.log(userId);
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0]).toContain("riskyAction");
      expect(result.failures[0]).toContain("checks 'formData'");
      expect(result.failures[0]).toContain("instead of 'userId'");
    });

    it("names every non-compliant export when a file has more than one", () => {
      const source = `
'use server';

${AUTH_IMPORT}

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
  });

  describe("import provenance mutants (RED) - [A3]", () => {
    it("flags requireAdmin imported from a look-alike module instead of the real auth module", () => {
      const source = `
'use server';

import { requireAdmin } from './my-fake-auth';

export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures.some((f) => f.includes("is not imported from '@/lib/admin/auth'"))).toBe(true);
    });

    it("flags a locally redeclared requireAdmin that shadows the real gate", () => {
      const source = `
'use server';

const requireAdmin = async () => 'fake-admin-id';

export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures.some((f) => f.includes("is redeclared locally"))).toBe(true);
    });
  });

  describe("vacuous-file mutant (RED) - [A1]", () => {
    it("fails loudly, with a distinct message, when zero exported server actions can be parsed from a 'use server' file", () => {
      const source = `
'use server';

${AUTH_IMPORT}

export const SOME_CONSTANT = 42;

function helper() {
  return 1;
}
`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0]).toContain("no exported server actions could be parsed");
    });
  });

  describe("[A5] every failure mode has its own distinct message", () => {
    it("collects a failure message from every RED fixture above and asserts none of them repeat", () => {
      const redFixtures: { source: string; label: string }[] = [
        {
          label: "does-not-call",
          source: `
'use server';
${AUTH_IMPORT}
export async function riskyAction(formData: FormData): Promise<void> {
  const value = formData.get('value');
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(value);
}
`,
        },
        {
          label: "result-never-checked",
          source: `
'use server';
${AUTH_IMPORT}
export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  console.log(userId, formData.get('value'));
}
`,
        },
        {
          label: "bare-await-discarded",
          source: `
'use server';
${AUTH_IMPORT}
export async function riskyAction(formData: FormData): Promise<void> {
  await requireAdmin();
  console.log(formData.get('value'));
}
`,
        },
        {
          label: "branches-wrong-identifier",
          source: `
'use server';
${AUTH_IMPORT}
export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!formData) return;
  console.log(userId);
}
`,
        },
        {
          label: "branch-does-not-exit",
          source: `
'use server';
${AUTH_IMPORT}
export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) console.log('not authorised');
  console.log(formData.get('value'));
}
`,
        },
        {
          label: "wrong-import-module",
          source: `
'use server';
import { requireAdmin } from './my-fake-auth';
export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
}
`,
        },
        {
          label: "local-redeclaration",
          source: `
'use server';
const requireAdmin = async () => 'fake-admin-id';
export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
}
`,
        },
        {
          label: "vacuous-file",
          source: `
'use server';
${AUTH_IMPORT}
export const SOME_CONSTANT = 42;
`,
        },
      ];

      const allMessages = redFixtures.flatMap(({ label, source }) => {
        const result = checkServerActionsGating(source, `fixture/${label}/actions.ts`);
        expect(result.ok).toBe(false);
        expect(result.failures.length).toBeGreaterThan(0);
        return result.failures;
      });

      expect(allMessages.length).toBe(new Set(allMessages).size);
    });
  });
});
