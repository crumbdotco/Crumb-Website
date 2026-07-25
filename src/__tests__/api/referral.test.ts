/**
 * Referral redirect route tests.
 * Validates code format, platform detection from user-agent, unique-visitor
 * click logging via IP-hash upsert (non-blocking on failure), and redirects.
 */

// --- Supabase mock ---
const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));

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

function buildRequest(
  url: string,
  { userAgent, ip }: { userAgent?: string; ip?: string } = {}
): FakeRequest {
  const headers = new Headers();
  if (userAgent) headers.set("user-agent", userAgent);
  if (ip) headers.set("x-forwarded-for", ip);
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
    mockFrom.mockImplementation(() => ({ upsert: mockUpsert }));
    mockCreateClient.mockReturnValue({ from: mockFrom });
    mockUpsert.mockResolvedValue({ error: null });
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.REFERRAL_IP_SALT = "test-salt";
    process.env.NEXT_PUBLIC_APP_STORE_URL = "https://apps.apple.com/app/crumbify";
    process.env.NEXT_PUBLIC_PLAY_STORE_URL =
      "https://play.google.com/store/apps/details?id=crumbify";
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.REFERRAL_IP_SALT;
    delete process.env.NEXT_PUBLIC_APP_STORE_URL;
    delete process.env.NEXT_PUBLIC_PLAY_STORE_URL;
  });

  it("redirects iOS user-agent to the App Store and logs an ios click via upsert", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://apps.apple.com/app/crumbify");
    expect(mockFrom).toHaveBeenCalledWith("referral_clicks");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ code: "ABC123", platform: "ios" }),
      { onConflict: "code,ip_hash", ignoreDuplicates: true }
    );
  });

  it("redirects Android user-agent to the Play Store and logs an android click", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: ANDROID_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://play.google.com/store/apps/details?id=crumbify"
    );
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ code: "ABC123", platform: "android" }),
      { onConflict: "code,ip_hash", ignoreDuplicates: true }
    );
  });

  it("redirects other/desktop user-agents home and logs an other click", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: DESKTOP_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ code: "ABC123", platform: "other" }),
      { onConflict: "code,ip_hash", ignoreDuplicates: true }
    );
  });

  it("redirects to home and does not upsert when code is invalid", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral?code=%20%20", {
      userAgent: IOS_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("redirects to home and does not upsert when code is missing", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral", {
      userAgent: IOS_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("redirects home when the app store env var is unset for iOS", async () => {
    delete process.env.NEXT_PUBLIC_APP_STORE_URL;
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
  });

  it("still redirects when the click upsert rejects", async () => {
    mockUpsert.mockResolvedValueOnce({ error: { message: "upsert failed" } });
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://apps.apple.com/app/crumbify");
  });

  it("still redirects when the upsert call throws", async () => {
    mockUpsert.mockRejectedValueOnce(new Error("network error"));
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://apps.apple.com/app/crumbify");
  });

  it("does not attempt to upsert when Supabase env vars are missing", async () => {
    delete process.env.SUPABASE_URL;
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("does not log the raw IP or user_agent in the inserted payload, only ip_hash", async () => {
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "9.9.9.9",
    });
    await GET(req as unknown as Request);

    const payload = mockUpsert.mock.calls[0][0];
    expect(payload).toHaveProperty("ip_hash");
    expect(payload).not.toHaveProperty("ip");
    expect(payload).not.toHaveProperty("user_agent");
    expect(typeof payload.ip_hash).toBe("string");
    expect(payload.ip_hash).not.toBe("9.9.9.9");
  });

  it("produces different ip_hash values for different IPs", async () => {
    const req1 = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "1.1.1.1",
    });
    await GET(req1 as unknown as Request);
    const hash1 = mockUpsert.mock.calls[0][0].ip_hash;

    mockUpsert.mockClear();

    const req2 = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "2.2.2.2",
    });
    await GET(req2 as unknown as Request);
    const hash2 = mockUpsert.mock.calls[0][0].ip_hash;

    expect(hash1).not.toBe(hash2);
  });

  it("produces a stable ip_hash for the same IP across requests", async () => {
    const req1 = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "5.5.5.5",
    });
    await GET(req1 as unknown as Request);
    const hash1 = mockUpsert.mock.calls[0][0].ip_hash;

    mockUpsert.mockClear();

    const req2 = buildRequest("https://crumbify.co.uk/referral?code=XYZ789", {
      userAgent: ANDROID_UA,
      ip: "5.5.5.5",
    });
    await GET(req2 as unknown as Request);
    const hash2 = mockUpsert.mock.calls[0][0].ip_hash;

    expect(hash1).toBe(hash2);
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
    const headers = new Headers();
    headers.set("user-agent", IOS_UA);
    headers.set("x-real-ip", "8.8.8.8");
    const req = { url: "https://crumbify.co.uk/referral?code=ABC123", headers };

    await GET(req as unknown as Request);

    expect(mockUpsert).toHaveBeenCalled();
    const payload = mockUpsert.mock.calls[0][0];
    expect(payload.ip_hash).toBeTruthy();
  });

  it("does not upsert (but still redirects) when no salt is configured and no service key fallback exists", async () => {
    delete process.env.REFERRAL_IP_SALT;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://apps.apple.com/app/crumbify");
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("falls back to the service role key as salt when REFERRAL_IP_SALT is unset", async () => {
    delete process.env.REFERRAL_IP_SALT;
    const req = buildRequest("https://crumbify.co.uk/referral?code=ABC123", {
      userAgent: IOS_UA,
      ip: "1.2.3.4",
    });
    const res = await GET(req as unknown as Request);

    expect(res.status).toBe(302);
    expect(mockUpsert).toHaveBeenCalled();
  });
});
