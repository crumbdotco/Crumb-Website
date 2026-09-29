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
};

function isIdentifier(node: ts.Node, name: string): node is ts.Identifier {
  return ts.isIdentifier(node) && node.text === name;
}

function hasExactCountOption(node: ts.CallExpression): boolean {
  const options = node.arguments[1];
  if (!options || !ts.isObjectLiteralExpression(options)) return false;

  return options.properties.some(
    (property) =>
      ts.isPropertyAssignment(property) &&
      isIdentifier(property.name, "count") &&
      ts.isStringLiteral(property.initializer) &&
      property.initializer.text === "exact",
  );
}

function hasHeadBeforeCount(node: ts.CallExpression): boolean {
  const options = node.arguments[1];
  if (!options || !ts.isObjectLiteralExpression(options)) return false;
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

function isErrorCheckIdentifier(node: ts.Identifier): boolean {
  let current: ts.Node = node.parent;
  while (current) {
    if (
      ts.isIfStatement(current) ||
      ts.isConditionalExpression(current) ||
      ts.isWhileStatement(current) ||
      ts.isDoStatement(current) ||
      ts.isForStatement(current) ||
      ts.isSwitchStatement(current) ||
      ts.isThrowStatement(current)
    ) {
      return true;
    }
    if (ts.isStatement(current)) return false;
    current = current.parent;
  }
  return false;
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

function isPassedToThrowingHelper(node: ts.Identifier, sourceFile: ts.SourceFile): boolean {
  const call = node.parent;
  return (
    ts.isCallExpression(call) &&
    call.arguments.some((argument) => argument === node) &&
    ts.isIdentifier(call.expression) &&
    helperThrows(sourceFile, call.expression.text)
  );
}

function isErrorCheckedBeforeCount(
  sourceFile: ts.SourceFile,
  read: Pick<CountRead, "binding" | "declarationEnd">,
): boolean {
  if (!read.binding || !hasBinding(read.binding, "error") || !hasBinding(read.binding, "count")) {
    return false;
  }

  const errorNames = new Set(
    read.binding.elements
      .filter((element): element is ts.BindingElement => ts.isBindingElement(element))
      .filter((element) => bindingName(element) === "error")
      .map((element) => (ts.isIdentifier(element.name) ? element.name.text : "error")),
  );
  const countNames = new Set(
    read.binding.elements
      .filter((element): element is ts.BindingElement => ts.isBindingElement(element))
      .filter((element) => bindingName(element) === "count")
      .map((element) => (ts.isIdentifier(element.name) ? element.name.text : "count")),
  );

  const errors: ts.Identifier[] = [];
  const counts: ts.Identifier[] = [];
  const visit = (node: ts.Node) => {
    if (node.getStart() > read.declarationEnd && ts.isIdentifier(node)) {
      if (errorNames.has(node.text)) errors.push(node);
      if (countNames.has(node.text)) counts.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  const firstCountUse = counts.sort((a, b) => a.getStart() - b.getStart())[0];
  if (!firstCountUse) return false;
  return errors.some(
    (error) =>
      error.getStart() < firstCountUse.getStart() &&
      (isErrorCheckIdentifier(error) || isPassedToThrowingHelper(error, sourceFile)),
  );
}

function readCountHelperIsChecked(sourceFile: ts.SourceFile): boolean {
  let helperFound = false;
  let helperChecked = false;

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
            helperChecked ||= isErrorCheckedBeforeCount(sourceFile, {
              binding,
              declarationEnd: child.parent.getEnd(),
            });
          }
        }
        ts.forEachChild(child, findBinding);
      };
      findBinding(node.body);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return helperFound && helperChecked;
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
      node.expression.name.text === "select" &&
      hasExactCountOption(node)
    ) {
      const direct = getDirectBinding(node);
      reads.push({
        node,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        wrapped: isInsideReadCount(node),
        inPromiseAll: isInsideNamedCall(node, "Promise", "all"),
        headBeforeCount: hasHeadBeforeCount(node),
        binding: direct?.binding ?? null,
        declarationEnd: direct?.declarationEnd ?? node.getEnd(),
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return reads.flatMap((read) => {
    const location = `${fileName}:${read.line}`;
    if (read.wrapped && readCountHelperIsChecked(sourceFile)) return [];
    if (read.wrapped) return [`${location} readCount helper must check error`];
    if (read.inPromiseAll) return [`${location} count read in Promise.all must use readCount`];
    if (!read.binding || !hasBinding(read.binding, "error")) {
      if (read.headBeforeCount) return [`${location} key-order count read must destructure error`];
      return [`${location} count read must destructure error`];
    }
    if (!isErrorCheckedBeforeCount(sourceFile, read)) {
      return [`${location} count read error is not checked before count is used`];
    }
    return [];
  });
}

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
