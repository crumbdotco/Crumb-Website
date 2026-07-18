/**
 * Referral redirect route tests.
 * Validates code format, platform detection from user-agent, click logging
 * (non-blocking on insert failure), and redirect targets.
 */

// --- Supabase mock ---
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

import { createClient } from "@supabase/supabase-js";
const mockCreateClient = createClient as jest.Mock;

// --- Next.js mock (jsdom test environment has no global Request/Response
// wired the way next/server expects, so provide a minimal redirect shim) ---
jest.mock("next/server", () => ({
  NextResponse: {
    redirect: jest.fn((url: URL, status: number) => ({
      status,
      headers: new Headers({ location: url.toString() }),
    })),
  },
}));

import { GET } from "../../app/referral/route";

type FakeRequest = { url: string; headers: Headers };

function buildRequest(url: string, userAgent?: string): FakeRequest {
  const headers = new Headers();
  if (userAgent) headers.set("user-agent", userAgent);
  return { url, headers };
}

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36";
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

describe("GET /referral", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation(() => ({ insert: mockInsert }));
    mockCreateClient.mockReturnValue({ from: mockFrom });
    mockInsert.mockResolvedValue({ error: null });
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.NEXT_PUBLIC_APP_STORE_URL = "https://apps.apple.com/app/crumbify";
    process.env.NEXT_PUBLIC_PLAY_STORE_URL =
      "https://play.google.com/store/apps/details?id=crumbify";
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_APP_STORE_URL;
    delete process.env.NEXT_PUBLIC_PLAY_STORE_URL;
  });

  it("redirects iOS user-agent to the App Store and logs an ios click", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", IOS_UA);
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://apps.apple.com/app/crumbify");
    expect(mockFrom).toHaveBeenCalledWith("referral_clicks");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ code: "ABC123", platform: "ios", user_agent: IOS_UA })
    );
  });

  it("redirects Android user-agent to the Play Store and logs an android click", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", ANDROID_UA);
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://play.google.com/store/apps/details?id=crumbify"
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ code: "ABC123", platform: "android", user_agent: ANDROID_UA })
    );
  });

  it("redirects other/desktop user-agents home and logs an other click", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", DESKTOP_UA);
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ code: "ABC123", platform: "other", user_agent: DESKTOP_UA })
    );
  });

  it("redirects to home and does not insert when code is invalid", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral?code=%20%20", IOS_UA);
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("redirects to home and does not insert when code is missing", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral", IOS_UA);
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("redirects home when the app store env var is unset for iOS", async () => {
    delete process.env.NEXT_PUBLIC_APP_STORE_URL;
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", IOS_UA);
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
  });

  it("still redirects when the click insert rejects", async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: "insert failed" } });
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", IOS_UA);
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://apps.apple.com/app/crumbify");
  });

  it("still redirects when the insert call throws", async () => {
    mockInsert.mockRejectedValueOnce(new Error("network error"));
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", IOS_UA);
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://apps.apple.com/app/crumbify");
  });

  it("does not attempt to insert when Supabase env vars are missing", async () => {
    delete process.env.SUPABASE_URL;
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", IOS_UA);
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
