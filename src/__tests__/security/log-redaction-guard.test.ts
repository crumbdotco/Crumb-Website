/**
 * Static-analysis guard (Crumb-Website#18): every console.* argument in
 * non-test source that carries an error must go through redactForLog
 * (src/lib/redact-log.ts, imported from that module). Supabase errors on
 * email-keyed tables echo the address, and Vercel logs have a wider audience
 * than customer emails should reach.
 *
 * A console call is: console.x(...), console["x"](...), globalThis.console.x,
 * window/self/global.console.x, an alias (`const log = console.error`,
 * `const c = console`, `const { error: logE } = console`, `.bind(console)`),
 * and any of those through .call / .apply.
 *
 * TAINTED names (per function scope, followed to a fixpoint):
 *   - every name bound by a catch clause, including destructured ones
 *   - every parameter of a `.catch(cb)` / `.then(_, cb)` callback
 *   - a local const/let/var, or an assignment target, whose initializer would
 *     itself be flagged (`const message = err.message`), and a destructured
 *     name whose property is error-named (`const { error: dbFail } = ...`)
 *   - a same-file function parameter that a call site feeds a flagged
 *     argument (a forwarding helper is flagged at its own console call)
 *
 * FLAGGED argument shapes (walked through templates, spreads, object and
 * array literals, conditionals, binary expressions, casts, `satisfies`,
 * `<T>x`, `new X(...)` and non-redact calls):
 *   - a tainted name, or any identifier named like an error (err, error, e,
 *     fooErr, fooError, reason, exception, cause), bare, in a `{ error }`
 *     shorthand, in `${err}`, or spread
 *   - a `.message`, `.details`, `.hint`, `.stack` or `.cause` access, dotted
 *     or as `x["message"]`
 *   - a property access whose own name looks like an error (`result.error`)
 * PASSING: `redactForLog(...)` (never inspected further; only counts when the
 * name is imported from src/lib/redact-log and not redeclared in the file),
 * string literals, numbers, and property reads such as `error.code`.
 * Comments are never counted (AST based).
 *
 * A call to a same-file function is flagged only when one of that function's
 * return expressions is (its parameters are tainted by call sites instead).
 *
 * KNOWN LIMITS (logged in implementation-notes.md): a `.catch(namedFn)` with
 * an identifier callback, aliasing through object properties, and secrets that
 * are not errors (Bearer tokens, JWTs) are not tracked.
 *
 * RATCHET: ALLOWLIST holds sites another unmerged branch rewrites. An entry
 * that no longer matches a violation FAILS the suite, so the list is cleaned
 * the moment the rewrite lands. Entries match file + first string literal of
 * the call (not a count).
 */

import { readFileSync, readdirSync } from "fs";
import path from "path";
import ts from "typescript";

const SRC_ROOT = path.resolve(__dirname, "..", "..");
const ERROR_NAME_RE = /^(e|err|error|exception|reason|cause|.*Err|.*Error)$/;
const UNSAFE_PROPS = new Set(["message", "details", "hint", "stack", "cause"]);
const HELPER = "redactForLog";
const HELPER_MODULE_RE = /(^|\/)redact-log$/;
const GLOBAL_OBJECTS = new Set(["globalThis", "window", "self", "global"]);
const ASSIGN_OPS = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
]);

type Violation = { readonly message: string; readonly text: string };
type Found = { file: string; key: string; message: string };
type Kind = "caught" | "derived" | "param";
type FnLike = ts.FunctionLikeDeclaration;

interface Ctx {
  readonly taint: Map<ts.Node, Map<string, Kind>>;
  readonly helperNames: Set<string>;
  readonly consoleFns: Set<string>;
  readonly consoleObjs: Set<string>;
  readonly functions: Map<string, FnLike>;
  readonly inFlight: Set<FnLike>;
  changed: boolean;
}

function boundNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((el) => (ts.isOmittedExpression(el) ? [] : boundNames(el.name)));
}

