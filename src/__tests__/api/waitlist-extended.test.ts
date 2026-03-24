/**
 * Extended waitlist API route tests — targeting uncovered lines.
 *
 * Uncovered lines from coverage report:
 *   77-78  — getClientIp: x-forwarded-for fallback (no x-real-ip)
 *   119    — isDbRateLimited catch block (RPC throws)
 *   153    — bot user-agent silent reject
 *   165    — development origin (localhost:3000)
 *   177    — missing accept/accept-language headers
 *   184    — in-memory rate limit (isRateLimited returns true)
 *   206-222 — Turnstile verification (token present + secret present)
 *   226    — Turnstile secret set but no token provided
 *   255-263 — DB rate limit block (isDbRateLimited returns true)
 */

// --- Supabase mock ---
const mockUpsert = jest.fn();
const mockInsert = jest.fn();
const mockRpc = jest.fn();
const mockFrom = jest.fn((table: string) => {
  if (table === "waitlist_audit_log") return { insert: mockInsert };
  return { upsert: mockUpsert };
});

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom, rpc: mockRpc })),
}));

import { createClient } from "@supabase/supabase-js";
const mockCreateClient = createClient as jest.Mock;

// --- Rate limit mock ---
const mockIsRateLimited = jest.fn(() => false);
jest.mock("@/lib/rate-limit", () => ({
  isRateLimited: (...args: unknown[]) => mockIsRateLimited(...args),
}));

// --- Next.js mock ---
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: ResponseInit) => ({
      body,
      status: init?.status ?? 200,
    })),
  },
}));

import { NextResponse } from "next/server";
const mockJson = NextResponse.json as jest.Mock;

// --- Global fetch mock for Turnstile verification ---
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// --- Route under test ---
import { POST } from "../../app/api/waitlist/route";

