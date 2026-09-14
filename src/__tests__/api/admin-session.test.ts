import type { NextRequest } from "next/server";

const mockCookieSet = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

import { NextResponse } from "next/server";
import { POST, isAllowedAdminSessionRequest } from "../../app/api/admin/session/route";

const mockJson = NextResponse.json as jest.Mock;

function makeRequest(
  headers: Record<string, string | null>,
  accessToken: unknown = "test-access-token",
): NextRequest {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
    json: jest.fn().mockResolvedValue({ accessToken }),
  } as unknown as NextRequest;
}

describe("admin session origin protection", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const mutableEnv = process.env as unknown as Record<string, string | undefined>;

  beforeEach(() => {
    jest.clearAllMocks();
    mutableEnv.NODE_ENV = "test";
    mockJson.mockImplementation((body: unknown, init?: ResponseInit) => ({
      body,
      status: init?.status ?? 200,
      cookies: { set: mockCookieSet },
    }));
  });

  afterAll(() => {
    if (originalNodeEnv === undefined) delete mutableEnv.NODE_ENV;
    else mutableEnv.NODE_ENV = originalNodeEnv;
  });

  it.each([
    "https://crumbify.co.uk",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ])("allows the exact origin %s", (origin) => {
    expect(isAllowedAdminSessionRequest(origin, null)).toBe(true);
  });

  it("allows a valid Referer origin only when Origin is absent", () => {
    expect(
      isAllowedAdminSessionRequest(null, "https://crumbify.co.uk/admin/signin"),
    ).toBe(true);
  });

  it("allows localhost origins outside production", () => {
    mutableEnv.NODE_ENV = "development";

    expect(isAllowedAdminSessionRequest("http://localhost:3000", null)).toBe(true);
    expect(isAllowedAdminSessionRequest("http://127.0.0.1:3000", null)).toBe(true);
  });

  it("rejects localhost origins and Referer origins in production", () => {
    mutableEnv.NODE_ENV = "production";

    expect(isAllowedAdminSessionRequest("http://localhost:3000", null)).toBe(false);
    expect(isAllowedAdminSessionRequest("http://127.0.0.1:3000", null)).toBe(false);
    expect(isAllowedAdminSessionRequest(null, "http://localhost:3000/admin/signin")).toBe(false);
    expect(isAllowedAdminSessionRequest(null, "http://127.0.0.1:3000/admin/signin")).toBe(false);
    expect(isAllowedAdminSessionRequest("https://crumbify.co.uk", null)).toBe(true);
    expect(isAllowedAdminSessionRequest(null, "https://crumbify.co.uk/admin/signin")).toBe(true);
  });

  it.each([
    [null, null],
    ["", "https://crumbify.co.uk/admin/signin"],
    ["null", "https://crumbify.co.uk/admin/signin"],
    ["not a url", "https://crumbify.co.uk/admin/signin"],
    ["https://evil.example", "https://crumbify.co.uk/admin/signin"],
    ["https://crumbify.co.uk/admin", null],
    ["https://crumbify.co.uk?next=/admin", null],
    ["http://localhost:3000/admin", null],
    ["http://127.0.0.1:3000?next=/admin", null],
    ["https://crumbify.co.uk.attacker.example", null],
    ["https://admin.crumbify.co.uk", null],
    [null, "not a url"],
    [null, "https://crumbify.co.uk.attacker.example/admin"],
  ])("rejects origin %s and referer %s", (origin, referer) => {
    expect(isAllowedAdminSessionRequest(origin, referer)).toBe(false);
  });

  it("does not fall back to Referer when a present Origin is invalid", async () => {
    const request = makeRequest({
      origin: "https://evil.example",
      referer: "https://crumbify.co.uk/admin/signin",
    });

    await POST(request);

    expect(request.json).not.toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith(
      { error: "forbidden" },
      { status: 403 },
    );
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it("sets the existing cookie attributes after validating a permitted request", async () => {
    const response = await POST(
      makeRequest({ origin: "https://crumbify.co.uk", referer: null }),
    );

    expect(mockJson).toHaveBeenCalledWith({ ok: true });
    expect(mockCookieSet).toHaveBeenCalledWith("sb-access-token", "test-access-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
    expect(response).toEqual(expect.objectContaining({ status: 200 }));
  });

  describe("production preview origins (Vercel builds every non-production branch with NODE_ENV=production)", () => {
    beforeEach(() => {
      mutableEnv.NODE_ENV = "production";
    });

    afterEach(() => {
      delete mutableEnv.VERCEL_ENV;
      delete mutableEnv.VERCEL_URL;
    });

    it("allows the exact www apex in production", () => {
      expect(isAllowedAdminSessionRequest("https://www.crumbify.co.uk", null)).toBe(true);
    });

    it("rejects a lookalike suffix domain", () => {
      expect(isAllowedAdminSessionRequest("https://crumbify.co.uk.evil.com", null)).toBe(false);
    });

    it("rejects a preview host when VERCEL_ENV/VERCEL_URL are unset", () => {
      expect(isAllowedAdminSessionRequest("https://crumb-website-git-preview.vercel.app", null)).toBe(false);
    });

    it("allows the exact Vercel preview host when VERCEL_ENV is preview and it equals VERCEL_URL", () => {
      mutableEnv.VERCEL_ENV = "preview";
      mutableEnv.VERCEL_URL = "crumb-website-git-preview.vercel.app";

      expect(isAllowedAdminSessionRequest("https://crumb-website-git-preview.vercel.app", null)).toBe(true);
    });

    it("rejects a preview host that does not exactly equal VERCEL_URL", () => {
      mutableEnv.VERCEL_ENV = "preview";
      mutableEnv.VERCEL_URL = "crumb-website-git-preview.vercel.app";

      expect(isAllowedAdminSessionRequest("https://some-other-host.vercel.app", null)).toBe(false);
    });

    it("rejects the preview host when VERCEL_ENV is not exactly \"preview\"", () => {
      mutableEnv.VERCEL_ENV = "production";
      mutableEnv.VERCEL_URL = "crumb-website-git-preview.vercel.app";

      expect(isAllowedAdminSessionRequest("https://crumb-website-git-preview.vercel.app", null)).toBe(false);
    });

    it("rejects the preview host when VERCEL_ENV is preview but VERCEL_URL is not set", () => {
      mutableEnv.VERCEL_ENV = "preview";
      delete mutableEnv.VERCEL_URL;

      expect(isAllowedAdminSessionRequest("https://anything.vercel.app", null)).toBe(false);
    });
  });
});
