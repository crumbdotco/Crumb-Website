import { getAdminEmailAllowlist, isAdminEmail } from "@/lib/admin/auth";

const mockGetUser = jest.fn();
const mockCookieGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({ get: mockCookieGet })),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

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

describe("requireAdmin", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    delete process.env.ADMIN_EMAILS;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns null when there is no session cookie", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const { requireAdmin } = await import("@/lib/admin/auth");
    const result = await requireAdmin();

    expect(result).toBeNull();
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("returns null when the session email is not on the allowlist", async () => {
    mockCookieGet.mockReturnValue({ value: "some-access-token" });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "not-admin@example.com" } },
      error: null,
    });

    const { requireAdmin } = await import("@/lib/admin/auth");
    const result = await requireAdmin();

    expect(result).toBeNull();
  });

  it("returns the user id when the session email is on the allowlist", async () => {
    mockCookieGet.mockReturnValue({ value: "some-access-token" });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "admin@crumbify.co.uk" } },
      error: null,
    });

    const { requireAdmin } = await import("@/lib/admin/auth");
    const result = await requireAdmin();

    expect(result).toBe("user-1");
  });
});
