import { getAdminEmailAllowlist, isAdminEmail } from "@/lib/admin/auth";

describe("admin email allowlist", () => {
  const originalEnv = process.env.ADMIN_EMAILS;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = originalEnv;
    }
  });

  it("falls back to the default allowlist when ADMIN_EMAILS is unset", () => {
    delete process.env.ADMIN_EMAILS;
    expect(getAdminEmailAllowlist()).toEqual([
      "admin@crumbify.co.uk",
      "ali@crumbify.co.uk",
    ]);
  });

  it("uses ADMIN_EMAILS when configured", () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk,two@crumbify.co.uk";
    expect(getAdminEmailAllowlist()).toEqual([
      "one@crumbify.co.uk",
      "two@crumbify.co.uk",
    ]);
  });

  it("allows a default admin email", () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail("admin@crumbify.co.uk")).toBe(true);
  });

  it("matches case-insensitively and trims whitespace", () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail("  Admin@Crumbify.CO.UK  ")).toBe(true);
  });

  it("rejects an email not on the allowlist", () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail("random@example.com")).toBe(false);
  });

  it("rejects null and undefined emails", () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it("rejects an empty string email", () => {
    expect(isAdminEmail("")).toBe(false);
  });
});
