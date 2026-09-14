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
 * it cannot parse) rather than passing vacuously. Separately, if at least
 * one export DID parse but the file's real `export` keyword count is
 * higher than the number of headers recognised (an `export default`, a
 * generic `<T>` function, `export let`, or an `export { name }` list all
 * fail to match any of the three header shapes above), the guard fails
 * loudly by name-count rather than silently skipping the unrecognised
 * export.
 *
 * The two provenance checks (import source, local redeclaration) and the
 * export-count check all run on a comment-and-string-literal-masked copy
 * of the source, not the raw text: a decoy written inside a `//`/`/* *\/`
 * comment or inside an actual JS string value (e.g. `"import { requireAdmin
 * } from '@/lib/admin/auth';"` assigned to a variable) must never be
 * mistaken for real code in either direction - it must not manufacture a
 * fake pass for a file whose real import is a look-alike, and it must not
 * manufacture a false failure against a compliant file that merely
 * mentions the old shape in a comment or string.
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

/** Strips a fixture's `fixture/<label>: ` label prefix from a failure
 * message, leaving only the underlying reason. Used by the [A5]
 * distinctness self-test below: two fixtures whose reasons are genuinely
 * identical must not read as "distinct" just because their labels
 * differ. */
function stripFixtureLabel(message: string): string {
  return message.replace(/^fixture\/[^:]*:\s*/, "");
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
const EXIT_KEYWORD_RE = /^(?:return|redirect)\b/;

/**
 * Every accepted shape for branching on requireAdmin()'s `string | null`
 * result being falsy: a bare negation (`!X`), an explicit null check in
 * either operand order and either equality strictness, and an explicit
 * undefined check. Each form captures the branched identifier and the
 * remaining `if (...) <rest>` text the same way, so the caller does not
 * need to know which form matched. The stricter `===` forms are listed
 * before the looser `==` form for readability, though in practice the
 * `==` form cannot accidentally match a `===` expression: consuming the
 * first two of three `=` characters always leaves a stray `=` that fails
 * the following `\s*null` requirement.
 */
const IF_FALSY_BRANCH_FORMS: RegExp[] = [
  /^if\s*\(\s*!\s*([A-Za-z0-9_$]+)\s*\)\s*(.*)$/,
  /^if\s*\(\s*([A-Za-z0-9_$]+)\s*===\s*null\s*\)\s*(.*)$/,
  /^if\s*\(\s*null\s*===\s*([A-Za-z0-9_$]+)\s*\)\s*(.*)$/,
  /^if\s*\(\s*([A-Za-z0-9_$]+)\s*===\s*undefined\s*\)\s*(.*)$/,
  /^if\s*\(\s*([A-Za-z0-9_$]+)\s*==\s*null\s*\)\s*(.*)$/,
];

interface FalsyBranchMatch {
  identifier: string;
  rest: string;
}

/** Tries `statement` against every form in IF_FALSY_BRANCH_FORMS in order
 * and returns the branched identifier plus the remaining then-text from
 * the first one that matches, or null when none of them do. */
function matchFalsyBranch(statement: string): FalsyBranchMatch | null {
  for (const form of IF_FALSY_BRANCH_FORMS) {
    const m = form.exec(statement);
    if (m) return { identifier: m[1], rest: m[2] };
  }
  return null;
}

/** Human-readable list of the accepted falsy-branch forms for `identifier`,
 * embedded in a failure message so a real non-compliant file's failure
 * tells the reader exactly what would have been accepted. */
function describeAcceptedFalsyForms(identifier: string): string {
  return (
    `accepted forms: !${identifier}, ${identifier} === null, null === ${identifier}, ` +
    `${identifier} === undefined, ${identifier} == null`
  );
}

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
  const falsyMatch = matchFalsyBranch(second);

  if (!falsyMatch) {
    return (
      `${label}: exported server action '${name}' assigns requireAdmin()'s result to '${identifier}' ` +
      `but its second statement does not immediately branch on '${identifier}' being falsy ` +
      `(${describeAcceptedFalsyForms(identifier)})`
    );
  }

  const { identifier: branchedIdentifier, rest: rawThen } = falsyMatch;
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

interface StrippedSource {
  /** `source` with every `//` and `/* *\/` comment blanked to whitespace
   * (newlines preserved, so line-based reasoning elsewhere stays valid).
   * String literal delimiters and interiors are left byte-for-byte
   * intact - only `inString` records which of those characters are
   * inside one, so callers that legitimately need a string's content
   * (an import's module path) can still read it. */
  text: string;
  /** Parallel to `text`: true for every index that lies strictly inside a
   * string literal's interior, exactly as a real JS lexer would see it -
   * so a decoy written as a JS string VALUE (e.g. a fake import statement
   * or a fake local declaration embedded in a quoted string) is
   * distinguishable from the same text appearing as real top-level code.
   * The opening/closing quote characters themselves are `false`: they are
   * real syntax, not part of the string's content. */
  inString: boolean[];
}

/**
 * Single left-to-right walk over `source` that both strips comments and
 * masks string-literal interiors in one pass - doing these as two
 * sequential passes is a known trap (a `//` inside a string can eat real
 * code if comments are stripped first; a decoy inside a comment can eat a
 * later string boundary if strings are masked first). Handles `'`, `"`,
 * and `` ` `` string literals (backtick strings may span lines; the other
 * two are treated as closed at an unescaped newline, since neither is
 * legitimately multi-line) with backslash-escape awareness, and `//` /
 * `/* *\/` comments, with comment recognition suspended while inside a
 * string so a URL-shaped string content is never mistaken for a comment.
 */
function stripCommentsAndMaskStrings(source: string): StrippedSource {
  const chars: string[] = [];
  const inString: boolean[] = [];
  let quote: string | null = null;
  let i = 0;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (quote) {
      if (ch === "\\" && next !== undefined) {
        chars.push(ch, next);
        inString.push(true, true);
        i += 2;
        continue;
      }
      if (ch === quote) {
        chars.push(ch);
        inString.push(false);
        quote = null;
        i++;
        continue;
      }
      if (quote !== "`" && ch === "\n") {
        // Single/double-quoted strings cannot legitimately span a
        // newline - treat one as closed rather than let a stray quote
        // swallow the rest of the file.
        quote = null;
        chars.push(ch);
        inString.push(false);
        i++;
        continue;
      }
      chars.push(ch);
      inString.push(true);
      i++;
      continue;
    }

    if (ch === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") {
        chars.push(" ");
        inString.push(false);
        i++;
      }
      continue;
    }

    if (ch === "/" && next === "*") {
      chars.push(" ", " ");
      inString.push(false, false);
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
        chars.push(source[i] === "\n" ? "\n" : " ");
        inString.push(false);
        i++;
      }
      if (i < source.length) {
        chars.push(" ", " ");
        inString.push(false, false);
        i += 2;
      }
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      chars.push(ch);
      inString.push(false);
      i++;
      continue;
    }

    chars.push(ch);
    inString.push(false);
    i++;
  }

  return { text: chars.join(""), inString };
}

