import { readFileSync, readdirSync } from "fs";
import path from "path";
import ts from "typescript";

const SRC_ROOT = path.resolve(__dirname, "..", "..");

function listSourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "__tests__") return [];
    const fullPath = path.join(root, entry.name);
    return entry.isDirectory()
      ? listSourceFiles(fullPath)
      : /\.(ts|tsx)$/.test(entry.name)
        ? [fullPath]
        : [];
  });
}

type CountRead = {
  node: ts.CallExpression;
  line: number;
  wrapped: boolean;
  inPromiseAll: boolean;
  headBeforeCount: boolean;
  binding: ts.ObjectBindingPattern | null;
  declarationEnd: number;
  detail: string;
};

const MSG_NOT_CHECKED = "count read error is not checked before count is used";
const MSG_BRANCH_NO_EXIT = "count read error branch does not exit before count is used";
const MSG_NOT_A_GUARD = "count read error is only read in an expression that cannot stop count use";
const MSG_EXIT_NOT_DOMINATING = "count read error exit does not dominate count use";
const MSG_FALLBACK = "count must not fall back to another value";
const MSG_HELPER_UNCHECKED = "readCount helper must check error and exit before count is used";
const MSG_HELPER_FALLBACK = "readCount helper must not fall back to a literal count";

function isIdentifier(node: ts.Node, name: string): node is ts.Identifier {
  return ts.isIdentifier(node) && node.text === name;
}

type ResolvedOptions = { options: ts.ObjectLiteralExpression; viaVariable: boolean };

// Strips parentheses, `as X`, `<X>`, `satisfies X` and `!` so wrapped values are seen through.
function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

// The initializer of the nearest enclosing-scope (block or module) const/let with this name.
function findInitializer(name: string, from: ts.Node): ts.Expression | null {
  let scope: ts.Node | undefined = from.parent;
  while (scope) {
    if (ts.isBlock(scope) || ts.isSourceFile(scope)) {
      for (const statement of scope.statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const declaration of statement.declarationList.declarations) {
          if (
            ts.isIdentifier(declaration.name) &&
            declaration.name.text === name &&
            declaration.initializer
          ) {
            return declaration.initializer;
          }
        }
      }
    }
    scope = scope.parent;
  }
  return null;
}

// Follows wrappers and identifier hops (same scope or module scope) to an object literal.
function resolveObject(
  expression: ts.Expression,
  depth = 0,
): { object: ts.ObjectLiteralExpression; viaVariable: boolean } | null {
  const node = unwrap(expression);
  if (ts.isObjectLiteralExpression(node)) return { object: node, viaVariable: false };
  if (!ts.isIdentifier(node) || depth > 5) return null;
  const initializer = findInitializer(node.text, node);
  const resolved = initializer ? resolveObject(initializer, depth + 1) : null;
  return resolved ? { object: resolved.object, viaVariable: true } : null;
}

// The options object is an inline literal or a const object (wrapped or spread) in scope.
function resolveOptions(node: ts.CallExpression): ResolvedOptions | null {
  const argument = node.arguments[1];
  if (!argument) return null;
  const resolved = resolveObject(argument);
  if (!resolved) return null;
  const spreads = resolved.object.properties.some(ts.isSpreadAssignment);
  return { options: resolved.object, viaVariable: resolved.viaVariable || spreads };
}

// Returns the count option value ("exact", "estimated", "<dynamic>") or null when absent.
// A spread of an object that resolves in scope is followed; the last writer wins.
function countOptionMode(options: ts.ObjectLiteralExpression, depth = 0): string | null {
  let mode: string | null = null;
  for (const property of options.properties) {
    if (ts.isSpreadAssignment(property) && depth <= 5) {
      const spread = resolveObject(property.expression);
      const inner = spread ? countOptionMode(spread.object, depth + 1) : null;
      if (inner !== null) mode = inner;
    } else if (
      (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
      isIdentifier(property.name, "count")
    ) {
      mode =
        ts.isPropertyAssignment(property) && ts.isStringLiteral(unwrap(property.initializer))
          ? (unwrap(property.initializer) as ts.StringLiteral).text
          : "<dynamic>";
    }
  }
  return mode;
}

function hasHeadBeforeCount(options: ts.ObjectLiteralExpression): boolean {
  const names = options.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) return [];
    return [property.name.text];
  });
  return names.indexOf("head") >= 0 && names.indexOf("head") < names.indexOf("count");
}