const isScopeNode = (n: ts.Node): boolean =>
  ts.isFunctionLike(n) || ts.isCatchClause(n) || ts.isSourceFile(n);

/** Nearest function or file: where a declaration's name lives. */
function fnScopeOf(node: ts.Node): ts.Node {
  let p: ts.Node = node.parent;
  while (!ts.isSourceFile(p) && !ts.isFunctionLike(p)) p = p.parent;
  return p;
}

function lookup(name: string, at: ts.Node, ctx: Ctx): Kind | undefined {
  for (let n: ts.Node | undefined = at; n; n = n.parent) {
    if (isScopeNode(n)) {
      const kind = ctx.taint.get(n)?.get(name);
      if (kind) return kind;
    }
  }
  return undefined;
}

function addTaint(ctx: Ctx, scope: ts.Node, name: string, kind: Kind): void {
  const names = ctx.taint.get(scope) ?? new Map<string, Kind>();
  if (!names.has(name)) {
    names.set(name, kind);
    ctx.taint.set(scope, names);
    ctx.changed = true;
  }
}

function addTo(set: Set<string>, name: string, ctx: Ctx): void {
  if (!set.has(name)) {
    set.add(name);
    ctx.changed = true;
  }
}

const unwrap = (e: ts.Expression): ts.Expression =>
  ts.isParenthesizedExpression(e) || ts.isNonNullExpression(e) ? unwrap(e.expression) : e;

function isConsoleObj(raw: ts.Expression, ctx: Ctx): boolean {
  const e = unwrap(raw);
  if (ts.isIdentifier(e)) return e.text === "console" || ctx.consoleObjs.has(e.text);
  return (
    ts.isPropertyAccessExpression(e) &&
    e.name.text === "console" &&
    ts.isIdentifier(e.expression) &&
    GLOBAL_OBJECTS.has(e.expression.text)
  );
}

function isConsoleFn(raw: ts.Expression, ctx: Ctx): boolean {
  const e = unwrap(raw);
  if (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) {
    return isConsoleObj(e.expression, ctx);
  }
  if (ts.isIdentifier(e)) return ctx.consoleFns.has(e.text);
  return (
    ts.isCallExpression(e) &&
    ts.isPropertyAccessExpression(e.expression) &&
    e.expression.name.text === "bind" &&
    isConsoleFn(e.expression.expression, ctx)
  );
}

function isConsoleCall(node: ts.CallExpression, ctx: Ctx): boolean {
  const callee = node.expression;
  if (isConsoleFn(callee, ctx)) return true;
  return (
    ts.isPropertyAccessExpression(callee) &&
    (callee.name.text === "call" || callee.name.text === "apply") &&
    isConsoleFn(callee.expression, ctx)
  );
}

function describeName(name: string, at: ts.Node, ctx: Ctx): string | null {
  const kind = lookup(name, at, ctx);
  if (kind === "caught") return `caught variable "${name}" logged unredacted`;
  if (kind === "derived") return `local "${name}" derived from an error logged unredacted`;
  if (kind === "param") return `parameter "${name}" receives an error at a call site and is logged unredacted`;
  if (ERROR_NAME_RE.test(name)) return `error-named value "${name}" logged unredacted`;
  return null;
}

function describeProp(prop: string): string | null {
  if (UNSAFE_PROPS.has(prop)) return `".${prop}" of a value logged unredacted`;
  if (ERROR_NAME_RE.test(prop)) return `error-named property ".${prop}" logged unredacted`;
  return null;
}

function firstOf(nodes: ReadonlyArray<ts.Node>, ctx: Ctx): string | null {
  for (const n of nodes) {
    const found = inspect(n, ctx);
    if (found) return found;
  }
  return null;
}

