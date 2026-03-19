/**
 * Stripe webhook API route tests
 * Tests signature verification, event handling, and Supabase upsert for founding members.
 *
 * Mocks are declared inside factory functions to avoid hoisting issues.
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

function buildRequest(body: string, signature: string): Request {
  return {
    text: jest.fn().mockResolvedValue(body),
    headers: {
      get: (name: string) =>
        name === "stripe-signature" ? signature : null,
    },
  } as unknown as Request;
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({ upsert: mockUpsert });
    mockCreateClient.mockReturnValue({ from: mockFrom });
    mockUpsert.mockResolvedValue({ error: null });
    process.env.STRIPE_SECRET_KEY = "sk_test_key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  describe("Signature verification", () => {
    it("returns 400 when stripe signature is invalid", async () => {
      mockConstructEvent.mockImplementationOnce(() => {
        throw new Error("Signature mismatch");
      });
      const req = buildRequest('{"type":"test"}', "invalid_sig");
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Webhook signature failed" },
        { status: 400 }
      );
    });

    it("does not upsert when signature fails", async () => {
      mockConstructEvent.mockImplementationOnce(() => {
        throw new Error("Signature mismatch");
      });
      const req = buildRequest('{"type":"test"}', "bad_sig");
      await POST(req);
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it("returns 400 when stripe-signature header is missing", async () => {
      const req = {
        text: jest.fn().mockResolvedValue('{"type":"test"}'),
        headers: { get: (_name: string) => null },
      } as unknown as Request;
      await POST(req);
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  describe("checkout.session.completed event", () => {
    it("upserts founding_member record when checkout.session.completed", async () => {
      const session = {
        customer_details: { email: "founder@example.com" },
        payment_intent: "pi_123abc",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      expect(mockUpsert).toHaveBeenCalledWith(
        {
          email: "founder@example.com",
          tier: "founding_member",
          stripe_payment_id: "pi_123abc",
        },
        { onConflict: "email" }
      );
    });

    it("normalises email to lowercase on checkout.session.completed", async () => {
      const session = {
        customer_details: { email: "Founder@Example.COM" },
        payment_intent: "pi_456",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ email: "founder@example.com" }),
        { onConflict: "email" }
      );
    });

    it("returns { received: true } on success", async () => {
      const session = {
        customer_details: { email: "ok@test.com" },
        payment_intent: "pi_ok",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });
  });

  describe("payment_intent.succeeded event", () => {
    it("upserts founding_member record when payment_intent.succeeded", async () => {
      const paymentIntent = {
        receipt_email: "payer@example.com",
        id: "pi_789xyz",
        payment_intent: null,
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "payment_intent.succeeded",
        data: { object: paymentIntent },
      });

      const req = buildRequest(JSON.stringify(paymentIntent), "valid_sig");
      await POST(req);

      expect(mockUpsert).toHaveBeenCalledWith(
        {
          email: "payer@example.com",
          tier: "founding_member",
          stripe_payment_id: "pi_789xyz",
        },
        { onConflict: "email" }
      );
    });

    it("prefers payment_intent over session id for stripe_payment_id", async () => {
      const session = {
        customer_details: { email: "a@b.com" },
        payment_intent: "pi_preferred",
        id: "cs_session",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "payment_intent.succeeded",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ stripe_payment_id: "pi_preferred" }),
        { onConflict: "email" }
      );
    });
  });

  describe("Unknown event types", () => {
    it("returns { received: true } without calling Supabase for unknown events", async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: "customer.created",
        data: { object: { email: "someone@example.com" } },
      });

      const req = buildRequest('{"type":"customer.created"}', "valid_sig");
      await POST(req);

      expect(mockUpsert).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });
  });

  describe("Missing email in event", () => {
    it("does not call Supabase when email is missing from checkout session", async () => {
      const session = {
        customer_details: { email: null },
        receipt_email: null,
        payment_intent: "pi_noemail",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      expect(mockUpsert).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });

    it("does not call Supabase when customer_details is undefined", async () => {
      const session = {
        payment_intent: "pi_noemail2",
        receipt_email: null,
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it("falls back to receipt_email when customer_details.email is null", async () => {
      const session = {
        customer_details: { email: null },
        receipt_email: "fallback@example.com",
        payment_intent: "pi_fallback",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ email: "fallback@example.com" }),
        { onConflict: "email" }
      );
    });
  });

  describe("Environment variables", () => {
    it("processes event and returns received:true regardless of event type", async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: "some.unknown.event",
        data: { object: {} },
      });
      const req = buildRequest("{}", "valid_sig");
      await POST(req);

      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });
  });
});