/** True when requireAdmin is imported (by that exact local name) from the
 * real auth module - `@/lib/admin/auth` or a relative path ending the same
 * way. Deliberately does not support a renamed/aliased import: this repo's
 * real actions files never alias it, and supporting aliasing would widen
 * the guard to accommodate a form nothing in the tree uses. Runs on the
 * comment-and-string-masked source so a decoy import statement sitting in
 * a comment or inside a JS string value cannot manufacture a false pass
 * for a file whose only REAL import is a look-alike module. */
function requireAdminImportedFromAuthModule(source: string): boolean {
  const { text, inString } = stripCommentsAndMaskStrings(source);
  const importRe = /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]*)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(text)) !== null) {
    if (inString[m.index]) continue;
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
 * is called - not what it actually does. Runs on the comment-and-string-
 * masked source so a decoy declaration sitting in a comment or inside a
 * JS string value cannot manufacture a false failure against an otherwise
 * compliant file. */
function requireAdminLocallyRedeclared(source: string): boolean {
  const { text, inString } = stripCommentsAndMaskStrings(source);
  const re = /\b(?:const|let|var|function)\s+requireAdmin\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (!inString[m.index]) return true;
  }
  return false;
}

const EXPORT_KEYWORD_RE = /\bexport\b(?!\s+(?:type|interface)\b)/g;

/**
 * Counts real top-level `export` keywords in `source` (excluding
 * `export type`/`export interface`, which are compile-time-only and carry
 * no runtime action to gate), ignoring anything inside a comment or a
 * string literal. `extractExportedAsyncFunctions` only recognises three
 * header shapes; an export in some OTHER shape - `export default async
 * function`, a generic `<T>` function, `export let`, or an `export { name
 * }` list - never matches any of those three regexes at all, so it would
 * otherwise be invisible to both `functions` and `unparsable` and get
 * silently skipped as long as at least one other export in the file did
 * parse. Comparing this count against the number of recognised headers is
 * how that class of export gets caught.
 */