function isInsideNamedCall(node: ts.Node, objectName: string, methodName: string): boolean {
  let current: ts.Node | undefined = node.parent;
  while (current) {
    if (
      ts.isCallExpression(current) &&
      ts.isPropertyAccessExpression(current.expression) &&
      isIdentifier(current.expression.expression, objectName) &&
      current.expression.name.text === methodName
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function isInsideReadCount(node: ts.Node): boolean {
  let current: ts.Node | undefined = node.parent;
  while (current) {
    if (ts.isCallExpression(current) && isIdentifier(current.expression, "readCount")) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function getDirectBinding(node: ts.CallExpression): {
  binding: ts.ObjectBindingPattern;
  declarationEnd: number;
} | null {
  let current: ts.Node | undefined = node.parent;
  while (current) {
    if (ts.isVariableDeclaration(current) && current.initializer) {
      const start = current.initializer.getStart();
      const end = current.initializer.getEnd();
      if (
        node.getStart() >= start &&
        node.getEnd() <= end &&
        ts.isObjectBindingPattern(current.name)
      ) {
        return { binding: current.name, declarationEnd: current.parent.getEnd() };
      }
    }
    current = current.parent;
  }
  return null;
}

function bindingName(property: ts.BindingElement): string | null {
  if (property.propertyName && ts.isIdentifier(property.propertyName)) return property.propertyName.text;
  return ts.isIdentifier(property.name) ? property.name.text : null;
}

function hasBinding(binding: ts.ObjectBindingPattern, name: string): boolean {
  return binding.elements.some(
    (element) => ts.isBindingElement(element) && bindingName(element) === name,
  );
}

function helperThrows(sourceFile: ts.SourceFile, helperName: string): boolean {
  let throws = false;
  const visit = (node: ts.Node) => {
    if (ts.isThrowStatement(node)) throws = true;
    ts.forEachChild(node, visit);
  };

  const findHelper = (node: ts.Node) => {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      isIdentifier(node.name, helperName) &&
      node.body
    ) {
      visit(node.body);
    }
    ts.forEachChild(node, findHelper);
  };
  findHelper(sourceFile);
  return throws;
}

// A same-body statement, before the use, calling a throwing helper with the error.
function isThrowingHelperStatement(
  node: ts.Identifier,
  use: ts.Node,
  sourceFile: ts.SourceFile,
): boolean {
  const call = node.parent;
  const statement = call.parent;
  return (
    ts.isCallExpression(call) &&
    call.arguments.some((argument) => argument === node) &&
    ts.isIdentifier(call.expression) &&
    helperThrows(sourceFile, call.expression.text) &&
    ts.isExpressionStatement(statement) &&
    dominates(statement, use)
  );
}

function enclosingFunction(node: ts.Node): ts.Node {
  let current: ts.Node = node.parent;
  while (!ts.isSourceFile(current) && !ts.isFunctionLike(current)) current = current.parent;
  return current;
}

// The statement is a direct child of a block (or module) that also contains the use, in the
// same function body, and ends before the use starts. Approximates control-flow dominance:
// a check in a nested block, callback or never-called function does not qualify.
function dominates(statement: ts.Node, use: ts.Node): boolean {
  const container = statement.parent;
  return (
    (ts.isBlock(container) || ts.isSourceFile(container)) &&
    isInside(use, container) &&
    enclosingFunction(statement) === enclosingFunction(use) &&
    (statement.getEnd() <= use.getStart() ||
      (ts.isIfStatement(statement) && isInside(use, statement.expression)))
  );
}

function statementExits(statement: ts.Statement | undefined): boolean {
  if (!statement) return false;
  if (ts.isReturnStatement(statement) || ts.isThrowStatement(statement)) return true;
  if (ts.isBlock(statement)) return statement.statements.some(statementExits);
  if (ts.isIfStatement(statement)) {
    return statementExits(statement.thenStatement) && statementExits(statement.elseStatement);
  }
  return false;
}

// A real reference to a binding, not a property name such as `{ count: x }` or `a.error`.
function isReference(node: ts.Identifier): boolean {
  const parent = node.parent;
  if (ts.isPropertyAssignment(parent) && parent.name === node) return false;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  return true;
}

// The if statement whose CONDITION contains this identifier, if any.
function conditionIf(node: ts.Identifier): ts.IfStatement | null {
  let child: ts.Node = node;
  let current: ts.Node | undefined = node.parent;
  while (current) {
    if (ts.isIfStatement(current) && current.expression === child) return current;
    if (ts.isStatement(current)) return null;
    child = current;
    current = current.parent;
  }
  return null;
}

function exitsButDoesNotDominate(error: ts.Identifier): boolean {
  const statement = conditionIf(error);
  if (!statement) return false;
  const negated =
    ts.isPrefixUnaryExpression(error.parent) &&
    error.parent.operator === ts.SyntaxKind.ExclamationToken;
  return statementExits(negated ? statement.elseStatement : statement.thenStatement);
}

function isInside(node: ts.Node, container: ts.Node | undefined): boolean {
  return !!container && node.getStart() >= container.getStart() && node.getEnd() <= container.getEnd();
}

// The error branch must leave, or every count use must sit in the success branch
// (or in the condition itself, as in `error || typeof count !== "number"`).
function ifGuardsCount(error: ts.Identifier, counts: ts.Identifier[]): boolean {
  const statement = conditionIf(error);
  if (!statement) return false;
  const negated =
    ts.isPrefixUnaryExpression(error.parent) &&
    error.parent.operator === ts.SyntaxKind.ExclamationToken;
  const errorBranch = negated ? statement.elseStatement : statement.thenStatement;
  const okBranch = negated ? statement.thenStatement : statement.elseStatement;
  const confined =
    !!okBranch &&
    counts.every((count) => isInside(count, statement.expression) || isInside(count, okBranch));
  return confined || (statementExits(errorBranch) && dominates(statement, counts[0]));
}

// Any fallback on a count binding (`count ?? x`, `count || x`, wrapped in parentheses or a cast).
function isCountFallback(node: ts.BinaryExpression, countNames: Set<string>): boolean {
  const kind = node.operatorToken.kind;
  const left = unwrap(node.left);
  return (
    (kind === ts.SyntaxKind.QuestionQuestionToken ||
      kind === ts.SyntaxKind.BarBarToken ||
      kind === ts.SyntaxKind.QuestionQuestionEqualsToken ||
      kind === ts.SyntaxKind.BarBarEqualsToken) &&
    ts.isIdentifier(left) &&
    countNames.has(left.text)
  );
}

function bindingNames(binding: ts.ObjectBindingPattern, key: string): Set<string> {
  return new Set(
    binding.elements
      .filter((element) => bindingName(element) === key)
      .map((element) => (ts.isIdentifier(element.name) ? element.name.text : key)),
  );
}

// Returns null when the binding's error is checked by an exiting branch and count never
// falls back to a literal; otherwise the finding message.
function bindingProblem(
  sourceFile: ts.SourceFile,
  read: Pick<CountRead, "binding" | "declarationEnd">,
): string | null {
  if (!read.binding || !hasBinding(read.binding, "error") || !hasBinding(read.binding, "count")) {
    return MSG_NOT_CHECKED;
  }
  const errorNames = bindingNames(read.binding, "error");
  const countNames = bindingNames(read.binding, "count");

  const errors: ts.Identifier[] = [];
  const counts: ts.Identifier[] = [];
  let fallback = false;
  const visit = (node: ts.Node) => {
    if (node.getStart() > read.declarationEnd) {
      if (ts.isIdentifier(node) && isReference(node)) {
        if (errorNames.has(node.text)) errors.push(node);
        if (countNames.has(node.text)) counts.push(node);
      }
      if (ts.isBinaryExpression(node) && isCountFallback(node, countNames)) fallback = true;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  counts.sort((a, b) => a.getStart() - b.getStart());
  const firstCountUse = counts[0];
  if (!firstCountUse) return MSG_NOT_CHECKED;
  const before = errors.filter((error) => error.getStart() < firstCountUse.getStart());
  const guarded = before.some(
    (error) => ifGuardsCount(error, counts) || isThrowingHelperStatement(error, firstCountUse, sourceFile),
  );
  if (!guarded) {
    if (before.length === 0) return MSG_NOT_CHECKED;
    if (before.some((error) => exitsButDoesNotDominate(error))) return MSG_EXIT_NOT_DOMINATING;
    return before.some((error) => conditionIf(error)) ? MSG_BRANCH_NO_EXIT : MSG_NOT_A_GUARD;
  }
  return fallback ? MSG_FALLBACK : null;
}

function readCountHelperProblem(sourceFile: ts.SourceFile): string | null {
  let helperFound = false;
  const problems: Array<string | null> = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      isIdentifier(node.name, "readCount") &&
      node.body
    ) {
      helperFound = true;
      const findBinding = (child: ts.Node) => {
        if (ts.isVariableDeclaration(child) && ts.isObjectBindingPattern(child.name)) {
          const binding = child.name;
          if (hasBinding(binding, "count") && hasBinding(binding, "error")) {
            problems.push(
              bindingProblem(sourceFile, { binding, declarationEnd: child.parent.getEnd() }),
            );
          }
        }
        ts.forEachChild(child, findBinding);
      };
      findBinding(node.body);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  if (!helperFound || problems.length === 0) return "readCount helper must check error";
  if (problems.some((problem) => problem === null)) return null;
  return problems[0] === MSG_FALLBACK ? MSG_HELPER_FALLBACK : MSG_HELPER_UNCHECKED;
}

function inspectSource(source: string, fileName = "fixture.ts"): string[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const reads: CountRead[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "select"
    ) {
      const resolved = resolveOptions(node);
      const mode = resolved ? countOptionMode(resolved.options) : null;
      if (resolved && mode !== null) {
        const direct = getDirectBinding(node);
        const detail = resolved.viaVariable
          ? " (options via variable)"
          : mode === "exact"
            ? ""
            : ` (count: ${mode})`;
        reads.push({
          node,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          wrapped: isInsideReadCount(node),
          inPromiseAll: isInsideNamedCall(node, "Promise", "all"),
          headBeforeCount: hasHeadBeforeCount(resolved.options),
          binding: direct?.binding ?? null,
          declarationEnd: direct?.declarationEnd ?? node.getEnd(),
          detail,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return reads.flatMap((read) => {
    const location = `${fileName}:${read.line}`;
    const finding = (message: string) => [`${location} ${message}${read.detail}`];
    if (read.wrapped) {
      const problem = readCountHelperProblem(sourceFile);
      return problem ? finding(problem) : [];
    }
    if (read.inPromiseAll) return finding("count read in Promise.all must use readCount");
    if (!read.binding || !hasBinding(read.binding, "error")) {
      if (read.headBeforeCount) return finding("key-order count read must destructure error");
      return finding("count read must destructure error");
    }
    const problem = bindingProblem(sourceFile, read);
    return problem ? finding(problem) : [];
  });
}

const EXACT_READ = `supabase.from("waitlist").select("*", { count: "exact", head: true })`;
const HELPER_HEAD = `async function readCount(query: PromiseLike<unknown>) { const { count, error } = await query;`;
const WRAPPED_READ = `await readCount(supabase.from("waitlist").select("id", { count: "exact", head: true }));`;

// Round 2 mutants: each stayed green before the exiting-branch and fallback rules.
const ROUND2_MUTANTS: Array<[string, string, string]> = [
  [
    "A founding route logs the error but falls through to count ?? 0",
    `const { count, error, status } = await ${EXACT_READ};\nif (error) console.error("x", { status, code: error.code });\nconst safeCount = count ?? 0;`,
    MSG_BRANCH_NO_EXIT,
  ],
  [
    "C readCount helper logs the error but returns count ?? 0",
    `${HELPER_HEAD} if (error) console.error("x"); return count ?? 0; }\nconst value = ${WRAPPED_READ}`,
    MSG_HELPER_UNCHECKED,
  ],
  [
    "E error only feeds a ternary, count ?? 0 still runs",
    `const { count, error } = await ${EXACT_READ};\nconst note = error ? "e" : "ok";\nconst safeCount = count ?? 0;`,
    MSG_NOT_A_GUARD,
  ],
  [
    "B estimated count with no error destructure",
    `const { count } = await supabase.from("waitlist").select("id", { count: "estimated", head: true });\nconst safeCount = count ?? 0;`,
    'count read must destructure error (count: estimated)',
  ],
  [
    "D options hoisted into a const",
    `const opts = { count: "exact", head: true };\nconst { count } = await supabase.from("waitlist").select("*", opts);\nconst safeCount = count;`,
    "count read must destructure error (options via variable)",
  ],
  [
    "F guarded read still falls back with ??",
    `const { count, error } = await ${EXACT_READ};\nif (error) throw error;\nconst safeCount = count ?? 0;`,
    MSG_FALLBACK,
  ],
  [
    "G guarded read still falls back with ||",
    `const { count, error } = await ${EXACT_READ};\nif (error) return;\nconst safeCount = count || 0;`,
    MSG_FALLBACK,
  ],
  [
    "H readCount helper checks error but falls back to a literal",
    `${HELPER_HEAD} if (error) throw error; return count ?? 0; }\nconst value = ${WRAPPED_READ}`,
    MSG_HELPER_FALLBACK,
  ],
  [
    "I negated check whose exit is on the success side",
    `const { count, error } = await ${EXACT_READ};\nif (!error) return;\nconst safeCount = count;`,
    MSG_BRANCH_NO_EXIT,
  ],
];

// Round 3 mutants: each stayed green before the dominance, unwrap and fallback-anywhere rules.
const READ_WITH_ERROR = `const { count, error } = await ${EXACT_READ};`;
const NO_ERROR_READ = (options: string) =>
  `const { count } = await supabase.from("waitlist").select("*", ${options});\nconst safeCount = count;`;
const MSG_OPTIONS_VIA_VARIABLE = "count read must destructure error (options via variable)";
const ROUND3_MUTANTS: Array<[string, string, string]> = [
  [
    "N4 error exit nested in an unrelated if block",
    `${READ_WITH_ERROR}\nif (url.length > 999) { if (error) { return null; } }\nconst safeCount = count;`,
    MSG_EXIT_NOT_DOMINATING,
  ],
  [
    "N5 return inside a forEach callback",
    `${READ_WITH_ERROR}\n[1].forEach(() => { if (error) return; });\nconst safeCount = count;`,
    MSG_EXIT_NOT_DOMINATING,
  ],
  [
    "N6 return inside a nested arrow function",
    `${READ_WITH_ERROR}\nconst check = () => { if (error) { return; } };\ncheck();\nconst safeCount = count;`,
    MSG_EXIT_NOT_DOMINATING,
  ],
  [
    "N16 throw inside a never-called function",
    `${READ_WITH_ERROR}\nfunction never() { if (error) throw error; }\nconst safeCount = count;`,
    MSG_EXIT_NOT_DOMINATING,
  ],
  [
    "N3 count ?? a variable",
    `${READ_WITH_ERROR}\nconst fallback = 0;\nif (error) return null;\nconst safeCount = count ?? fallback;`,
    MSG_FALLBACK,
  ],
  [
    "N7 cast around count ?? undefined",
    `${READ_WITH_ERROR}\nif (error) return null;\nconst safeCount = (count ?? undefined) as number;`,
    MSG_FALLBACK,
  ],
  [
    "N8 parenthesised cast count || 0",
    `${READ_WITH_ERROR}\nif (error) return null;\nconst safeCount = (count as number) || 0;`,
    MSG_FALLBACK,
  ],
  [
    "hoisted options with as const (same scope)",
    `const opts = { count: "exact", head: true } as const;\n${NO_ERROR_READ("opts")}`,
    MSG_OPTIONS_VIA_VARIABLE,
  ],
  [
    "hoisted options with as const (module scope)",
    `const opts = { count: "exact", head: true } as const;\nasync function run() {\n${NO_ERROR_READ("opts")}\n}`,
    MSG_OPTIONS_VIA_VARIABLE,
  ],
  [
    "hoisted options with satisfies",
    `const opts = { count: "exact", head: true } satisfies object;\n${NO_ERROR_READ("opts")}`,
    MSG_OPTIONS_VIA_VARIABLE,
  ],
  [
    "hoisted options behind a non-null assertion and parentheses",
    `const opts = { count: "exact", head: true };\n${NO_ERROR_READ("(opts!)")}`,
    MSG_OPTIONS_VIA_VARIABLE,
  ],
  [
    "N10 spread options carry the count option",
    `const base = { count: "exact" } as const;\n${NO_ERROR_READ("{ ...base, head: true }")}`,
    MSG_OPTIONS_VIA_VARIABLE,
  ],
];

// Correct shapes that must stay green (no false alarm).
const INNOCENT_SHAPES: Array<[string, string]> = [
  [
    "founding route: error or bad count returns before count is used",
    `const { count, error, status } = await ${EXACT_READ};\nif (error || typeof count !== "number" || !Number.isFinite(count)) { console.error("x", { status: status ?? 0, code: error?.code ?? "COUNT_UNAVAILABLE" }); return null; }\nconst safeCount = count;\nreturn { count: safeCount };`,
  ],
  [
    "webhook: non-exiting error branch, count used only in the else branch",
    `const { count, error, status } = await ${EXACT_READ};\nif (error || typeof count !== "number") { console.error("x", { status }); } else { if (count >= 3) { go(); } }`,
  ],
  [
    "negated check: count used only in the success branch",
    `const { count, error } = await ${EXACT_READ};\nif (!error) { use(count); } else { console.error("x"); }`,
  ],
  [
    "negated check with an exiting else",
    `const { count, error } = await ${EXACT_READ};\nif (!error) { use(count); } else { throw error; }`,
  ],
  [
    "readCount helper that returns before count is used",
    `${HELPER_HEAD} if (error || typeof count !== "number") { console.error("x"); return null; } return count; }\nconst value = ${WRAPPED_READ}`,
  ],
  [
    "hoisted options with a checked error",
    `const opts = { count: "exact", head: true };\nconst { count, error } = await supabase.from("waitlist").select("*", opts);\nif (error) throw error;\nconst safeCount = count;`,
  ],
  [
    "select without a count option is not a count read",
    `const { data } = await supabase.from("waitlist").select("id", { head: true });\nconst total = data ?? 0;`,
  ],
  [
    "count property names and non-count fallbacks are ignored",
    `const { count, error } = await ${EXACT_READ};\nif (error) return null;\nconst label = other ?? 0;\nreturn { count: count, note: { error: "none" } };`,
  ],
  [
    "hoisted as const options with a checked error",
    `const opts = { count: "exact", head: true } as const;\nconst { count, error } = await supabase.from("waitlist").select("*", opts);\nif (error) throw error;\nconst safeCount = count;`,
  ],
  [
    "spread options with a checked error",
    `const base = { count: "exact" } as const;\nconst { count, error } = await supabase.from("waitlist").select("*", { ...base, head: true });\nif (error) throw error;\nconst safeCount = count;`,
  ],
  [
    "exit in an enclosing block, count used in a nested block",
    `const { count, error } = await ${EXACT_READ};\nif (error) { return null; }\nif (ready) { use(count); }`,
  ],
  [
    "exit and count inside the same try block",
    `try { const { count, error } = await ${EXACT_READ};\nif (error) { return null; }\nuse(count); } catch { return null; }`,
  ],
  [
    "throwing helper statement in the same body",
    `function throwOnError(error: unknown) { if (error) throw error; }\nasync function run() { const { count, error } = await ${EXACT_READ};\nthrowOnError(error);\nreturn count; }`,
  ],
];

describe("security: every Supabase count read checks its own error result", () => {
  it.each([
    [
      "M1 direct read without error",
      `const { count } = await supabase.from("waitlist").select("id", { count: "exact", head: true });`,
      "must destructure error",
    ],
    [
      "M2 error destructured but never checked",
      `const { count, error } = await supabase.from("waitlist").select("id", { count: "exact", head: true });\nconst value = count ?? 0;`,
      "error is not checked before count is used",
    ],
    [
      "M3 Promise.all read bypasses the helper",
      `async function readCount(query: PromiseLike<unknown>) { const { count, error } = await query; if (error) throw error; return count; }\nconst [first, later] = await Promise.all([readCount(supabase.from("waitlist").select("id", { count: "exact", head: true })), second.from("waitlist").select("id", { count: "exact", head: true })]);`,
      "Promise.all must use readCount",
    ],
    [
      "M4 key order is still detected",
      `const { count } = await supabase.from("waitlist").select("id", { head: true, count: "exact" });`,
      "key-order count read must destructure error",
    ],
    [
      "M6 deleted_waitlist is a real table name, not a keyword",
      `const { count, error } = await supabase.from("deleted_waitlist").select("id", { count: "exact", head: true });\nif (error) throw error;\nconst value = count;`,
      null,
    ],
  ])("%s", (_label, source, expectedMessage) => {
    const findings = inspectSource(source);
    if (expectedMessage) {
      expect(findings).toHaveLength(1);
      expect(findings[0]).toContain(expectedMessage);
    } else {
      expect(findings).toEqual([]);
    }
  });

  it("uses distinct diagnostics for the four offending mutant shapes", () => {
    const fixtures = [
      `const { count } = await supabase.from("waitlist").select("id", { count: "exact", head: true });`,
      `const { count, error } = await supabase.from("waitlist").select("id", { count: "exact", head: true });\nconst value = count ?? 0;`,
      `const [later] = await Promise.all([supabase.from("waitlist").select("id", { count: "exact", head: true })]);`,
      `const { count } = await supabase.from("waitlist").select("id", { head: true, count: "exact" });`,
    ];
    const findings = fixtures.map((source) => inspectSource(source)[0]).filter(Boolean);
    expect(findings).toHaveLength(4);
    expect(new Set(findings.map((finding) => finding.replace(/fixture\.ts:\d+ /, ""))).size).toBe(4);
  });

  it.each(ROUND2_MUTANTS)("round 2 mutant %s is red", (_label, source, expectedMessage) => {
    const findings = inspectSource(source);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain(expectedMessage);
  });

  it("round 2 mutants A-E carry five distinct diagnostics", () => {
    const messages = ROUND2_MUTANTS.slice(0, 5).map(
      ([, source]) => inspectSource(source)[0].replace(/fixture\.ts:\d+ /, ""),
    );
    expect(new Set(messages).size).toBe(5);
  });

  it.each(ROUND3_MUTANTS)("round 3 mutant %s is red", (_label, source, expectedMessage) => {
    const findings = inspectSource(source);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain(expectedMessage);
  });

  it("round 3 rules each carry a distinct diagnostic", () => {
    const messages = [ROUND3_MUTANTS[0], ROUND3_MUTANTS[4], ROUND3_MUTANTS[7]].map(([, source]) =>
      inspectSource(source)[0].replace(/fixture\.ts:\d+ /, ""),
    );
    expect(new Set(messages).size).toBe(3);
  });

  it.each(INNOCENT_SHAPES)("innocent shape stays green: %s", (_label, source) => {
    expect(inspectSource(source)).toEqual([]);
  });

  it("does not let a previous guarded read bless a later unguarded read", () => {
    const source = `
      const { count, error } = await first.from("waitlist").select("id", { count: "exact", head: true });
      if (error) throw error;
      const { count: laterCount } = await second.from("waitlist").select("id", { count: "exact", head: true });
      const value = laterCount;
    `;
    expect(inspectSource(source)).toEqual([
      expect.stringContaining("count read must destructure error"),
    ]);
  });

  it("accepts an error passed to a helper that throws", () => {
    const source = `
      function throwOnError(error: unknown) { if (error) throw error; }
      const { count, error } = await supabase.from("waitlist").select("id", { count: "exact", head: true });
      throwOnError(error);
      const value = count;
    `;
    expect(inspectSource(source)).toEqual([]);
  });

  it("the real source tree gives every count read a checked error", () => {
    const files = listSourceFiles(SRC_ROOT);
    const findings = files.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return inspectSource(source, path.relative(SRC_ROOT, file));
    });

    expect(files.length).toBeGreaterThan(0);
    expect(findings).toEqual([]);
  });
});
