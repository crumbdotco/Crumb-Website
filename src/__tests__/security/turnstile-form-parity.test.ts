import fs from "node:fs";
import path from "node:path";

const srcRoot = path.join(process.cwd(), "src");
const routeSource = fs.readFileSync(path.join(srcRoot, "app/api/waitlist/route.ts"), "utf8");
const formSource = fs.readFileSync(path.join(srcRoot, "components/landing/WaitlistForm.tsx"), "utf8");
const hookSource = fs.readFileSync(path.join(srcRoot, "hooks/useWaitlist.ts"), "utf8");

function canRequireTurnstile(source: string): boolean {
  return (
    source.includes("NEXT_PUBLIC_TURNSTILE_SITE_KEY") &&
    source.includes("TURNSTILE_SECRET_KEY") &&
    /turnstileSiteKey\s*&&\s*turnstileSecret/.test(source) &&
    source.includes("turnstileToken")
  );
}

function wiresTokenToWaitlist(source: string): boolean {
  return source.includes("useTurnstile") && source.includes("turnstileToken: token");
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
});
