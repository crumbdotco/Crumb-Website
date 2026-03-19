/**
 * Waitlist API route tests
 * Tests validation, Supabase upsert, success/error responses, and edge cases.
 *
 * The mocks must be declared INSIDE jest.mock factory functions (not as
 * outer const references) to avoid the "Cannot access before initialization"
 * hoisting error.
 */

// --- Supabase mock ---
const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

// Pull a reference to the mocked createClient AFTER jest.mock has run
import { createClient } from "@supabase/supabase-js";
const mockCreateClient = createClient as jest.Mock;

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

function buildRequest(body: unknown): Request {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Request;
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-wire after clearAllMocks
    mockFrom.mockReturnValue({ upsert: mockUpsert });
    mockCreateClient.mockReturnValue({ from: mockFrom });
    mockUpsert.mockResolvedValue({ error: null });
    // Ensure env vars are set so getSupabase() does not throw
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
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
      // Improved validation now correctly rejects "@" as invalid
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

    it("upserts email lowercased and trimmed with tier free", async () => {
      const req = buildRequest({ email: "  User@Example.COM  " });
      await POST(req);
      expect(mockUpsert).toHaveBeenCalledWith(
        { email: "user@example.com", tier: "free" },
        { onConflict: "email" }
      );
    });

    it("upserts with onConflict set to email", async () => {
      const req = buildRequest({ email: "test@domain.org" });
      await POST(req);
      const [, options] = mockUpsert.mock.calls[0];
      expect(options).toEqual({ onConflict: "email" });
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
