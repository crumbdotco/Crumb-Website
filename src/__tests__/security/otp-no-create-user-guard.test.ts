/**
 * Static guard (app#964): every `signInWithOtp(` call in src must pass
 * `shouldCreateUser: false`, otherwise the page lets anyone mint a Supabase
 * auth user and spend the shared email quota. Test files are skipped.
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";

const SRC = path.resolve(__dirname, "../..");
const NL = "\n";

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : walk(full);
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) ? [full] : [];
  });
}

/**
 * Blanks comments and the contents of string/template literals (same length,
 * newlines kept) so `// shouldCreateUser: false` or "shouldCreateUser: false"
 * cannot satisfy the guard. A quoted key is therefore not accepted; write it bare.
 */
export function stripCommentsAndStrings(src: string): string {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== NL) {
        out += " ";
        i++;
      }
    } else if (c === "/" && n === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else if (c === '"' || c === "'" || c === "`") {
      out += c;
      i++;
      while (i < src.length && src[i] !== c) {
        if (src[i] === "\\") {
          out += " ";
          i++;
        }
        out += src[i] === NL ? NL : " ";
        i++;
      }
      out += c;
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

/**
 * Index just past the `)` that closes a call whose arguments start at `start`.
 * Strings and comments are skipped only INSIDE the span, so text before the
 * call (a JSX apostrophe, a regex literal) cannot desynchronise the scan.
 */
function findCallEnd(src: string, start: number): number {
  let depth = 1;
  let i = start;
  while (i < src.length && depth > 0) {
    const c = src[i];
    const n = src[i + 1];
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== NL) i++;
    } else if (c === "/" && n === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 2;
    } else if (c === '"' || c === "'" || c === "`") {
      i++;
      while (i < src.length && src[i] !== c) i += src[i] === "\\" ? 2 : 1;
      i++;
    } else {
      if (c === "(") depth++;
      else if (c === ")") depth--;
      i++;
    }
  }
  return i;
}

/** Returns one message per signInWithOtp call whose argument lacks shouldCreateUser: false. */
export function findCreatingOtpCalls(source: string): string[] {
  const out: string[] = [];
  const re = /signInWithOtp\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const start = m.index + m[0].length;
    const span = source.slice(start, findCallEnd(source, start) - 1);
    if (!/shouldCreateUser\s*:\s*false\b/.test(stripCommentsAndStrings(span))) {
      out.push(`signInWithOtp(${span.trim().slice(0, 80)}) lacks shouldCreateUser: false`);
    }
  }
  return out;
}

describe("signInWithOtp never creates users", () => {
  it("red fixture: a bare call is flagged", () => {
    expect(findCreatingOtpCalls("await supabase.auth.signInWithOtp({ email });")).toHaveLength(1);
    expect(
      findCreatingOtpCalls("signInWithOtp({ email, options: { shouldCreateUser: true } })"),
    ).toHaveLength(1);
  });

  it("red mutants: comment or string text cannot satisfy the guard", () => {
    const mutants = [
      "signInWithOtp({ email, // shouldCreateUser: false" + NL + "})",
      "signInWithOtp({ email, /* shouldCreateUser: false */ })",
      "signInWithOtp({ email, note: 'shouldCreateUser: false' })",
    ];
    const results = mutants.map((m) => findCreatingOtpCalls(m));
    results.forEach((r) => expect(r).toHaveLength(1));
    expect(new Set(results.map((r) => r[0])).size).toBe(mutants.length);
  });

  it("red mutants: an earlier JSX apostrophe or regex literal cannot blank a bad call", () => {
    const bad = (opts: string) => `const r = supabase.auth.signInWithOtp({ email, ${opts} });` + NL;
    const mutants = [
      "const T = () => <p>Don't</p>;" + NL + bad("options: {}"),
      "const re = /'/;" + NL + bad("options: { shouldCreateUser: true }"),
    ];
    const results = mutants.map((m) => findCreatingOtpCalls(m));
    results.forEach((r) => expect(r).toHaveLength(1));
    expect(new Set(results.map((r) => r[0])).size).toBe(mutants.length);
    const real = readFileSync(path.join(SRC, "app/admin/signin/SignInClient.tsx"), "utf8");
    expect(findCreatingOtpCalls(real)).toEqual([]);
    expect(
      findCreatingOtpCalls("const T = () => <p>Don't</p>;" + NL + real.replaceAll("shouldCreateUser: false", "")),
    ).toHaveLength(1);
  });

  it("no false alarms: string values containing parens or the key name", () => {
    expect(
      findCreatingOtpCalls(
        "signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: 'https://x.co/a)b' } })",
      ),
    ).toEqual([]);
  });

  it("green fixture: shouldCreateUser: false passes", () => {
    expect(
      findCreatingOtpCalls("signInWithOtp({ email, options: { shouldCreateUser: false } })"),
    ).toEqual([]);
  });

  it("every call site in src passes shouldCreateUser: false", () => {
    const offenders = walk(SRC).flatMap((f) =>
      findCreatingOtpCalls(readFileSync(f, "utf8")).map((msg) => `${path.relative(SRC, f)}: ${msg}`),
    );
    expect(offenders).toEqual([]);
  });
});
