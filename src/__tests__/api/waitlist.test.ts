/**
 * Waitlist API route tests
 * Tests validation, Supabase upsert, honeypot, disposable email blocking,
 * origin checking, audit logging, and success/error responses.
 *
 * The mocks must be declared INSIDE jest.mock factory functions (not as
 * outer const references) to avoid the "Cannot access before initialization"
 * hoisting error.
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

// Pull a reference to the mocked createClient AFTER jest.mock has run
import { createClient } from "@supabase/supabase-js";
const mockCreateClient = createClient as jest.Mock;

// --- Rate limit mock ---
jest.mock("@/lib/rate-limit", () => ({
  isRateLimited: jest.fn(() => false),
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

// --- Route under test ---
import { POST } from "../../app/api/waitlist/route";

function buildRequest(body: unknown, overrides?: { origin?: string; honeypot?: boolean }): Request {
  const headers = new Headers({
    "x-forwarded-for": "127.0.0.1",
    "x-real-ip": "127.0.0.1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    origin: overrides?.origin ?? "https://crumbify.co.uk",
    accept: "application/json, text/plain, */*",
    "accept-language": "en-GB,en;q=0.9",
  });

  return {
    json: jest.fn().mockResolvedValue(body),
    headers,
  } as unknown as Request;
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-wire after clearAllMocks
    mockFrom.mockImplementation((table: string) => {
      if (table === "waitlist_audit_log") return { insert: mockInsert };
      return { upsert: mockUpsert };
    });
    mockCreateClient.mockReturnValue({ from: mockFrom, rpc: mockRpc });
    mockUpsert.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ data: false });
    // Ensure env vars are set so getSupabase() does not throw
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  describe("Origin checking", () => {
    it("returns 403 when origin is missing", async () => {
      const req = buildRequest({ email: "user@example.com" }, { origin: "" });
      // Override to remove origin header
      (req.headers as Headers).delete("origin");
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Forbidden" },
        { status: 403 }
      );
    });

    it("returns 403 when origin is a foreign domain", async () => {
      const req = buildRequest({ email: "user@example.com" }, { origin: "https://evil.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Forbidden" },
        { status: 403 }
      );
    });

    it("allows requests from crumbify.co.uk", async () => {
      const req = buildRequest({ email: "user@example.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it("allows requests from www.crumbify.co.uk", async () => {
      const req = buildRequest({ email: "user@example.com" }, { origin: "https://www.crumbify.co.uk" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
  });

  describe("Honeypot", () => {
    it("returns fake success when honeypot field is filled (bot)", async () => {
      const req = buildRequest({ email: "bot@spam.com", website: "http://spam.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
      // Should NOT insert into database
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  describe("Disposable email blocking", () => {
    it("returns 400 for guerrillamail.com", async () => {
      const req = buildRequest({ email: "x@guerrillamail.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Please use a real email address" },
        { status: 400 }
      );
    });

    it("returns 400 for mailinator.com", async () => {
      const req = buildRequest({ email: "x@mailinator.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Please use a real email address" },
        { status: 400 }
      );
    });
  });

  describe("Input validation", () => {
    it("returns 400 when email is missing", async () => {
      const req = buildRequest({});
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Valid email required" },
        { status: 400 }
      );
    });

    it("returns 400 when email is null", async () => {
      const req = buildRequest({ email: null });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Valid email required" },
        { status: 400 }
      );
    });

    it("returns 400 when email is an empty string", async () => {
      const req = buildRequest({ email: "" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Valid email required" },
        { status: 400 }
      );
    });

    it("returns 400 when email has no @ character", async () => {
      const req = buildRequest({ email: "invalidemail.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Valid email required" },
        { status: 400 }
      );
    });

    it("returns 400 when email is a bare @ with no domain", async () => {
      const req = buildRequest({ email: "@" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Valid email required" },
        { status: 400 }
      );
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it("returns 400 when email is a non-string value", async () => {
      const req = buildRequest({ email: 12345 });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Valid email required" },
        { status: 400 }
      );
    });

    it("returns 400 when email is an object", async () => {
      const req = buildRequest({ email: { toString: () => "x@y.com" } });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Valid email required" },
        { status: 400 }
      );
    });

    it("returns 400 when email has no TLD (no dot after @)", async () => {
      const req = buildRequest({ email: "user@nodot" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Valid email required" },
        { status: 400 }
      );
    });

    it("returns 400 when email is only whitespace", async () => {
      const req = buildRequest({ email: "   " });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Valid email required" },
        { status: 400 }
      );
    });
  });

  describe("Successful submissions", () => {
    it("returns 200 with success: true for valid email", async () => {
      const req = buildRequest({ email: "user@example.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it("calls Supabase from('waitlist')", async () => {
      const req = buildRequest({ email: "user@example.com" });
      await POST(req);
      expect(mockFrom).toHaveBeenCalledWith("waitlist");
    });

    it("upserts with ignoreDuplicates to protect existing rows", async () => {
      const req = buildRequest({ email: "  User@Example.COM  " });
      await POST(req);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "user@example.com",
          tier: "free",
        }),
        { onConflict: "email", ignoreDuplicates: true }
      );
    });

    it("stores IP and user agent with signup", async () => {
      const req = buildRequest({ email: "user@example.com" });
      await POST(req);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          signup_ip: "127.0.0.1",
          signup_user_agent: expect.stringContaining("Mozilla/5.0"),
        }),
        expect.any(Object)
      );
    });

    it("logs to audit table on successful signup", async () => {
      const req = buildRequest({ email: "user@example.com" });
      await POST(req);
      expect(mockFrom).toHaveBeenCalledWith("waitlist_audit_log");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "user@example.com",
          ip: "127.0.0.1",
          action: "signup_attempt",
          blocked_reason: null,
        })
      );
    });

    it("handles email with subdomain correctly", async () => {
      const req = buildRequest({ email: "user@mail.example.co.uk" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
  });

  describe("Database errors", () => {
    it("returns 500 when Supabase returns an error", async () => {
      mockUpsert.mockResolvedValueOnce({
        error: { message: "DB constraint violation" },
      });
      const req = buildRequest({ email: "user@example.com" });
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to join waitlist" },
        { status: 500 }
      );
    });
  });

  describe("Server errors", () => {
    it("returns 500 when request.json() throws", async () => {
      const req = {
        json: jest.fn().mockRejectedValue(new Error("Malformed JSON")),
        headers: new Headers({
          origin: "https://crumbify.co.uk",
          "x-real-ip": "127.0.0.1",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
          accept: "application/json",
          "accept-language": "en-GB",
        }),
      } as unknown as Request;
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Server error" },
        { status: 500 }
      );
    });
  });

  describe("Environment variables", () => {
    it("creates Supabase client and succeeds when env vars are set", async () => {
      const req = buildRequest({ email: "env@test.com" });
      await POST(req);

      expect(mockFrom).toHaveBeenCalledWith("waitlist");
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it("returns 500 when SUPABASE_URL is missing", async () => {
      delete process.env.SUPABASE_URL;

      const req = buildRequest({ email: "env@test.com" });
      await POST(req);

      expect(mockUpsert).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Server error" },
        { status: 500 }
      );
    });

    it("returns 500 when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const req = buildRequest({ email: "env@test.com" });
      await POST(req);

      expect(mockUpsert).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Server error" },
        { status: 500 }
      );
    });
  });
});