function returnExpressions(fn: FnLike): ts.Expression[] {
  if (!fn.body) return [];
  if (!ts.isBlock(fn.body)) return [fn.body];
  const out: ts.Expression[] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isReturnStatement(n) && n.expression) out.push(n.expression);
    if (!ts.isFunctionLike(n)) ts.forEachChild(n, visit);
  };
  fn.body.statements.forEach(visit);
  return out;
}

/** A same-file function taints its result only when a return expression is flagged. */
function inspectLocalCall(fn: FnLike, ctx: Ctx): string | null {
  if (ctx.inFlight.has(fn)) return null;
  ctx.inFlight.add(fn);
  const found = firstOf(returnExpressions(fn), ctx);
  ctx.inFlight.delete(fn);
  return found;
}

function inspectCall(node: ts.CallExpression, ctx: Ctx): string | null {
  const callee = node.expression;
  if (ts.isIdentifier(callee) && ctx.helperNames.has(callee.text)) return null;
  const local = ts.isIdentifier(callee) ? ctx.functions.get(callee.text) : undefined;
  if (local) return inspectLocalCall(local, ctx);
  const own =
    ts.isPropertyAccessExpression(callee) || ts.isElementAccessExpression(callee)
      ? inspect(callee.expression, ctx)
      : null;
  return own ?? firstOf(node.arguments, ctx);
}

function inspectAccess(node: ts.ElementAccessExpression, ctx: Ctx): string | null {
  const key = node.argumentExpression;
  if (ts.isStringLiteralLike(key)) return describeProp(key.text);
  return inspect(node.expression, ctx);
}

function inspect(node: ts.Node, ctx: Ctx): string | null {
  if (ts.isCallExpression(node)) return inspectCall(node, ctx);
  if (ts.isNewExpression(node)) return firstOf(node.arguments ?? [], ctx);
  if (ts.isIdentifier(node)) return describeName(node.text, node, ctx);
  if (ts.isPropertyAccessExpression(node)) return describeProp(node.name.text);
  if (ts.isElementAccessExpression(node)) return inspectAccess(node, ctx);
  if (ts.isShorthandPropertyAssignment(node)) return describeName(node.name.text, node, ctx);
  if (ts.isPropertyAssignment(node)) return inspect(node.initializer, ctx);
  if (ts.isSpreadAssignment(node) || ts.isSpreadElement(node)) return inspect(node.expression, ctx);
  if (ts.isObjectLiteralExpression(node)) return firstOf(node.properties, ctx);
  if (ts.isArrayLiteralExpression(node)) return firstOf(node.elements, ctx);
  if (ts.isTemplateExpression(node)) return firstOf(node.templateSpans.map((s) => s.expression), ctx);
  if (ts.isTaggedTemplateExpression(node)) return inspect(node.template, ctx);
  if (ts.isConditionalExpression(node)) {
    return firstOf([node.condition, node.whenTrue, node.whenFalse], ctx);
  }
  if (ts.isBinaryExpression(node)) return firstOf([node.left, node.right], ctx);
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isAwaitExpression(node)
  ) {
    return inspect(node.expression, ctx);
  }
  return null;
}

/** Names of redactForLog imported from the redact-log module and not redeclared in the file. */
function collectHelperNames(sf: ts.SourceFile): Set<string> {
  const imported = new Set<string>();
  const declared = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isImportSpecifier(node) && (node.propertyName ?? node.name).text === HELPER) {
      const spec = node.parent.parent.parent.moduleSpecifier;
      if (ts.isStringLiteral(spec) && HELPER_MODULE_RE.test(spec.text)) imported.add(node.name.text);
    }
    if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
      boundNames(node.name).forEach((n) => declared.add(n));
    }
    if (ts.isFunctionDeclaration(node) && node.name) declared.add(node.name.text);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return new Set([...imported].filter((n) => !declared.has(n)));
}

function collectFunctions(sf: ts.SourceFile): Map<string, FnLike> {
  const fns = new Map<string, FnLike>();
  const visit = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node) && node.name) fns.set(node.name.text, node);
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    ) {
      fns.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return fns;
}

