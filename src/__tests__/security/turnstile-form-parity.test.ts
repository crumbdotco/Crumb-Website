import fs from "node:fs";
import path from "node:path";

const srcRoot = path.join(process.cwd(), "src");
const routeSource = fs.readFileSync(path.join(srcRoot, "app/api/waitlist/route.ts"), "utf8");
const formSource = fs.readFileSync(path.join(srcRoot, "components/landing/WaitlistForm.tsx"), "utf8");
const hookSource = fs.readFileSync(path.join(srcRoot, "hooks/useWaitlist.ts"), "utf8");

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1");
}

function canRequireTurnstile(source: string): boolean {
  const uncommented = stripComments(source);
  return (
    uncommented.includes("NEXT_PUBLIC_TURNSTILE_SITE_KEY") &&
    uncommented.includes("TURNSTILE_SECRET_KEY") &&
    /turnstileSiteKey\s*&&\s*turnstileSecret/.test(uncommented) &&
    uncommented.includes("turnstileToken")
  );
}

function wiresTokenToWaitlist(source: string): boolean {
  const uncommented = stripComments(source);
  return uncommented.includes("useTurnstile") && uncommented.includes("turnstileToken: token");
}

function mountsWidgetWhenConfigured(source: string): boolean {
  const uncommented = stripComments(source);
  return /hasTurnstile\s*&&\s*\(\s*(?:<>\s*)?<Script/.test(uncommented)
    && uncommented.includes('data-testid="waitlist-turnstile"');
}

describe("Turnstile route and form parity", () => {
  it("flags the route shape that can require a token and confirms the real route has it", () => {
    expect(canRequireTurnstile("const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY; const turnstileSecret = process.env.TURNSTILE_SECRET_KEY; if (turnstileSiteKey && turnstileSecret) { turnstileToken; }"))
      .toBe(true);
    expect(canRequireTurnstile("const turnstileSecret = process.env.TURNSTILE_SECRET_KEY; if (turnstileSecret) { turnstileToken; }"))
      .toBe(false);
    expect(canRequireTurnstile(routeSource)).toBe(true);
  });

  it("keeps the hero form wired to the token-bearing waitlist request", () => {
    expect(wiresTokenToWaitlist("const { token } = useTurnstile(); useWaitlist({ turnstileToken: token });")).toBe(true);
    expect(wiresTokenToWaitlist("useWaitlist();")).toBe(false);
    expect(wiresTokenToWaitlist(formSource)).toBe(true);
    expect(formSource).toContain("data-testid=\"waitlist-turnstile\"");
    expect(formSource).toContain("<Script");
    expect(hookSource).toContain("turnstileToken");
  });

  it("does not count a token mentioned only in a comment", () => {
    expect(
      wiresTokenToWaitlist("// turnstileToken: token\nuseWaitlist();"),
    ).toBe(false);
  });

  it("requires the widget to mount from the configured-key condition", () => {
    expect(
      mountsWidgetWhenConfigured(
        'const hasTurnstile = true; {false && <><Script /><div data-testid="waitlist-turnstile" /></>}',
      ),
    ).toBe(false);
    expect(
      mountsWidgetWhenConfigured(
        'const hasTurnstile = true; {hasTurnstile && (<><Script /><div data-testid="waitlist-turnstile" /></>)}',
      ),
    ).toBe(true);
    expect(mountsWidgetWhenConfigured(formSource)).toBe(true);
  });
});
