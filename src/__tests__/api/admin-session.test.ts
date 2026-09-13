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
  beforeEach(() => {
    jest.clearAllMocks();
    mockJson.mockImplementation((body: unknown, init?: ResponseInit) => ({
      body,
      status: init?.status ?? 200,
      cookies: { set: mockCookieSet },
    }));
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
});
