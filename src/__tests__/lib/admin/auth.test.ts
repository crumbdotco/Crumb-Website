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
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    if (originalEnv === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = originalEnv;
    }
  });

  it("admits nobody when ADMIN_EMAILS is unset", () => {
    delete process.env.ADMIN_EMAILS;
    expect(getAdminEmailAllowlist()).toEqual([]);
    expect(isAdminEmail("anyone@crumbify.co.uk")).toBe(false);
  });

  it("admits nobody when ADMIN_EMAILS is an empty string", () => {
    process.env.ADMIN_EMAILS = "";
    expect(getAdminEmailAllowlist()).toEqual([]);
  });

  it("admits nobody when ADMIN_EMAILS is whitespace/comma only", () => {
    process.env.ADMIN_EMAILS = "  , , ";
    expect(getAdminEmailAllowlist()).toEqual([]);
  });

  it("logs a warning (without leaking any email) when ADMIN_EMAILS is unset", () => {
    delete process.env.ADMIN_EMAILS;
    getAdminEmailAllowlist();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const [message] = warnSpy.mock.calls[0];
    expect(message).toMatch(/ADMIN_EMAILS/);
    expect(message).not.toMatch(/@/);
  });

  it("uses ADMIN_EMAILS when configured", () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk,two@crumbify.co.uk";
    expect(getAdminEmailAllowlist()).toEqual([
      "one@crumbify.co.uk",
      "two@crumbify.co.uk",
    ]);
  });

  it("allows a configured admin email", () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk";
    expect(isAdminEmail("one@crumbify.co.uk")).toBe(true);
  });

  it("matches case-insensitively and trims whitespace on both sides", () => {
    process.env.ADMIN_EMAILS = "  One@Crumbify.CO.UK  ";
    expect(isAdminEmail("  one@crumbify.co.uk  ")).toBe(true);
    expect(isAdminEmail("One@Crumbify.CO.UK")).toBe(true);
  });

  it("rejects an email not on the configured allowlist", () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk";
    expect(isAdminEmail("random@example.com")).toBe(false);
  });

  it("rejects null and undefined emails", () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk";
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it("rejects an empty string email", () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk";
    expect(isAdminEmail("")).toBe(false);
  });
});

describe("requireAdmin", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it("returns null when ADMIN_EMAILS is unset, even with a valid session", async () => {
    delete process.env.ADMIN_EMAILS;
    mockCookieGet.mockReturnValue({ value: "some-access-token" });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "one@crumbify.co.uk" } },
      error: null,
    });

    const { requireAdmin } = await import("@/lib/admin/auth");
    const result = await requireAdmin();

    expect(result).toBeNull();
  });

  it("returns null when there is no session cookie", async () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk";
    mockCookieGet.mockReturnValue(undefined);

    const { requireAdmin } = await import("@/lib/admin/auth");
    const result = await requireAdmin();

    expect(result).toBeNull();
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("returns null when the session email is not on the allowlist", async () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk";
    mockCookieGet.mockReturnValue({ value: "some-access-token" });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "not-admin@example.com" } },
      error: null,
    });

    const { requireAdmin } = await import("@/lib/admin/auth");
    const result = await requireAdmin();

    expect(result).toBeNull();
  });

  it("returns null when the session user has no email", async () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk";
    mockCookieGet.mockReturnValue({ value: "some-access-token" });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: null } },
      error: null,
    });

    const { requireAdmin } = await import("@/lib/admin/auth");
    const result = await requireAdmin();

    expect(result).toBeNull();
  });

  it("returns the user id when the session email is on the allowlist", async () => {
    process.env.ADMIN_EMAILS = "one@crumbify.co.uk,two@crumbify.co.uk";
    mockCookieGet.mockReturnValue({ value: "some-access-token" });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "One@Crumbify.CO.UK" } },
      error: null,
    });

    const { requireAdmin } = await import("@/lib/admin/auth");
    const result = await requireAdmin();

    expect(result).toBe("user-1");
  });
});