function countRealExportKeywords(source: string): number {
  const { text, inString } = stripCommentsAndMaskStrings(source);
  const re = new RegExp(EXPORT_KEYWORD_RE.source, EXPORT_KEYWORD_RE.flags);
  let count = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (!inString[m.index]) count++;
  }
  return count;
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
  } else {
    const recognisedCount = functions.length + unparsable.length;
    const totalExportCount = countRealExportKeywords(source);
    if (totalExportCount > recognisedCount) {
      const unrecognisedCount = totalExportCount - recognisedCount;
      failures.push(
        `${label}: ${unrecognisedCount} export(s) could not be parsed as server actions; every export ` +
          `in a 'use server' file must be a parseable async function`,
      );
    }
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

  describe("provenance checks ignore comments and string literals (round 4 fix)", () => {
    describe("defeats fixed: a decoy that used to manufacture a false PASS", () => {
      it("RED: a commented-out real import must not count - the only REAL import is the look-alike", () => {
        const source = `
'use server';

import { requireAdmin } from './my-fake-auth';
// import { requireAdmin } from '@/lib/admin/auth';

export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
}
`;
        const result = checkServerActionsGating(source, "fixture/actions.ts");
        expect(result.ok).toBe(false);
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]).toContain("is not imported from '@/lib/admin/auth'");
      });

      it("RED: the same real-import text embedded inside a JS string value must not count either, and fails for the SAME reason", () => {
        const commentedSource = `
'use server';

import { requireAdmin } from './my-fake-auth';
// import { requireAdmin } from '@/lib/admin/auth';

export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
}
`;
        const stringLiteralSource = `
'use server';

import { requireAdmin } from './my-fake-auth';
const decoy = "import { requireAdmin } from '@/lib/admin/auth';";

export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'), decoy);
}
`;
        const commentedResult = checkServerActionsGating(commentedSource, "fixture/actions.ts");
        const stringLiteralResult = checkServerActionsGating(stringLiteralSource, "fixture/actions.ts");

        expect(stringLiteralResult.ok).toBe(false);
        expect(stringLiteralResult.failures).toHaveLength(1);
        expect(stringLiteralResult.failures[0]).toContain("is not imported from '@/lib/admin/auth'");

        // "RED same": both decoy shapes (comment vs. string literal) must
        // produce the IDENTICAL reason, not merely both fail.
        expect(commentedResult.failures).toEqual(stringLiteralResult.failures);
      });
    });

    describe("false alarms fixed: a decoy that used to manufacture a false FAIL", () => {
      it("GREEN: a compliant file with the old declaration phrase commented out", () => {
        const source = `
'use server';

${AUTH_IMPORT}
// const requireAdmin = someOldShim;

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

      it("GREEN: a compliant file with the old declaration phrase inside a JS string value", () => {
        const source = `
'use server';

${AUTH_IMPORT}
const note = "const requireAdmin = someOldShim;";

export async function safeAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'), note);
}
`;
        const result = checkServerActionsGating(source, "fixture/actions.ts");
        expect(result.ok).toBe(true);
        expect(result.failures).toEqual([]);
      });

      it("GREEN: a compliant file with the old declaration phrase inside a JSDoc block", () => {
        const source = `
'use server';

${AUTH_IMPORT}

/**
 * Historical note: this file used to declare its own
 * const requireAdmin = someOldShim; before it was fixed to import the
 * real gate.
 */
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
    });
  });

  describe("additional falsy-branch forms for requireAdmin()'s string | null result (round 4 fix) - [A6]", () => {
    describe("compliant shapes (GREEN)", () => {
      it.each([
        ["!userId", "if (!userId) return;"],
        ["userId === null", "if (userId === null) return;"],
        ["null === userId", "if (null === userId) return;"],
        ["userId === undefined", "if (userId === undefined) return;"],
        ["userId == null", "if (userId == null) return;"],
      ])("passes when the second statement is '%s'", (_formName, ifStatement) => {
        const source = `
'use server';

${AUTH_IMPORT}

export async function safeAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  ${ifStatement}
  console.log(formData.get('value'));
}
`;
        const result = checkServerActionsGating(source, "fixture/actions.ts");
        expect(result.ok).toBe(true);
        expect(result.failures).toEqual([]);
      });
    });

    describe("rejected shapes (RED): a real-looking but wrong comparison", () => {
      it("flags a comparison against a truthy literal, not a falsy check at all", () => {
        const source = `
'use server';

${AUTH_IMPORT}

export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (userId === 'admin') return;
  console.log(formData.get('value'));
}
`;
        const result = checkServerActionsGating(source, "fixture/actions.ts");
        expect(result.ok).toBe(false);
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]).toContain("does not immediately branch on 'userId' being falsy");
        expect(result.failures[0]).toContain("accepted forms");
        expect(result.failures[0]).toContain("userId === null");
      });

      it("flags an INVERTED null check that exits when the user IS authenticated", () => {
        const source = `
'use server';

${AUTH_IMPORT}

export async function riskyAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (userId !== null) return;
  console.log(formData.get('value'));
}
`;
        const result = checkServerActionsGating(source, "fixture/actions.ts");
        expect(result.ok).toBe(false);
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]).toContain("does not immediately branch on 'userId' being falsy");
        expect(result.failures[0]).toContain("accepted forms");
      });
    });
  });

  describe("an export shape none of the three headers recognise is not silently skipped (round 4 fix) - [A7]", () => {
    it.each([
      [
        "export default async function",
        `
export default async function unnamedAction(formData: FormData): Promise<void> {
  console.log(formData.get('value'));
}
`,
      ],
      [
        "a generic <T> function",
        `
export async function genericAction<T>(formData: FormData): Promise<T> {
  return undefined as unknown as T;
}
`,
      ],
      [
        "export let arrow",
        `
export let riskyLetAction = async (formData: FormData): Promise<void> => {
  console.log(formData.get('value'));
};
`,
      ],
      [
        "export { name } list",
        `
async function riskyAction(formData: FormData): Promise<void> {
  console.log(formData.get('value'));
}
export { riskyAction };
`,
      ],
    ])("flags '%s' alongside a gated export with a distinct, count-naming reason", (_shapeName, unrecognisedExport) => {
      const source = `
'use server';

${AUTH_IMPORT}

export async function safeAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return;
  console.log(formData.get('value'));
}
${unrecognisedExport}`;
      const result = checkServerActionsGating(source, "fixture/actions.ts");
      expect(result.ok).toBe(false);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0]).toContain("1 export(s) could not be parsed as server actions");
      expect(result.failures[0]).toContain("every export in a 'use server' file must be a parseable async function");
    });

    it("does not flag either real actions file: every export in both already matches a recognised header", () => {
      const moderationSource = fs.readFileSync(
        path.join(APP_ROOT, "admin", "moderation", "actions.ts"),
        "utf8",
      );
      const referralsSource = fs.readFileSync(
        path.join(APP_ROOT, "admin", "referrals", "actions.ts"),
        "utf8",
      );

      // Confirms the premise the GREEN result below rests on: neither file
      // has an `export type`/`export interface` (excluded from the count
      // on purpose) or any OTHER export shape this check would need to
      // special-case - every `export` keyword in both files is already one
      // of the two `export async function` declarations the guard parses.
      expect(countRealExportKeywords(moderationSource)).toBe(2);
      expect(countRealExportKeywords(referralsSource)).toBe(2);

      expect(checkServerActionsGating(moderationSource, "admin/moderation/actions.ts").ok).toBe(true);
      expect(checkServerActionsGating(referralsSource, "admin/referrals/actions.ts").ok).toBe(true);
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

      // Compare the REASON, not the whole message: every message here is
      // prefixed with `fixture/<label>: `, and two fixtures with genuinely
      // identical reasons must not read as "distinct" just because their
      // labels differ - that would make this test unable to ever fail.
      const reasons = allMessages.map(stripFixtureLabel);
      expect(reasons.length).toBe(new Set(reasons).size);
    });

    it("[A5] the distinctness check itself goes RED on a genuine collision, not merely on differing labels", () => {
      // Two failure messages with the SAME underlying reason but DIFFERENT
      // fixture labels - exactly the shape a whole-message Set comparison
      // could never catch, since the label prefix alone made every entry
      // unique. Demonstrates the label-stripped comparison actually
      // detects this: after stripping, the two reasons collapse to one
      // distinct value, so `reasons.length !== distinctReasons.size`.
      const collidingMessages = [
        "fixture/label-one: exported server action 'riskyAction' does not call requireAdmin() as its first statement",
        "fixture/label-two: exported server action 'riskyAction' does not call requireAdmin() as its first statement",
      ];

      // Sanity check on the OLD (broken) comparison: the whole messages
      // are still distinct because their labels differ, which is exactly
      // why comparing whole messages could never have caught this.
      expect(new Set(collidingMessages).size).toBe(collidingMessages.length);

      const reasons = collidingMessages.map(stripFixtureLabel);
      expect(reasons.length).not.toBe(new Set(reasons).size);
      expect(new Set(reasons).size).toBe(1);
    });
  });
});
