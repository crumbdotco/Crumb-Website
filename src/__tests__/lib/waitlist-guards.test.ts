import {
  ALLOWED_WAITLIST_EMAIL_DOMAINS,
  isAllowedEmailDomain,
  isAllowedOrigin,
  isBotUserAgent,
  isDisposableEmailDomain,
  isValidEmail,
} from "../../lib/waitlist-guards";

describe("isAllowedEmailDomain", () => {
  it("allows every domain in the exact live-DB allow-list", () => {
    for (const domain of ALLOWED_WAITLIST_EMAIL_DOMAINS) {
      expect(isAllowedEmailDomain(`person@${domain}`)).toBe(true);
    }
  });

  it("allows any .ac.uk subdomain", () => {
    expect(isAllowedEmailDomain("student@city.ac.uk")).toBe(true);
  });

  it("allows any .edu subdomain", () => {
    expect(isAllowedEmailDomain("student@mit.edu")).toBe(true);
  });

  it("rejects a non-allowed domain", () => {
    expect(isAllowedEmailDomain("person@example.com")).toBe(false);
  });
});

describe("isDisposableEmailDomain", () => {
  it("flags a known disposable domain", () => {
    expect(isDisposableEmailDomain("a@mailinator.com")).toBe(true);
  });

  it("does not flag an allowed domain", () => {
    expect(isDisposableEmailDomain("a@gmail.com")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts a well-formed email", () => {
    expect(isValidEmail("person@gmail.com")).toBe(true);
  });

  it("rejects a non-string", () => {
    expect(isValidEmail(123)).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects a value with no @", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("rejects a value over 254 characters", () => {
    expect(isValidEmail(`${"a".repeat(250)}@gmail.com`)).toBe(false);
  });
});

describe("isBotUserAgent", () => {
  it("flags an empty user agent", () => {
    expect(isBotUserAgent("")).toBe(true);
  });

  it("flags a known bot fragment", () => {
    expect(isBotUserAgent("curl/8.0")).toBe(true);
  });

  it("allows a real browser user agent", () => {
    expect(isBotUserAgent("Mozilla/5.0 (iPhone) Safari/604.1")).toBe(false);
  });
});

describe("isAllowedOrigin", () => {
  const env = { nodeEnv: undefined, vercelEnv: undefined };

  it("allows the production origin", () => {
    expect(isAllowedOrigin("https://crumbify.co.uk", env)).toBe(true);
  });

  it("allows the www production origin", () => {
    expect(isAllowedOrigin("https://www.crumbify.co.uk", env)).toBe(true);
  });

  it("rejects an unknown origin", () => {
    expect(isAllowedOrigin("https://evil.example.com", env)).toBe(false);
  });

  it("allows localhost only in development", () => {
    expect(isAllowedOrigin("http://localhost:3000", { nodeEnv: "development", vercelEnv: undefined })).toBe(true);
    expect(isAllowedOrigin("http://localhost:3000", env)).toBe(false);
  });

  it("allows a vercel.app preview origin only when VERCEL_ENV is preview", () => {
    expect(
      isAllowedOrigin("https://crumb-website-abc123.vercel.app", { nodeEnv: undefined, vercelEnv: "preview" }),
    ).toBe(true);
    expect(
      isAllowedOrigin("https://crumb-website-abc123.vercel.app", { nodeEnv: undefined, vercelEnv: "production" }),
    ).toBe(false);
    expect(
      isAllowedOrigin("https://crumb-website-abc123.vercel.app", env),
    ).toBe(false);
  });
});