/** Build a request with full control over headers */
function buildRequest(
  body: unknown,
  opts?: {
    origin?: string;
    userAgent?: string;
    realIp?: string | null;
    forwardedFor?: string | null;
    accept?: string | null;
    acceptLanguage?: string | null;
    country?: string | null;
  },
): Request {
  const headers = new Headers();
  if (opts?.origin !== undefined) {
    if (opts.origin) headers.set("origin", opts.origin);
  } else {
    headers.set("origin", "https://crumbify.co.uk");
  }
  if (opts?.userAgent !== undefined) {
    if (opts.userAgent) headers.set("user-agent", opts.userAgent);
  } else {
    headers.set(
      "user-agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    );
  }
  if (opts?.realIp !== null && opts?.realIp !== undefined) {
    headers.set("x-real-ip", opts.realIp);
  } else if (opts?.realIp === null) {
    // explicitly omit x-real-ip
  } else {
    headers.set("x-real-ip", "127.0.0.1");
  }
  if (opts?.forwardedFor !== null && opts?.forwardedFor !== undefined) {
    headers.set("x-forwarded-for", opts.forwardedFor);
  } else if (opts?.forwardedFor === null) {
    // explicitly omit
  } else {
    headers.set("x-forwarded-for", "127.0.0.1");
  }
  if (opts?.accept !== null && opts?.accept !== undefined) {
    headers.set("accept", opts.accept);
  } else if (opts?.accept === null) {
    // explicitly omit
  } else {
    headers.set("accept", "application/json, text/plain, */*");
  }
  if (opts?.acceptLanguage !== null && opts?.acceptLanguage !== undefined) {
    headers.set("accept-language", opts.acceptLanguage);
  } else if (opts?.acceptLanguage === null) {
    // explicitly omit
  } else {
    headers.set("accept-language", "en-GB,en;q=0.9");
  }
  if (opts?.country) {
    headers.set("x-vercel-ip-country", opts.country);
  }

  return {
    json: jest.fn().mockResolvedValue(body),
    headers,
  } as unknown as Request;
}

describe("POST /api/waitlist — extended coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === "waitlist_audit_log") return { insert: mockInsert };
      return { upsert: mockUpsert };
    });
    mockCreateClient.mockReturnValue({ from: mockFrom, rpc: mockRpc });
    mockUpsert.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ data: false });
    mockIsRateLimited.mockReturnValue(false);
    mockFetch.mockReset();
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NODE_ENV;
  });

  // ---------------------------------------------------------------------------
  // Lines 77-78: getClientIp — x-forwarded-for fallback when x-real-ip absent
  // ---------------------------------------------------------------------------

  describe("getClientIp — x-forwarded-for fallback (lines 77-78)", () => {
    it("uses x-forwarded-for when x-real-ip is missing", async () => {
      const req = buildRequest(
        { email: "user@gmail.com" },
        { realIp: null, forwardedFor: "203.0.113.5, 10.0.0.1" },
      );
      await POST(req);
      // The first entry in x-forwarded-for should be used as the IP
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ signup_ip: "203.0.113.5" }),
        expect.any(Object),
      );
    });

    it("returns 'unknown' when both x-real-ip and x-forwarded-for are missing", async () => {
      const req = buildRequest(
        { email: "user@gmail.com" },
        { realIp: null, forwardedFor: null },
      );
      await POST(req);
      // signup_ip should be null (since ip === 'unknown', route sets it to null)
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ signup_ip: null }),
        expect.any(Object),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Line 119: isDbRateLimited — catch block when RPC throws
  // ---------------------------------------------------------------------------

  describe("isDbRateLimited — RPC failure (line 119)", () => {
    it("falls through when RPC throws (returns false, allows request)", async () => {
      mockRpc.mockRejectedValueOnce(new Error("Function does not exist"));
      const req = buildRequest({ email: "user@gmail.com" });
      await POST(req);
      // Should still insert (RPC error is non-blocking)
      expect(mockUpsert).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
  });

  // ---------------------------------------------------------------------------
  // Line 153: Bot user-agent detection — silent reject
  // ---------------------------------------------------------------------------

  describe("Bot user-agent detection (line 153)", () => {
    const botAgents = [
      "HeadlessChrome/120.0",
      "PhantomJS/2.1",
      "puppeteer-core/21.0",
      "Selenium/4.0",
      "playwright/1.40",
      "python-requests/2.31",
      "python-urllib/3.11",
      "node-fetch/3.0",
      "Go-http-client/2.0",
      "Scrapy/2.11",
      "curl/7.88",
      "wget/1.21",
      "HTTPie/3.2",
      "PostmanRuntime/7.32",
    ];

    it.each(botAgents)("returns fake success for bot UA: %s", async (ua) => {
      const req = buildRequest({ email: "bot@gmail.com" }, { userAgent: ua });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it("returns fake success when user-agent is empty", async () => {
      const req = buildRequest({ email: "bot@gmail.com" }, { userAgent: "" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Line 165: Development origin (localhost:3000)
  // ---------------------------------------------------------------------------

  describe("Development origin (line 165)", () => {
    it("allows localhost:3000 in development mode", async () => {
      process.env.NODE_ENV = "development";
      const req = buildRequest(
        { email: "dev@gmail.com" },
        { origin: "http://localhost:3000" },
      );
      await POST(req);
      // Should proceed (not 403)
      expect(mockJson).not.toHaveBeenCalledWith(
        { error: "Forbidden" },
        { status: 403 },
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Line 177: Missing accept or accept-language headers — silent reject
  // ---------------------------------------------------------------------------

  describe("Missing browser-like headers (line 177)", () => {
    it("returns fake success when accept header is missing", async () => {
      const req = buildRequest(
        { email: "user@gmail.com" },
        { accept: null },
      );
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it("returns fake success when accept-language header is missing", async () => {
      const req = buildRequest(
        { email: "user@gmail.com" },
        { acceptLanguage: null },
      );
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Line 184: In-memory rate limit fires
  // ---------------------------------------------------------------------------

  describe("In-memory rate limit (line 184)", () => {
    it("returns 429 when in-memory rate limit is exceeded", async () => {
      mockIsRateLimited.mockReturnValue(true);
      const req = buildRequest({ email: "user@gmail.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Lines 206-222: Turnstile verification (token + secret present)
  // ---------------------------------------------------------------------------

  describe("Turnstile verification (lines 206-222)", () => {
    it("allows request when Turnstile verification succeeds", async () => {
      process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret";
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      });

      const req = buildRequest({
        email: "user@gmail.com",
        turnstileToken: "valid-token",
      });
      await POST(req);
      // Turnstile verification should have been called
      expect(mockFetch).toHaveBeenCalledWith(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        expect.objectContaining({ method: "POST" }),
      );
      // Request should proceed to upsert
      expect(mockUpsert).toHaveBeenCalled();
    });

    it("returns fake success (silent reject) when Turnstile verification fails", async () => {
      process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret";
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false }),
      });

      const req = buildRequest({
        email: "user@gmail.com",
        turnstileToken: "fake-token",
      });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
      // Should NOT upsert — bot with fake token
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Line 226: Turnstile secret set but no token provided
  // ---------------------------------------------------------------------------

  describe("Turnstile — no token when secret is set (line 226)", () => {
    it("returns 400 with 'Verification required' when token is missing", async () => {
      process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret";
      const req = buildRequest({ email: "user@gmail.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Verification required" },
        { status: 400 },
      );
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Lines 255-263: DB rate limit block (isDbRateLimited returns true)
  // ---------------------------------------------------------------------------

  describe("DB rate limit block (lines 255-263)", () => {
    it("returns 429 when DB rate limit is triggered and logs to audit table", async () => {
      mockRpc.mockResolvedValueOnce({ data: true });
      const req = buildRequest(
        { email: "user@gmail.com" },
        { country: "GB" },
      );
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
      // Should log to audit table with blocked reason
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "user@gmail.com",
          action: "signup_blocked",
          blocked_reason: "rate_limited",
          country: "GB",
        }),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: .edu domain pass through
  // ---------------------------------------------------------------------------

  describe("Email domain edge cases", () => {
    it("allows .edu university emails", async () => {
      const req = buildRequest({ email: "student@stanford.edu" });
      await POST(req);
      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: getCountry returns country from header
  // ---------------------------------------------------------------------------

  describe("getCountry (line 83)", () => {
    it("passes country from x-vercel-ip-country to upsert", async () => {
      const req = buildRequest(
        { email: "user@gmail.com" },
        { country: "US" },
      );
      await POST(req);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ signup_country: "US" }),
        expect.any(Object),
      );
    });

    it("passes null country when x-vercel-ip-country is absent", async () => {
      const req = buildRequest({ email: "user@gmail.com" });
      await POST(req);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ signup_country: null }),
        expect.any(Object),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: audit log error on successful insert (non-critical)
  // ---------------------------------------------------------------------------

  describe("Audit logging edge cases", () => {
    it("still returns success even when audit logging throws", async () => {
      mockInsert.mockRejectedValueOnce(new Error("Audit DB failure"));
      const req = buildRequest({ email: "user@gmail.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
  });
});
