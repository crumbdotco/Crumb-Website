/**
 * Static-analysis guard (Crumb-Website#18): every console.* argument in
 * non-test source that carries an error must go through redactForLog
 * (src/lib/redact-log.ts). Supabase errors on email-keyed tables echo the
 * address, and Vercel logs have a wider audience than customer emails
 * should reach.
 *
 * FLAGGED argument shapes (walked through templates, spreads, object and
 * array literals, conditionals, binary expressions, casts and non-redact
 * calls):
 *   - a caught variable (catch clause binding) or any identifier named
 *     like an error (err, error, e, fooErr, fooError, reason, exception,
 *     cause), bare, in a `{ error }` shorthand, in `${err}`, or spread
 *   - a `.message`, `.details`, `.hint`, `.stack` or `.cause` property access
 *   - a property access whose own name looks like an error (`result.error`)
 * PASSING: `redactForLog(...)` (never inspected further), string literals,
 * numbers, and property reads such as `error.code` / `status`.
 * Comments are never counted (AST based).
 *
 * RATCHET: ALLOWLIST holds sites another unmerged branch rewrites. An entry
 * that no longer matches a violation FAILS the suite, so the list is cleaned
 * the moment the rewrite lands.
 */

import { readFileSync, readdirSync } from "fs";
import path from "path";
import ts from "typescript";

const SRC_ROOT = path.resolve(__dirname, "..", "..");
const ERROR_NAME_RE = /^(e|err|error|exception|reason|cause|.*Err|.*Error)$/;
const UNSAFE_PROPS = new Set(["message", "details", "hint", "stack", "cause"]);
const HELPER = "redactForLog";

type Violation = { readonly message: string; readonly text: string };
type Found = { file: string; key: string; message: string };

function collectCaughtNames(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isCatchClause(node) && node.variableDeclaration) {
      const name = node.variableDeclaration.name;
      if (ts.isIdentifier(name)) names.add(name.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return names;
}

function isConsoleCall(node: ts.CallExpression): boolean {
  const callee = node.expression;
  return (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === "console"
  );
}

function describeName(name: string, caught: Set<string>): string | null {
  if (caught.has(name)) return `caught variable "${name}" logged unredacted`;
  if (ERROR_NAME_RE.test(name)) return `error-named value "${name}" logged unredacted`;
  return null;
}

function describeAccess(node: ts.PropertyAccessExpression): string | null {
  const prop = node.name.text;
  if (UNSAFE_PROPS.has(prop)) return `".${prop}" of a value logged unredacted`;
  if (ERROR_NAME_RE.test(prop)) return `error-named property ".${prop}" logged unredacted`;
  return null;
}

function firstOf(nodes: ReadonlyArray<ts.Node>, caught: Set<string>): string | null {
  for (const n of nodes) {
    const found = inspect(n, caught);
    if (found) return found;
  }
  return null;
}

function inspectCall(node: ts.CallExpression, caught: Set<string>): string | null {
  if (ts.isIdentifier(node.expression) && node.expression.text === HELPER) return null;
  const own = ts.isPropertyAccessExpression(node.expression)
    ? inspect(node.expression.expression, caught)
    : null;
  return own ?? firstOf(node.arguments, caught);
}

function inspect(node: ts.Node, caught: Set<string>): string | null {
  if (ts.isCallExpression(node)) return inspectCall(node, caught);
  if (ts.isIdentifier(node)) return describeName(node.text, caught);
  if (ts.isPropertyAccessExpression(node)) return describeAccess(node);
  if (ts.isShorthandPropertyAssignment(node)) return describeName(node.name.text, caught);
  if (ts.isPropertyAssignment(node)) return inspect(node.initializer, caught);
  if (ts.isSpreadAssignment(node) || ts.isSpreadElement(node)) return inspect(node.expression, caught);
  if (ts.isObjectLiteralExpression(node)) return firstOf(node.properties, caught);
  if (ts.isArrayLiteralExpression(node)) return firstOf(node.elements, caught);
  if (ts.isTemplateExpression(node)) return firstOf(node.templateSpans.map((s) => s.expression), caught);
  if (ts.isConditionalExpression(node)) {
    return firstOf([node.condition, node.whenTrue, node.whenFalse], caught);
  }
  if (ts.isBinaryExpression(node)) return firstOf([node.left, node.right], caught);
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isAwaitExpression(node)
  ) {
    return inspect(node.expression, caught);
  }
  return null;
}

/** First string literal argument: the stable key used by the allowlist. */
function callKey(call: ts.CallExpression): string {
  const first = call.arguments.find(
    (a): a is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral =>
      ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a),
  );
  return first ? first.text : "";
}

function findViolations(source: string, fileName = "fixture.ts"): Violation[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const caught = collectCaughtNames(sf);
  const out: Violation[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && isConsoleCall(node)) {
      const found = firstOf(node.arguments, caught);
      if (found) out.push({ message: found, text: callKey(node) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : walk(full);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name) ? [full] : [];
  });
}

const REASON = "rewritten by #20 (Crumb-Website PR pending); remove when #20 merges";
const ALLOWLIST: ReadonlyArray<{ file: string; key: string; reason: string }> = [
  { file: "app/api/stripe/webhook/route.ts", key: "Founding cap check failed:", reason: REASON },
  {
    file: "app/api/waitlist/founding/route.ts",
    key: "Founding availability unavailable: waitlist count read failed:",
    reason: REASON,
  },
  {
    file: "app/api/waitlist/founding/route.ts",
    key: "Founding availability degraded: cap unavailable:",
    reason: REASON,
  },
];

