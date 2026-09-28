import { readFileSync, readdirSync } from "fs";
import path from "path";

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

function findCountReads(source: string): number[] {
  const positions: number[] = [];
  const countReadPattern = /\.select\([\s\S]*?\{\s*count\s*:\s*["']exact["'][\s\S]*?\}\)/g;
  for (const match of source.matchAll(countReadPattern)) {
    positions.push(match.index ?? 0);
  }
  return positions;
}

function countReadDestructuresError(source: string, position: number): boolean {
  const declarationStart = Math.max(
    source.lastIndexOf("const", position),
    source.lastIndexOf("let", position),
    source.lastIndexOf("var", position),
  );
  const beforeRead = source.slice(declarationStart, position);
  const directDestructure = /const\s+\{[^}]*\bcount\b[^}]*\berror\b[^}]*\}\s*=\s*await[\s\S]*$/m;
  return directDestructure.test(beforeRead) || /\breadCount\s*\(/.test(beforeRead);
}

describe("security: every Supabase count read handles its error result", () => {
  it.each([
    [
      "direct read without error",
      `const { count } = await supabase.from("waitlist").select("id", { count: "exact", head: true });`,
      false,
    ],
    [
      "direct read destructuring count and error",
      `const { count, error } = await supabase.from("waitlist").select("id", { count: "exact", head: true });`,
      true,
    ],
    [
      "Promise.all read without an error-aware helper",
      `const [waitlist] = await Promise.all([supabase.from("waitlist").select("id", { count: "exact", head: true })]);`,
      false,
    ],
    [
      "read routed through an error-aware helper",
      `const [waitlist] = await Promise.all([readCount(supabase.from("waitlist").select("id", { count: "exact", head: true }))]);`,
      true,
    ],
  ])("%s", (_label, source, expected) => {
    const positions = findCountReads(source);
    expect(positions).toHaveLength(1);
    expect(countReadDestructuresError(source, positions[0])).toBe(expected);
  });

  it("does not let a previous guarded read bless a later unguarded read", () => {
    const source = `
      const { count, error } = await first.from("waitlist").select("id", { count: "exact", head: true });
      const { count: laterCount } = await second.from("waitlist").select("id", { count: "exact", head: true });
    `;
    const positions = findCountReads(source);

    expect(positions).toHaveLength(2);
    expect(positions.map((position) => countReadDestructuresError(source, position))).toEqual([
      true,
      false,
    ]);
  });

  it("the real source tree gives every count read an error-aware destructure", () => {
    const files = listSourceFiles(SRC_ROOT);
    const findings = files.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return findCountReads(source)
        .filter((position) => !countReadDestructuresError(source, position))
        .map((position) => `${path.relative(SRC_ROOT, file)}:${position}`);
    });

    expect(files.length).toBeGreaterThan(0);
    expect(findings).toEqual([]);
  });
});
