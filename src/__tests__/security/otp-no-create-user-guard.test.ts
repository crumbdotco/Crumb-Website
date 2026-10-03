/**
 * Static guard (app#964): every `signInWithOtp(` call in src must pass
 * `shouldCreateUser: false`, otherwise the page lets anyone mint a Supabase
 * auth user and spend the shared email quota. Test files are skipped.
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";

const SRC = path.resolve(__dirname, "../..");

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : walk(full);
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) ? [full] : [];
  });
}

/** Returns one message per signInWithOtp call whose argument lacks shouldCreateUser: false. */
export function findCreatingOtpCalls(source: string): string[] {
  const out: string[] = [];
  const re = /signInWithOtp\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < source.length && depth > 0) {
      if (source[i] === "(") depth++;
      else if (source[i] === ")") depth--;
      i++;
    }
    const args = source.slice(start, i - 1);
    if (!/shouldCreateUser\s*:\s*false\b/.test(args)) {
      out.push(`signInWithOtp(${args.trim().slice(0, 60)}) lacks shouldCreateUser: false`);
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
