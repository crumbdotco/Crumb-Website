/**
 * Extended Stripe webhook API route tests — targeting uncovered lines.
 *
 * Uncovered lines from coverage report:
 *   8   — STRIPE_SECRET_KEY env var missing (getStripe throws)
 *   16  — STRIPE_WEBHOOK_SECRET env var missing (getWebhookSecret throws)
 *   25  — Supabase env vars missing (getSupabase throws)
 *   38  — request.text() throws (failed to read body)
 *   78  — Supabase upsert returns error (logs but returns 200)
 */

// --- Supabase mock ---
const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

import { createClient } from "@supabase/supabase-js";
const mockCreateClient = createClient as jest.Mock;

// --- Stripe mock ---
const mockConstructEvent = jest.fn();

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  }));
});

import Stripe from "stripe";
const MockStripe = Stripe as unknown as jest.Mock;

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
import { POST } from "../../app/api/stripe/webhook/route";

function buildRequest(body: string, signature: string | null): Request {
  return {
    text: jest.fn().mockResolvedValue(body),
    headers: {
      get: (name: string) =>
        name === "stripe-signature" ? signature : null,
    },
  } as unknown as Request;
}

describe("POST /api/stripe/webhook — extended coverage", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockFrom.mockReturnValue({ upsert: mockUpsert });
    mockCreateClient.mockReturnValue({ from: mockFrom });
    mockUpsert.mockResolvedValue({ error: null });
    process.env.STRIPE_SECRET_KEY = "sk_test_key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  // ---------------------------------------------------------------------------
  // Line 8: STRIPE_SECRET_KEY missing — getStripe throws inside try/catch
  // ---------------------------------------------------------------------------

  describe("Missing STRIPE_SECRET_KEY (line 8)", () => {
    it("returns 400 when STRIPE_SECRET_KEY is missing", async () => {
      delete process.env.STRIPE_SECRET_KEY;
      // When STRIPE_SECRET_KEY is deleted, getStripe() throws before reaching
      // the Stripe constructor. The throw is caught by the try/catch at line 46-52.
      // However, since we mock `new Stripe(key)`, the mock always succeeds.
      // We need to make the Stripe constructor check the key.
      MockStripe.mockImplementationOnce((key: string | undefined) => {
        if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is not configured");
        return { webhooks: { constructEvent: mockConstructEvent } };
      });
      const req = buildRequest("{}", "valid_sig");
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Webhook signature failed" },
        { status: 400 },
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Webhook signature verification failed:",
        expect.any(String),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Line 16: STRIPE_WEBHOOK_SECRET missing — getWebhookSecret throws
  // ---------------------------------------------------------------------------

  describe("Missing STRIPE_WEBHOOK_SECRET (line 16)", () => {
    it("returns 400 when STRIPE_WEBHOOK_SECRET is missing", async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      // getWebhookSecret() throws, caught by try/catch at line 46-52.
      // The mock constructEvent is called with (body, sig, getWebhookSecret()).
      // Since getWebhookSecret throws before constructEvent is called,
      // constructEvent never executes. The throw propagates to the catch block.
      // But since we evaluate getWebhookSecret() as an argument to constructEvent,
      // the throw happens before the mock is invoked.
      // However, our mock replaces Stripe constructor entirely, so getStripe()
      // returns the mock. Then .webhooks.constructEvent(body, sig, getWebhookSecret())
      // evaluates getWebhookSecret() first — but getWebhookSecret reads from env vars
      // INSIDE the source code, not through our mock. Since the source code is imported
      // and the function is defined there, it should use process.env at call time.
      //
      // Wait — the issue is that getStripe() in the source reads process.env.STRIPE_SECRET_KEY
      // at runtime. With our mock of Stripe, `new Stripe(key)` always succeeds because
      // the mock doesn't check the key. But getStripe() checks `if (!key)` at line 7.
      // Similarly, getWebhookSecret() checks `if (!secret)` at line 15.
      //
      // Since we deleted STRIPE_WEBHOOK_SECRET, getWebhookSecret() will throw at line 16.
      // This throw occurs at line 47 during argument evaluation.
      // The catch at line 48 catches it and calls console.error.
      const req = buildRequest("{}", "valid_sig");
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Webhook signature failed" },
        { status: 400 },
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Webhook signature verification failed:",
        "STRIPE_WEBHOOK_SECRET environment variable is not configured",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Line 25: Supabase env vars missing — getSupabase throws
  // ---------------------------------------------------------------------------

  describe("Missing Supabase env vars (line 25)", () => {
    it("throws when Supabase env vars are missing during upsert", async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const session = {
        customer_details: { email: "user@test.com" },
        payment_intent: "pi_test",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      // getSupabase() is called at line 66 when the event type matches.
      // It checks process.env.SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
      // Since they're deleted, it throws at line 25.
      // There's no try/catch around the code at lines 54-83, so the throw
      // propagates as an unhandled error in the POST function.
      // The POST function itself has no outer try/catch, so this will be
      // an unhandled rejection. Let's verify it throws.
      await expect(POST(req)).rejects.toThrow(
        "Supabase environment variables are not configured",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Line 38: request.text() throws — failed to read request body
  // ---------------------------------------------------------------------------

  describe("request.text() throws (line 38)", () => {
    it("returns 400 when request.text() rejects", async () => {
      const req = {
        text: jest.fn().mockRejectedValue(new Error("Body stream error")),
        headers: {
          get: (name: string) =>
            name === "stripe-signature" ? "valid_sig" : null,
        },
      } as unknown as Request;
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to read request" },
        { status: 400 },
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Line 78: Supabase upsert returns error — logs error, returns 200
  // ---------------------------------------------------------------------------

  describe("Supabase upsert error (line 78)", () => {
    it("returns { received: true } and logs error when upsert fails", async () => {
      mockUpsert.mockResolvedValueOnce({
        error: { message: "duplicate key violates unique constraint" },
      });

      const session = {
        customer_details: { email: "user@example.com" },
        payment_intent: "pi_upsert_fail",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      // Should still return 200 to Stripe (prevent retries)
      expect(mockJson).toHaveBeenCalledWith({ received: true });
      // Should log the error
      expect(consoleSpy).toHaveBeenCalledWith(
        "Supabase upsert error in webhook:",
        "duplicate key violates unique constraint",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: payment_intent.succeeded with no email at all
  // ---------------------------------------------------------------------------

  describe("payment_intent.succeeded with no email (edge case)", () => {
    it("does not upsert when neither customer_details.email nor receipt_email exist", async () => {
      const paymentIntent = {
        id: "pi_no_email",
        payment_intent: null,
        receipt_email: undefined,
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "payment_intent.succeeded",
        data: { object: paymentIntent },
      });

      const req = buildRequest(JSON.stringify(paymentIntent), "valid_sig");
      await POST(req);

      expect(mockUpsert).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: email is a non-string type (number) — typeof check fails
  // ---------------------------------------------------------------------------

  describe("Non-string email in event data", () => {
    it("does not upsert when email is a number (type check at line 65 fails)", async () => {
      const session = {
        customer_details: { email: 12345 },
        receipt_email: null,
        payment_intent: "pi_bad_email",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      // email is 12345 (truthy) but typeof 12345 !== 'string', so the if block is skipped
      expect(mockUpsert).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: checkout.session.completed with session.id as fallback for paymentId
  // ---------------------------------------------------------------------------

  describe("paymentId fallback to session.id", () => {
    it("uses session.id when payment_intent is undefined", async () => {
      const session = {
        customer_details: { email: "user@example.com" },
        id: "cs_session_123",
        // payment_intent is omitted entirely, so session.payment_intent is undefined
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ stripe_payment_id: "cs_session_123" }),
        { onConflict: "email" },
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: Webhook signature verification logs error details
  // ---------------------------------------------------------------------------

  describe("Webhook signature verification logging", () => {
    it("logs the Error message when constructEvent throws an Error", async () => {
      mockConstructEvent.mockImplementationOnce(() => {
        throw new Error("No matching signature found");
      });
      const req = buildRequest("{}", "invalid_sig");
      await POST(req);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Webhook signature verification failed:",
        "No matching signature found",
      );
    });

    it("logs 'unknown error' when constructEvent throws a non-Error value", async () => {
      mockConstructEvent.mockImplementationOnce(() => {
        throw "string error"; // eslint-disable-line no-throw-literal
      });
      const req = buildRequest("{}", "invalid_sig");
      await POST(req);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Webhook signature verification failed:",
        "unknown error",
      );
    });
  });
});