function scanTree(root: string): Found[] {
  return walk(root).flatMap((full) => {
    const rel = path.relative(root, full).split(path.sep).join("/");
    return findViolations(readFileSync(full, "utf8"), rel).map((v) => ({
      file: rel,
      key: v.text,
      message: v.message,
    }));
  });
}

function applyAllowlist(
  found: ReadonlyArray<Found>,
  allow: ReadonlyArray<{ file: string; key: string }>,
): { unallowed: string[]; stale: string[] } {
  const isAllowed = (f: Found) => allow.some((a) => a.file === f.file && a.key === f.key);
  return {
    unallowed: found
      .filter((f) => !isAllowed(f))
      .map((f) => `${f.file}: ${f.message} (call "${f.key}")`),
    stale: allow
      .filter((a) => !found.some((f) => f.file === a.file && f.key === a.key))
      .map((a) => `${a.file}: "${a.key}"`),
  };
}

const wrap = (body: string) =>
  `function f(){ try { g(); } catch (err) { ${body} } }`;

describe("log redaction guard: fixtures flag offending shapes", () => {
  it.each([
    ["bare caught variable", wrap(`console.error("x", err);`), 'caught variable "err" logged unredacted'],
    ["bare error-named value", `function f(error: unknown){ console.error("x", error); }`, 'error-named value "error" logged unredacted'],
    ["error.message", `function f(error: {message:string}){ console.error("x", error.message); }`, '".message" of a value logged unredacted'],
    ["error.details", `console.error("x", res.details);`, '".details" of a value logged unredacted'],
    ["error.hint", `console.warn("x", res.hint);`, '".hint" of a value logged unredacted'],
    ["shorthand { error }", `function f(error: unknown){ console.error("x", { error }); }`, 'error-named value "error" logged unredacted'],
    ["named property in object", `console.error("x", { detail: res.error });`, 'error-named property ".error" logged unredacted'],
    ["template literal", wrap("console.error(`bad ${err}`);"), 'caught variable "err" logged unredacted'],
    ["spread", wrap(`console.error("x", ...[err]);`), 'caught variable "err" logged unredacted'],
    ["conditional message", wrap(`console.error("x", err instanceof Error ? err.message : "unknown");`), 'caught variable "err" logged unredacted'],
    ["caught variable with a non-error name", `try { g(); } catch (boom) { console.log(boom); }`, 'caught variable "boom" logged unredacted'],
    ["wrapped in a non-redact call", wrap(`console.error("x", String(err));`), 'caught variable "err" logged unredacted'],
    ["method call on error", wrap(`console.error("x", err.toString());`), 'caught variable "err" logged unredacted'],
    ["string concatenation", wrap(`console.error("x" + err);`), 'caught variable "err" logged unredacted'],
    ["cast", wrap(`console.error("x", err as Error);`), 'caught variable "err" logged unredacted'],
  ])("flags %s", (_name, source, message) => {
    const violations = findViolations(source);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toBe(message);
  });

  it("gives distinct messages for the distinct failure shapes", () => {
    const messages = [
      findViolations(wrap(`console.error(err);`))[0].message,
      findViolations(`console.error(res.message);`)[0].message,
      findViolations(`console.error(res.details);`)[0].message,
      findViolations(`console.error(res.error);`)[0].message,
    ];
    expect(new Set(messages).size).toBe(messages.length);
  });
});

describe("log redaction guard: fixtures pass innocent shapes", () => {
  it.each([
    ["redactForLog(err)", wrap(`console.error("x", redactForLog(err));`)],
    ["redactForLog(error.message)", `function f(error: {message:string}){ console.error("x", redactForLog(error.message)); }`],
    ["redacted inside an object", wrap(`console.error("x", { reason: redactForLog(err) });`)],
    ["fixed strings", `console.error("Founding availability unavailable");`],
    ["status and code reads", `function f(error: {code:string}, status: number){ console.error("x", { status, code: error.code }); }`],
    ["numbers and identifiers", `console.warn("x", paymentId, event.type, 5);`],
    ["a comment mentioning err.message", `// console.error(err.message)\n/* console.error(err) */\nconsole.info("ok");`],
    ["non-console calls", wrap(`logger.error(err); handle(err.message);`)],
    ["template without errors", "console.error(`count ${count} of ${total}`);"],
    ["a string literal that says err", `console.error("err", 'error.message');`],
    ["a function reference argument", `console.error("x", () => 1);`],
  ])("passes %s", (_name, source) => {
    expect(findViolations(source)).toEqual([]);
  });
});

describe("log redaction guard: allowlist ratchet", () => {
  const found = [{ file: "a.ts", key: "K", message: "m" }];

  it("reports an unallowed violation", () => {
    expect(applyAllowlist(found, []).unallowed).toEqual(['a.ts: m (call "K")']);
  });

  it("accepts an allowlisted violation", () => {
    expect(applyAllowlist(found, [{ file: "a.ts", key: "K" }])).toEqual({ unallowed: [], stale: [] });
  });

  it("FAILS on a stale allowlist entry with no matching violation", () => {
    expect(applyAllowlist([], [{ file: "a.ts", key: "K" }]).stale).toEqual(['a.ts: "K"']);
  });

  it("keys an unlabelled call with an empty key", () => {
    expect(findViolations(wrap("console.error(err);"))[0].text).toBe("");
  });
});

describe("log redaction guard: real tree", () => {
  const found = scanTree(SRC_ROOT);
  const { unallowed, stale } = applyAllowlist(found, ALLOWLIST);

  it("has no console argument carrying an unredacted error", () => {
    expect(unallowed).toEqual([]);
  });

  it("has no stale allowlist entries (remove them once #20 merges)", () => {
    expect(stale).toEqual([]);
  });

  it("scans the real source files", () => {
    expect(walk(SRC_ROOT).length).toBeGreaterThan(20);
  });
});