function taintBindings(ctx: Ctx, scope: ts.Node, name: ts.BindingName, kind: Kind): void {
  boundNames(name).forEach((n) => addTaint(ctx, scope, n, kind));
}

function taintDeclaration(node: ts.VariableDeclaration, ctx: Ctx): void {
  const scope = fnScopeOf(node);
  if (ts.isObjectBindingPattern(node.name)) {
    for (const el of node.name.elements) {
      if (el.propertyName && ts.isIdentifier(el.propertyName) && ERROR_NAME_RE.test(el.propertyName.text)) {
        taintBindings(ctx, scope, el.name, "derived");
      }
    }
  }
  const init = node.initializer;
  if (!init) return;
  if (inspect(init, ctx)) taintBindings(ctx, scope, node.name, "derived");
  if (ts.isIdentifier(node.name)) {
    if (isConsoleFn(init, ctx)) addTo(ctx.consoleFns, node.name.text, ctx);
    if (isConsoleObj(init, ctx)) addTo(ctx.consoleObjs, node.name.text, ctx);
  } else if (ts.isObjectBindingPattern(node.name) && isConsoleObj(init, ctx)) {
    boundNames(node.name).forEach((n) => addTo(ctx.consoleFns, n, ctx));
  }
}

function taintCallbackParams(cb: ts.Expression | undefined, ctx: Ctx): void {
  if (cb && (ts.isArrowFunction(cb) || ts.isFunctionExpression(cb))) {
    cb.parameters.forEach((p) => taintBindings(ctx, cb, p.name, "caught"));
  }
}

/** Array iteration methods mapped to how many leading callback parameters carry data (index is not data). */
const ITERATION_PARAMS: ReadonlyMap<string, number> = new Map([
  ["forEach", 1], ["map", 1], ["filter", 1], ["some", 1], ["every", 1],
  ["find", 1], ["findLast", 1], ["flatMap", 1], ["reduce", 2], ["reduceRight", 2],
]);

/** `[err.message].forEach((k) => ...)`: the callback parameters carry the tainted receiver. */
function taintIterationCallback(
  callee: ts.PropertyAccessExpression,
  cb: ts.Expression | undefined,
  ctx: Ctx,
): void {
  const count = ITERATION_PARAMS.get(callee.name.text);
  if (!count || !cb || !(ts.isArrowFunction(cb) || ts.isFunctionExpression(cb))) return;
  if (!inspect(callee.expression, ctx)) return;
  cb.parameters.slice(0, count).forEach((p) => taintBindings(ctx, cb, p.name, "derived"));
}

function taintCall(node: ts.CallExpression, ctx: Ctx): void {
  const callee = node.expression;
  if (ts.isPropertyAccessExpression(callee)) {
    if (callee.name.text === "catch") taintCallbackParams(node.arguments[0], ctx);
    if (callee.name.text === "then") taintCallbackParams(node.arguments[1], ctx);
    taintIterationCallback(callee, node.arguments[0], ctx);
  }
  if (!ts.isIdentifier(callee) || ctx.helperNames.has(callee.text)) return;
  const fn = ctx.functions.get(callee.text);
  if (!fn) return;
  node.arguments.forEach((arg, i) => {
    const param = fn.parameters[i];
    if (param && inspect(arg, ctx)) taintBindings(ctx, fn, param.name, "param");
  });
}

/** `for (const k of [err.message])`: the loop variable carries the tainted expression. */
function taintLoopVariable(node: ts.ForOfStatement | ts.ForInStatement, ctx: Ctx): void {
  const init = node.initializer;
  if (ts.isVariableDeclarationList(init)) {
    init.declarations.forEach((d) => taintBindings(ctx, fnScopeOf(d), d.name, "derived"));
  } else if (ts.isIdentifier(init)) {
    addTaint(ctx, fnScopeOf(node), init.text, "derived");
  }
}

