/**
 * Stripe webhook API route tests — founder clawback (Stage 4.5 B7 / Crumb-Website#17).
 *
 * Two extensions on top of the existing refund/cancellation demotion:
 *  1. After the waitlist DELETE succeeds, the route calls the
 *     demote_refunded_founder(p_email) RPC once per deleted row so the
 *     matching profile(s) are demoted server-side (not just the waitlist
 *     row removed). A per-row RPC failure is logged without the email
 *     (PII) and does not stop the remaining rows from being processed.
 *  2. The founding-cap check reads get_founding_cap() via src/lib/founding-cap.ts
 *     instead of a hardcoded literal.
 *
 * Mocks follow the pattern in stripe-webhook-refund.test.ts.
 */

// --- Supabase mock ---
const mockDeleteSelect = jest.fn();
const mockDeleteEq = jest.fn(() => ({ select: mockDeleteSelect }));
const mockDelete = jest.fn(() => ({ eq: mockDeleteEq }));
const mockUpsert = jest.fn();
const mockEq = jest.fn().mockResolvedValue({ count: 0 });
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockRpc = jest.fn();
const mockFrom = jest.fn(() => ({
  upsert: mockUpsert,
  select: mockSelect,
  delete: mockDelete,
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom, rpc: mockRpc })),
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
      get: (name: string) => (name === "stripe-signature" ? signature : null),
    },
  } as unknown as Request;
}

describe("POST /api/stripe/webhook — founder clawback RPC", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});

    mockEq.mockResolvedValue({ count: 0 });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockDeleteSelect.mockResolvedValue({ data: [], error: null });
    mockDeleteEq.mockReturnValue({ select: mockDeleteSelect });
    mockDelete.mockReturnValue({ eq: mockDeleteEq });
    mockFrom.mockReturnValue({
      upsert: mockUpsert,
      select: mockSelect,
      delete: mockDelete,
    });
    mockRpc.mockResolvedValue({ data: { found: true, demoted: true, user_ids: ["u1"] }, error: null });
    mockCreateClient.mockReturnValue({ from: mockFrom, rpc: mockRpc });
    mockUpsert.mockResolvedValue({ error: null });
    mockPaymentLinksUpdate.mockResolvedValue({});

    process.env.STRIPE_SECRET_KEY = "sk_test_key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    process.env.STRIPE_FOUNDING_PAYMENT_LINK_ID = "plink_1";
  });

  afterEach(() => {
    errorSpy.mockRestore();
    jest.restoreAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.STRIPE_FOUNDING_PAYMENT_LINK_ID;
  });

  function refundEvent(paymentIntent: string) {
    return {
      type: "payment_intent.canceled",
      data: { object: { id: paymentIntent } },
    };
  }

  it("calls demote_refunded_founder once per deleted row with the exact email, and reports demotedProfiles", async () => {
    mockDeleteSelect.mockResolvedValueOnce({
      data: [{ email: "one@example.com" }, { email: "two@example.com" }],
      error: null,
    });
    mockRpc.mockResolvedValue({ data: { found: true, demoted: true, user_ids: ["u"] }, error: null });

    mockConstructEvent.mockReturnValueOnce(refundEvent("pi_two_rows"));
    const req = buildRequest("{}", "valid_sig");
    await POST(req);

    expect(mockRpc).toHaveBeenCalledWith("demote_refunded_founder", { p_email: "one@example.com" });
    expect(mockRpc).toHaveBeenCalledWith("demote_refunded_founder", { p_email: "two@example.com" });
    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockJson).toHaveBeenCalledWith({ received: true, demoted: 2, demotedProfiles: 2 });
  });

  it("keeps demoting the remaining rows and still returns 200 when one row's RPC call errors, without leaking the email in the log", async () => {
    mockDeleteSelect.mockResolvedValueOnce({
      data: [{ email: "broken@example.com" }, { email: "ok@example.com" }],
      error: null,
    });
    mockRpc
      .mockResolvedValueOnce({ data: null, error: { message: "rpc failed" } })
      .mockResolvedValueOnce({ data: { found: true, demoted: true, user_ids: ["u2"] }, error: null });

    mockConstructEvent.mockReturnValueOnce(refundEvent("pi_partial_fail"));
    const req = buildRequest("{}", "valid_sig");
    const result = await POST(req);

    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockJson).toHaveBeenCalledWith({ received: true, demoted: 2, demotedProfiles: 1 });
    expect(result).toBeDefined();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [, loggedArg] = errorSpy.mock.calls[0];
    expect(String(loggedArg)).not.toContain("broken@example.com");
    expect(String(loggedArg)).not.toContain("@example.com");
  });

  it("counts demotedProfiles as 0 when the RPC reports found but not demoted (already-demoted idempotent replay)", async () => {
    mockDeleteSelect.mockResolvedValueOnce({ data: [{ email: "replay@example.com" }], error: null });
    mockRpc.mockResolvedValueOnce({ data: { found: true, demoted: false, user_ids: [] }, error: null });

    mockConstructEvent.mockReturnValueOnce(refundEvent("pi_replay"));
    const req = buildRequest("{}", "valid_sig");
    await POST(req);

    expect(mockJson).toHaveBeenCalledWith({ received: true, demoted: 1, demotedProfiles: 0 });
  });

  it("makes no RPC call on a partial refund (delete never runs)", async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: "charge.refunded",
      data: {
        object: {
          id: "ch_partial",
          refunded: false,
          amount: 1000,
          amount_refunded: 400,
          payment_intent: "pi_partial",
        },
      },
    });

    const req = buildRequest("{}", "valid_sig");
    await POST(req);

    expect(mockDelete).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("makes no RPC call when the delete matched zero rows", async () => {
    mockDeleteSelect.mockResolvedValueOnce({ data: [], error: null });
    mockConstructEvent.mockReturnValueOnce(refundEvent("pi_nomatch"));

    const req = buildRequest("{}", "valid_sig");
    await POST(req);

    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith({ received: true, demoted: 0, demotedProfiles: 0 });
  });

  describe("founding cap via get_founding_cap()", () => {
    it("deactivates the payment link once the live cap (not the old literal) is reached", async () => {
      mockRpc.mockResolvedValue({ data: 3, error: null });
      mockEq.mockResolvedValue({ count: 3 });

      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: {
          object: {
            customer_details: { email: "capfounder@example.com" },
            payment_intent: "pi_cap",
          },
        },
      });

      const req = buildRequest("{}", "valid_sig");
      await POST(req);

      expect(mockRpc).toHaveBeenCalledWith("get_founding_cap");
      expect(mockPaymentLinksUpdate).toHaveBeenCalledWith("plink_1", { active: false });
    });

    it("does not deactivate the payment link when count is below the live cap", async () => {
      mockRpc.mockResolvedValue({ data: 250, error: null });
      mockEq.mockResolvedValue({ count: 3 });

      mockConstructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: {
          object: {
            customer_details: { email: "belowcap@example.com" },
            payment_intent: "pi_belowcap",
          },
        },
      });

      const req = buildRequest("{}", "valid_sig");
      await POST(req);

      expect(mockPaymentLinksUpdate).not.toHaveBeenCalled();
    });
  });
});
