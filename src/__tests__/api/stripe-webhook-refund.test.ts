/**
 * Stripe webhook API route tests — refund/cancellation demotion.
 * Tests charge.refunded and payment_intent.canceled handling: the founding-member
 * demotion is a DELETE on waitlist keyed on stripe_payment_id (see route.ts comment
 * for why an UPDATE cannot work: the tier CHECK constraint and
 * trg_prevent_tier_downgrade in the app repo's supabase/migrations/009_waitlist_lockdown.sql).
 *
 * Mocks are declared inside factory functions to avoid hoisting issues, following the
 * pattern in stripe-webhook.test.ts.
 */

// --- Supabase mock ---
const mockDeleteSelect = jest.fn();
const mockDeleteEq = jest.fn(() => ({ select: mockDeleteSelect }));
const mockDelete = jest.fn(() => ({ eq: mockDeleteEq }));
const mockUpsert = jest.fn();
const mockEq = jest.fn().mockResolvedValue({ count: 0 });
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({
  upsert: mockUpsert,
  select: mockSelect,
  delete: mockDelete,
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

import { createClient } from "@supabase/supabase-js";
const mockCreateClient = createClient as jest.Mock;

// --- Stripe mock ---
const mockConstructEvent = jest.fn();
const mockPaymentLinksUpdate = jest.fn().mockResolvedValue({});

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
    paymentLinks: { update: mockPaymentLinksUpdate },
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

describe("POST /api/stripe/webhook — refund demotion", () => {
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockEq.mockResolvedValue({ count: 0 });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockDeleteSelect.mockResolvedValue({ data: [{ email: "founder@example.com" }], error: null });
    mockDeleteEq.mockReturnValue({ select: mockDeleteSelect });
    mockDelete.mockReturnValue({ eq: mockDeleteEq });
    mockFrom.mockReturnValue({
      upsert: mockUpsert,
      select: mockSelect,
      delete: mockDelete,
    });
    mockCreateClient.mockReturnValue({ from: mockFrom });
    mockUpsert.mockResolvedValue({ error: null });
    mockPaymentLinksUpdate.mockResolvedValue({});
    process.env.STRIPE_SECRET_KEY = "sk_test_key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    delete process.env.STRIPE_FOUNDING_PAYMENT_LINK_ID;
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.STRIPE_FOUNDING_PAYMENT_LINK_ID;
  });

  describe("charge.refunded — full refund", () => {
    it("deletes the waitlist row keyed on payment_intent (string) and returns demoted count", async () => {
      const charge = {
        id: "ch_full1",
        refunded: true,
        amount: 999,
        amount_refunded: 999,
        payment_intent: "pi_string123",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "charge.refunded",
        data: { object: charge },
      });

      const req = buildRequest(JSON.stringify(charge), "valid_sig");
      await POST(req);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockDeleteEq).toHaveBeenCalledWith("stripe_payment_id", "pi_string123");
      expect(
        mockDeleteEq.mock.calls.every(([col]) => col === "stripe_payment_id")
      ).toBe(true);
      expect(mockDeleteSelect).toHaveBeenCalledWith("email");
      expect(mockJson).toHaveBeenCalledWith({ received: true, demoted: 1 });
    });

    it("extracts the id when payment_intent is an expanded object", async () => {
      const charge = {
        id: "ch_full2",
        refunded: true,
        amount: 500,
        amount_refunded: 500,
        payment_intent: { id: "pi_object456", object: "payment_intent" },
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "charge.refunded",
        data: { object: charge },
      });

      const req = buildRequest(JSON.stringify(charge), "valid_sig");
      await POST(req);

      expect(mockDeleteEq).toHaveBeenCalledWith("stripe_payment_id", "pi_object456");
      expect(
        mockDeleteEq.mock.calls.every(([col]) => col === "stripe_payment_id")
      ).toBe(true);
    });

    it("falls back to charge.id when payment_intent is absent", async () => {
      const charge = {
        id: "ch_noPI",
        refunded: true,
        amount: 250,
        amount_refunded: 250,
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "charge.refunded",
        data: { object: charge },
      });

      const req = buildRequest(JSON.stringify(charge), "valid_sig");
      await POST(req);

      expect(mockDeleteEq).toHaveBeenCalledWith("stripe_payment_id", "ch_noPI");
      expect(
        mockDeleteEq.mock.calls.every(([col]) => col === "stripe_payment_id")
      ).toBe(true);
    });

    it("treats amount_refunded >= amount as a full refund even if refunded flag is false", async () => {
      const charge = {
        id: "ch_amountMatch",
        refunded: false,
        amount: 100,
        amount_refunded: 100,
        payment_intent: "pi_amountMatch",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "charge.refunded",
        data: { object: charge },
      });

      const req = buildRequest(JSON.stringify(charge), "valid_sig");
      await POST(req);

      expect(mockDeleteEq).toHaveBeenCalledWith("stripe_payment_id", "pi_amountMatch");
      expect(
        mockDeleteEq.mock.calls.every(([col]) => col === "stripe_payment_id")
      ).toBe(true);
    });
  });

  describe("charge.refunded — partial refund", () => {
    it("does not delete and logs a warning on a partial refund", async () => {
      const charge = {
        id: "ch_partial",
        refunded: false,
        amount: 1000,
        amount_refunded: 400,
        payment_intent: "pi_partial",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "charge.refunded",
        data: { object: charge },
      });

      const req = buildRequest(JSON.stringify(charge), "valid_sig");
      await POST(req);

      expect(mockDelete).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        "Partial refund on charge, not demoting founding member:",
        "ch_partial"
      );
      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });
  });

  describe("payment_intent.canceled", () => {
    it("deletes the waitlist row keyed on the payment intent id", async () => {
      const paymentIntent = { id: "pi_canceled1" };
      mockConstructEvent.mockReturnValueOnce({
        type: "payment_intent.canceled",
        data: { object: paymentIntent },
      });

      const req = buildRequest(JSON.stringify(paymentIntent), "valid_sig");
      await POST(req);

      expect(mockDeleteEq).toHaveBeenCalledWith("stripe_payment_id", "pi_canceled1");
      expect(
        mockDeleteEq.mock.calls.every(([col]) => col === "stripe_payment_id")
      ).toBe(true);
      expect(mockJson).toHaveBeenCalledWith({ received: true, demoted: 1 });
    });
  });

  describe("zero-match delete", () => {
    it("returns demoted 0 with no error log when nothing matched", async () => {
      mockDeleteSelect.mockResolvedValueOnce({ data: [], error: null });
      const paymentIntent = { id: "pi_nomatch" };
      mockConstructEvent.mockReturnValueOnce({
        type: "payment_intent.canceled",
        data: { object: paymentIntent },
      });

      const req = buildRequest(JSON.stringify(paymentIntent), "valid_sig");
      await POST(req);

      expect(mockJson).toHaveBeenCalledWith({ received: true, demoted: 0 });
      expect(errorSpy).not.toHaveBeenCalled();
      expect(
        mockDeleteEq.mock.calls.every(([col]) => col === "stripe_payment_id")
      ).toBe(true);
    });
  });

  describe("Supabase error on delete", () => {
    it("logs the error and still returns 200 with received:true", async () => {
      mockDeleteSelect.mockResolvedValueOnce({
        data: null,
        error: { message: "connection reset" },
      });
      const paymentIntent = { id: "pi_dberror" };
      mockConstructEvent.mockReturnValueOnce({
        type: "payment_intent.canceled",
        data: { object: paymentIntent },
      });

      const req = buildRequest(JSON.stringify(paymentIntent), "valid_sig");
      await POST(req);

      expect(errorSpy).toHaveBeenCalledWith(
        "Supabase delete error in refund webhook:",
        "connection reset"
      );
      expect(mockJson).toHaveBeenCalledWith({ received: true });
      expect(
        mockDeleteEq.mock.calls.every(([col]) => col === "stripe_payment_id")
      ).toBe(true);
    });
  });

  describe("missing payment id", () => {
    it("returns 200 without deleting when charge.refunded has no id to key on", async () => {
      const charge = {
        refunded: true,
        amount: 100,
        amount_refunded: 100,
        // no id, no payment_intent
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "charge.refunded",
        data: { object: charge },
      });

      const req = buildRequest(JSON.stringify(charge), "valid_sig");
      await POST(req);

      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });

    it("returns 200 without deleting when payment_intent.canceled has no id", async () => {
      const paymentIntent = {};
      mockConstructEvent.mockReturnValueOnce({
        type: "payment_intent.canceled",
        data: { object: paymentIntent },
      });

      const req = buildRequest(JSON.stringify(paymentIntent), "valid_sig");
      await POST(req);

      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });
  });

  describe("unrelated event types", () => {
    it("does not touch the delete chain for checkout.session.completed", async () => {
      const session = {
        customer_details: { email: "founder@example.com" },
        payment_intent: "pi_unrelated",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: session },
      });

      const req = buildRequest(JSON.stringify(session), "valid_sig");
      await POST(req);

      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("does not touch the delete chain for unknown event types", async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: "customer.created",
        data: { object: {} },
      });

      const req = buildRequest("{}", "valid_sig");
      await POST(req);

      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ received: true });
    });

    it("does not touch the delete chain for payment_intent.succeeded (confusable event with the same id shape)", async () => {
      const paymentIntent = {
        id: "pi_succeeded1",
        receipt_email: "founder@example.com",
      };
      mockConstructEvent.mockReturnValueOnce({
        type: "payment_intent.succeeded",
        data: { object: paymentIntent },
      });

      const req = buildRequest(JSON.stringify(paymentIntent), "valid_sig");
      await POST(req);

      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalled();
    });
  });
});