function taintNode(node: ts.Node, ctx: Ctx): void {
  if (ts.isCatchClause(node) && node.variableDeclaration) {
    taintBindings(ctx, node, node.variableDeclaration.name, "caught");
  }
  if (ts.isVariableDeclaration(node)) taintDeclaration(node, ctx);
  if ((ts.isForOfStatement(node) || ts.isForInStatement(node)) && inspect(node.expression, ctx)) {
    taintLoopVariable(node, ctx);
  }
  if (ts.isCallExpression(node)) taintCall(node, ctx);
  if (
    ts.isBinaryExpression(node) &&
    ASSIGN_OPS.has(node.operatorToken.kind) &&
    ts.isIdentifier(node.left) &&
    inspect(node.right, ctx)
  ) {
    addTaint(ctx, fnScopeOf(node), node.left.text, "derived");
  }
}

function buildContext(sf: ts.SourceFile): Ctx {
  const ctx: Ctx = {
    taint: new Map(),
    helperNames: collectHelperNames(sf),
    consoleFns: new Set(),
    consoleObjs: new Set(),
    functions: collectFunctions(sf),
    inFlight: new Set(),
    changed: true,
  };
  while (ctx.changed) {
    ctx.changed = false;
    const visit = (node: ts.Node): void => {
      taintNode(node, ctx);
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return ctx;
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
  const ctx = buildContext(sf);
  const out: Violation[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && isConsoleCall(node, ctx)) {
      const found = firstOf(node.arguments, ctx);
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

const ALLOWLIST: ReadonlyArray<{ file: string; key: string; reason: string }> = [];

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

const IMPORT = `import { redactForLog } from "@/lib/redact-log";\n`;
const wrap = (body: string) =>
  `${IMPORT}function f(){ try { g(); } catch (err) { ${body} } }`;
const withImport = (source: string) => `${IMPORT}${source}`;

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
    ["satisfies", wrap(`console.error("x", err satisfies unknown);`), 'caught variable "err" logged unredacted'],
    ["angle-bracket assertion", wrap(`console.error("x", <Error>err);`), 'caught variable "err" logged unredacted'],
    ["new Error(String(err))", wrap(`console.error("x", new Error(String(err)));`), 'caught variable "err" logged unredacted'],
    ["tagged template", wrap("console.error(String.raw`x ${err}`);"), 'caught variable "err" logged unredacted'],
    ["element access .message", wrap(`console.error("x", err["message"]);`), '".message" of a value logged unredacted'],
    ["element access of an error-named key", `console.error("x", res["error"]);`, 'error-named property ".error" logged unredacted'],
    ["destructured catch parameter", `try { g(); } catch ({ message }) { console.error("x", message); }`, 'caught variable "message" logged unredacted'],
    ["nested destructured catch parameter", `try { g(); } catch ({ a: { b } }) { console.error("x", b); }`, 'caught variable "b" logged unredacted'],
    ["promise .catch callback parameter", `p.catch((x) => console.error("x", x));`, 'caught variable "x" logged unredacted'],
    ["promise .then rejection callback", `p.then((ok) => ok, function (x) { console.error("x", x); });`, 'caught variable "x" logged unredacted'],
    ["local copy of err.message", wrap(`const msg = err.message; console.error("x", msg);`), 'local "msg" derived from an error logged unredacted'],
    ["reassigned local", wrap(`let m = ""; m = err.message; console.error("x", m);`), 'local "m" derived from an error logged unredacted'],
    ["for-of over a tainted array", wrap(`for (const k of [err.message]) console.error("x", k);`), 'local "k" derived from an error logged unredacted'],
    ["for-of over a tainted local", wrap(`const msgs = [err.message]; for (const k of msgs) console.error("x", k);`), 'local "k" derived from an error logged unredacted'],
    ["for-in over a tainted value", wrap(`for (const k in err) console.error("x", k);`), 'local "k" derived from an error logged unredacted'],
    ["forEach over a tainted array", wrap(`[err.message].forEach((k) => console.error("x", k));`), 'local "k" derived from an error logged unredacted'],
    ["map over a tainted array", wrap(`[err.message].map((k) => console.error("x", k));`), 'local "k" derived from an error logged unredacted'],
    ["reduce item over a tainted array", wrap(`[err.message].reduce((a, k) => { console.error("x", k); return a; }, "");`), 'local "k" derived from an error logged unredacted'],
    ["for-of into an existing variable", wrap(`let k = ""; for (k of [err.message]) console.error("x", k);`), 'local "k" derived from an error logged unredacted'],
    ["local of a local", wrap(`const a = err.message; const b = a; console.error("x", b);`), 'local "b" derived from an error logged unredacted'],
    ["destructured local of a tainted value", wrap(`const { message } = err; console.error("x", message);`), 'local "message" derived from an error logged unredacted'],
    ["renamed error destructure", `async function f(){ const { error: dbFail } = await q(); console.error("x", dbFail); }`, 'local "dbFail" derived from an error logged unredacted'],
    ["console[\"error\"]", wrap(`console["error"]("x", err);`), 'caught variable "err" logged unredacted'],
    ["console method alias", wrap(`const log = console.error; log("x", err);`), 'caught variable "err" logged unredacted'],
    ["console bind alias", wrap(`const log = console.error.bind(console); log("x", err);`), 'caught variable "err" logged unredacted'],
    ["console object alias", wrap(`const c = console; c.error("x", err);`), 'caught variable "err" logged unredacted'],
    ["destructured console alias", wrap(`const { warn: w } = console; w("x", err);`), 'caught variable "err" logged unredacted'],
    ["globalThis.console", wrap(`globalThis.console.error("x", err);`), 'caught variable "err" logged unredacted'],
    ["window.console", wrap(`window.console.warn("x", err);`), 'caught variable "err" logged unredacted'],
    ["console.error.call", wrap(`console.error.call(console, "x", err);`), 'caught variable "err" logged unredacted'],
    ["console.error.apply", wrap(`console.error.apply(console, ["x", err]);`), 'caught variable "err" logged unredacted'],
    [
      "forwarding helper (flagged at its console call)",
      `function logIt(x: unknown){ console.error("x", x); } function f(){ try { g(); } catch (err) { logIt(err); } }`,
      'parameter "x" receives an error at a call site and is logged unredacted',
    ],
    [
      "forwarding arrow helper",
      `const logIt = (x: unknown) => console.error("x", x); function f(error: unknown){ logIt(error.message); }`,
      'parameter "x" receives an error at a call site and is logged unredacted',
    ],
    [
      "same-file helper that returns the message",
      `function pick(x: {message: string}){ return x.message; } function f(){ try { g(); } catch (err) { const m = pick(err); console.error("x", m); } }`,
      'local "m" derived from an error logged unredacted',
    ],
    [
      "PERMANENT: pre-fix waitlist line",
      `async function f(){ const { error: insertError } = await q(); if (insertError) { const message = insertError.message ?? ""; console.error("Waitlist insert error:", message); } }`,
      'local "message" derived from an error logged unredacted',
    ],
    [
      "PERMANENT: pre-fix waitlist line, verbatim",
      `const message = insertError.message ?? ""; console.error("Waitlist insert error:", message);`,
      'local "message" derived from an error logged unredacted',
    ],
    [
      "locally shadowed redactForLog (no import)",
      `function f(){ try { g(); } catch (err) { const redactForLog = (v: unknown) => v; console.error("x", redactForLog(err)); } }`,
      'parameter "v" receives an error at a call site and is logged unredacted',
    ],
    [
      "redactForLog imported from somewhere else",
      `import { redactForLog } from "./other"; function f(){ try { g(); } catch (err) { console.error("x", redactForLog(err)); } }`,
      'caught variable "err" logged unredacted',
    ],
    [
      "imported redactForLog shadowed by a local declaration",
      `${IMPORT}function f(){ try { g(); } catch (err) { const redactForLog = (v: unknown) => v; console.error("x", redactForLog(err)); } }`,
      'parameter "v" receives an error at a call site and is logged unredacted',
    ],
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
      findViolations(wrap(`const m = err.message; console.error(m);`))[0].message,
      findViolations(`function l(x: unknown){ console.error(x); } l(res.error);`)[0].message,
    ];
    expect(new Set(messages).size).toBe(messages.length);
  });
});

describe("log redaction guard: fixtures pass innocent shapes", () => {
  it.each([
    ["redactForLog(err)", wrap(`console.error("x", redactForLog(err));`)],
    ["redactForLog(error.message)", withImport(`function f(error: {message:string}){ console.error("x", redactForLog(error.message)); }`)],
    ["redacted inside an object", wrap(`console.error("x", { reason: redactForLog(err) });`)],
    ["aliased import of the helper", `import { redactForLog as safe } from "@/lib/redact-log"; function f(){ try { g(); } catch (err) { console.error("x", safe(err)); } }`],
    ["relative import of the helper", `import { redactForLog } from "./redact-log"; function f(){ try { g(); } catch (err) { console.error("x", redactForLog(err)); } }`],
    ["fixed strings", `console.error("Founding availability unavailable");`],
    ["status and code reads", `function f(error: {code:string}, status: number){ console.error("x", { status, code: error.code }); }`],
    ["element access to a safe key", wrap(`console.error("x", err["code"]);`)],
    ["numbers and identifiers", `console.warn("x", paymentId, event.type, 5);`],
    ["a comment mentioning err.message", `// console.error(err.message)\n/* console.error(err) */\nconsole.info("ok");`],
    ["non-console calls", wrap(`logger.error(err); handle(err.message);`)],
    ["template without errors", "console.error(`count ${count} of ${total}`);"],
    ["a string literal that says err", `console.error("err", 'error.message');`],
    ["a function reference argument", `console.error("x", () => 1);`],
    ["a redacted local", wrap(`const msg = redactForLog(err); console.error("x", msg);`)],
    ["a local that is not derived from an error", `const message = "hello"; console.error("x", message);`],
    ["a status copied from an error", wrap(`const status = err.status; console.error("x", status);`)],
    ["a console alias with fixed text", `const log = console.error; log("fixed");`],
    ["a redacted destructured error", withImport(`async function f(){ const { error: dbFail } = await q(); console.error("x", redactForLog(dbFail)); }`)],
    ["a redacted destructured catch", withImport(`try { g(); } catch ({ message }) { console.error("x", redactForLog(message)); }`)],
    ["a redacted promise catch", withImport(`p.catch((x) => console.error("x", redactForLog(x)));`)],
    ["a promise catch that ignores the reason", `p.catch(() => null); p.then((v) => v, () => console.error("failed"));`],
    ["a helper that only receives fixed values", `function logIt(x: string){ console.error("x", x); } logIt("fixed");`],
    ["a helper that redacts its parameter", withImport(`function logIt(x: unknown){ console.error("x", redactForLog(x)); } function f(){ try { g(); } catch (err) { logIt(err); } }`)],
    ["a same-file helper that returns only a code", `function code(x: {code: string}){ return x.code; } function f(){ try { g(); } catch (err) { const c = code(err); console.error("x", c); } }`],
    ["forEach over a clean array", wrap(`["a", "b"].forEach((k) => console.error("x", k));`)],
    ["for-of over a clean array", wrap(`for (const k of ["a", "b"]) console.error("x", k);`)],
    ["a taint that stays in its own function", `function a(){ try { g(); } catch (err) { const m = err.message; h(m); } } function b(m: string){ console.error("x", m); }`],
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
